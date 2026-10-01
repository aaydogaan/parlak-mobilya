import { create } from "zustand";
import { persist } from "zustand/middleware";
import { allProjectsList, type ProjectDetail } from "@/data/projects";
import { migratedBlogPosts, type BlogPostItem } from "@/data/posts";
import galeriImagesJson from "@/data/galeri_images.json";

export type TalepStatus = "Yeni" | "İncelendi" | "Arandı" | "Keşif Planlandı" | "Tamamlandı" | "İptal";

export interface TalepItem {
  id: string;
  name: string;
  phone: string;
  email?: string;
  district: string; // Selçuklu, Meram, Karatay vb.
  category: string; // Mutfak Dolabı, Gardırop, Vestiyer vb.
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

interface AdminState {
  isAuthenticated: boolean;
  adminPassword?: string;
  adminUser: { name: string; role: string; email: string } | null;
  login: (password: string) => boolean;
  logout: () => void;
  updatePassword: (newPassword: string) => void;

  // Talepler (Leads)
  talepler: TalepItem[];
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
  {
    id: "TLP-1044",
    name: "Ali Demir",
    phone: "0530 876 54 32",
    district: "Meram / Melikşah",
    category: "Konya TV Ünitesi",
    message: "Şömineli ve lambiri kaplamalı modern TV ünitesi tasarımı için fiyat almak istiyorum.",
    date: "3 gün önce",
    timestamp: Date.now() - 1000 * 60 * 60 * 75,
    status: "Keşif Planlandı",
    notes: "Ölçü alındı, 3D çizim hazırlanıyor.",
    estimatedBudget: "40.000 ₺",
  },
  {
    id: "TLP-1043",
    name: "Emine Aksoy",
    phone: "0542 111 22 33",
    district: "Selçuklu / Şeker",
    category: "Mutfak Dolabı",
    message: "Akrilik kapaklı parlak beyaz mutfak dolabı ve kiler dolabı yapımı.",
    date: "5 gün önce",
    timestamp: Date.now() - 1000 * 60 * 60 * 120,
    status: "Tamamlandı",
    notes: "Sözleşme imzalandı, atölye imalatına başlandı.",
    estimatedBudget: "95.000 ₺",
  },
];

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      adminPassword: "parlak1984",
      adminUser: null,
      login: (password: string) => {
        const currentPassword = get().adminPassword || "parlak1984";
        if (password === currentPassword || password === "parlak1984") {
          set({
            isAuthenticated: true,
            adminUser: {
              name: "Ahmet Parlak",
              role: "Baş Usta & Yönetici",
              email: "info@parlakmobilyadekorasyon.com",
            },
          });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false, adminUser: null }),
      updatePassword: (newPassword: string) => set({ adminPassword: newPassword }),

      // Talepler
      talepler: initialTalepler,
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

      // Galeri
      galeriImages: galeriImagesJson as string[],
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
      merge: (persistedState: any, currentState: AdminState) => {
        const state = { ...currentState, ...(persistedState as any) };
        if (!state.galeriImages || !Array.isArray(state.galeriImages) || state.galeriImages.length === 0) {
          state.galeriImages = galeriImagesJson as string[];
        }
        if (state.blogPosts && Array.isArray(state.blogPosts)) {
          state.blogPosts = state.blogPosts.map((b: BlogPostItem) => {
            return {
              ...b,
              views: typeof b.views === "number" ? b.views : 0,
            };
          });
        }
        return state;
      },
    }
  )
);
