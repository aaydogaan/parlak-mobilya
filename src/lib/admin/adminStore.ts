import { create } from "zustand";
import { persist } from "zustand/middleware";
import { allProjectsList, type ProjectDetail } from "@/data/projects";
import { migratedBlogPosts, type BlogPostItem } from "@/data/posts";
import galeriImagesJson from "@/data/galeri_images.json";
import { adminLoginServerFn, adminLogoutServerFn, getAdminSessionServerFn } from "@/lib/server/admin";

export type TalepStatus = "Yeni" | "İncelendi" | "Arandı" | "Keşif Planlandı" | "Tamamlandı" | "İptal";

export interface TalepItem {
  id: string;
  name: string;
  phone: string;
  email?: string;
  district: string;
  category: string;
  message: string;
  date: string;
  timestamp: number;
  status: TalepStatus;
  notes?: string;
  estimatedBudget?: string;
}

export interface AdminSettings {
  phone: string;
  phoneRaw: string;
  whatsapp: string;
  email: string;
  addressLines: string[];
  workingHours: string;
}

export interface AdminUserProfile {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface AdminState {
  isAuthenticated: boolean;
  adminUser: AdminUserProfile | null;
  authChecked: boolean;
  checkSession: () => Promise<boolean>;
  login: (email: string, password: string, turnstileToken?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;

  // Talepler (Leads)
  talepler: TalepItem[];
  setTalepler: (talepler: TalepItem[]) => void;
  addTalep: (talep: Omit<TalepItem, "id" | "date" | "timestamp" | "status">) => void;
  updateTalepStatus: (id: string, status: TalepStatus) => void;
  updateTalepNotes: (id: string, notes: string) => void;
  deleteTalep: (id: string) => void;

  // Projeler
  projeler: ProjectDetail[];
  addProje: (proje: ProjectDetail) => void;
  updateProje: (slug: string, data: Partial<ProjectDetail>) => void;
  deleteProje: (slug: string) => void;

  // Blog
  blogPosts: BlogPostItem[];
  setBlogPosts: (posts: BlogPostItem[]) => void;
  addBlogPost: (post: BlogPostItem) => void;
  updateBlogPost: (slug: string, data: Partial<BlogPostItem>) => void;
  deleteBlogPost: (slug: string) => void;
  incrementBlogPostViews: (slug: string) => void;

  // Galeri
  galeriImages: string[];
  setGaleriImages: (images: string[]) => void;
  addGaleriImage: (url: string) => void;
  removeGaleriImage: (url: string) => void;

  // Ayarlar
  settings: AdminSettings;
  updateSettings: (newSettings: Partial<AdminSettings>) => void;
}

const initialTalepler: TalepItem[] = [
  {
    id: "TLP-1048",
    name: "Ayşe Kaya",
    phone: "0532 456 78 90",
    email: "ayse.kaya@gmail.com",
    district: "Selçuklu / Yazır",
    category: "Mutfak Dolabı",
    message: "Yeni aldığımız daire için L tipi lake mutfak dolabı ve ada tezgah yaptırmak istiyoruz. Yerinde keşif rica ediyoruz.",
    date: "Bugün, 14:20",
    timestamp: Date.now() - 1000 * 60 * 35,
    status: "Yeni",
    estimatedBudget: "85.000 ₺ - 120.000 ₺",
  },
  {
    id: "TLP-1047",
    name: "Mustafa Yılmaz",
    phone: "0505 123 45 67",
    email: "mustafa.yilmaz@hotmail.com",
    district: "Meram / Havzan",
    category: "Modern Gardırop",
    message: "Yatak odası için tavana kadar sürgülü ve füme aynalı gardırop projemiz var.",
    date: "Bugün, 11:45",
    timestamp: Date.now() - 1000 * 60 * 180,
    status: "Yeni",
    estimatedBudget: "45.000 ₺ - 60.000 ₺",
  },
  {
    id: "TLP-1046",
    name: "Mehmet Torun",
    phone: "0544 987 65 43",
    district: "Karatay / Fetih",
    category: "Komple Ev Yenileme",
    message: "Eski evimizin mutfak, vestiyer ve salon TV ünitesini komple yenilemek istiyoruz.",
    date: "Dün, 16:30",
    timestamp: Date.now() - 1000 * 60 * 60 * 26,
    status: "İncelendi",
    notes: "Müşteri arandı, Cumartesi saat 14:00'e keşif randevusu verildi.",
    estimatedBudget: "180.000 ₺+",
  },
  {
    id: "TLP-1045",
    name: "Fatma Şahin",
    phone: "0553 321 00 11",
    district: "Selçuklu / Bosna",
    category: "Özel Ölçü Vestiyer",
    message: "Geniş antre için boy aynalı, ayakkabılıklı ve gizli LED'li vestiyer istiyoruz.",
    date: "2 gün önce",
    timestamp: Date.now() - 1000 * 60 * 60 * 50,
    status: "Arandı",
    notes: "WhatsApp üzerinden örnek modeller yollandı.",
    estimatedBudget: "35.000 ₺",
  },
];

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      adminUser: null,
      authChecked: false,

      // Sync with server cryptographic session
      checkSession: async () => {
        try {
          const res = await getAdminSessionServerFn();
          if (res.authenticated && res.user) {
            set({ isAuthenticated: true, adminUser: res.user, authChecked: true });
            return true;
          } else {
            set({ isAuthenticated: false, adminUser: null, authChecked: true });
            return false;
          }
        } catch {
          set({ isAuthenticated: false, adminUser: null, authChecked: true });
          return false;
        }
      },

      // Server-authenticated login (No client credential evaluation)
      login: async (email: string, password: string, turnstileToken?: string) => {
        try {
          const res = await adminLoginServerFn({
            data: { email, password, turnstileToken },
          });

          if (res.success && res.user) {
            set({
              isAuthenticated: true,
              adminUser: res.user,
              authChecked: true,
            });
            return { success: true };
          }
          return { success: false, error: res.error || "Giriş bilgileri hatalı." };
        } catch (err: any) {
          return { success: false, error: err?.message || "Sunucu bağlantı hatası." };
        }
      },

      // Server-side session invalidation on logout
      logout: async () => {
        try {
          await adminLogoutServerFn();
        } catch {
          // ignore
        }
        set({ isAuthenticated: false, adminUser: null, authChecked: true });
      },

      // Talepler
      talepler: initialTalepler,
      setTalepler: (talepler) => set({ talepler }),
      addTalep: (talepData) => {
        const id = `TLP-${Math.floor(1000 + Math.random() * 9000)}`;
        const newTalep: TalepItem = {
          ...talepData,
          id,
          date: "Az önce",
          timestamp: Date.now(),
          status: "Yeni",
        };
        set((state) => ({ talepler: [newTalep, ...state.talepler] }));
      },
      updateTalepStatus: (id, status) =>
        set((state) => ({
          talepler: state.talepler.map((t) => (t.id === id ? { ...t, status } : t)),
        })),
      updateTalepNotes: (id, notes) =>
        set((state) => ({
          talepler: state.talepler.map((t) => (t.id === id ? { ...t, notes } : t)),
        })),
      deleteTalep: (id) =>
        set((state) => ({
          talepler: state.talepler.filter((t) => t.id !== id),
        })),

      // Projeler
      projeler: allProjectsList,
      addProje: (proje) =>
        set((state) => ({ projeler: [proje, ...state.projeler] })),
      updateProje: (slug, data) =>
        set((state) => ({
          projeler: state.projeler.map((p) => (p.slug === slug ? { ...p, ...data } : p)),
        })),
      deleteProje: (slug) =>
        set((state) => ({
          projeler: state.projeler.filter((p) => p.slug !== slug),
        })),

      // Blog
      blogPosts: migratedBlogPosts,
      setBlogPosts: (posts) => set({ blogPosts: posts }),
      addBlogPost: (post) =>
        set((state) => ({ blogPosts: [post, ...state.blogPosts] })),
      updateBlogPost: (slug, data) =>
        set((state) => ({
          blogPosts: state.blogPosts.map((b) => (b.slug === slug ? { ...b, ...data } : b)),
        })),
      deleteBlogPost: (slug) =>
        set((state) => ({
          blogPosts: state.blogPosts.filter((b) => b.slug !== slug),
        })),
      incrementBlogPostViews: (slug) =>
        set((state) => ({
          blogPosts: state.blogPosts.map((b) =>
            b.slug === slug ? { ...b, views: (b.views || 0) + 1 } : b
          ),
        })),

      // Galeri - Live populated from database (no stale scraped thumbnails)
      galeriImages: [],
      setGaleriImages: (images) => set({ galeriImages: images }),
      addGaleriImage: (url) =>
        set((state) => ({ galeriImages: [url, ...state.galeriImages] })),
      removeGaleriImage: (url) =>
        set((state) => ({
          galeriImages: state.galeriImages.filter((img) => img !== url),
        })),

      // Ayarlar
      settings: {
        phone: "0507 172 11 96",
        phoneRaw: "+905071721196",
        whatsapp: "https://wa.me/905071721196",
        email: "info@parlakmobilyadekorasyon.com",
        addressLines: ["Horozluhan Mah. Saraycık Sok. No:50", "Selçuklu / Konya"],
        workingHours: "Pazartesi - Cumartesi: 08:30 - 19:00",
      },
      updateSettings: (newSettings) =>
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),
    }),
    {
      name: "parlak-mobilya-admin-storage-v5",
      // SECURITY: Exclude all authentication and user state from localStorage!
      partialize: (state) => ({
        settings: state.settings,
        projeler: state.projeler,
      }),
    }
  )
);
