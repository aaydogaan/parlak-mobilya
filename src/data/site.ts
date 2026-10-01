export type NavLink = {
  label: string;
  href: string;
};

export type Service = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  image?: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image?: string;
  author?: string;
};

export type Testimonial = {
  title: string;
  quote: string;
  name: string;
  role: string;
  avatar?: string;
};

export type TeamMember = {
  name: string;
  role: string;
  image?: string;
};

export const site = {
  name: "Parlak Mobilya ve Dekorasyon",
  tagline: "Konya'da 1984'ten Bu Yana 40 Yıllık Zanaat & Özel Ölçü Mobilya",
  phone: "0507 172 11 96",
  phoneRaw: "+905071721196",
  whatsapp: "https://wa.me/905071721196?text=Merhaba,%20mobilya%20projemiz%20i%C3%A7in%20bilgi%20almak%20istiyorum.",
  email: "info@parlakmobilyadekorasyon.com",
  addressLines: ["Horozluhan Mah. Saraycık Sok. No:50", "Selçuklu / Konya"],
  addressHref: "https://maps.google.com/?q=Horozluhan+Mah.+Saraycık+Sok.+No:50+Selçuklu+Konya",
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/parlakmobilyadekorasyon" },
    { label: "Facebook", href: "https://www.facebook.com/" },
    { label: "WhatsApp", href: "https://wa.me/905071721196" },
  ],
  copyright: "Tüm Hakları Saklıdır © Parlak Mobilya ve Dekorasyon - 2026",
};

export const allPagesNav: NavLink[] = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "Hizmetlerimiz", href: "/hizmetler" },
  { label: "Projelerimiz", href: "/projeler" },
  { label: "Galeri", href: "/galeri" },
  { label: "Blog", href: "/blog" },
  { label: "İletişim", href: "/iletisim" },
  { label: "KVKK Aydınlatma", href: "/kvkk" },
  { label: "Gizlilik Politikası", href: "/gizlilik-politikasi" },
];

export const services: Service[] = [
  {
    slug: "konya-mutfak-dolaplari",
    title: "Mutfak Dolabı Modelleri",
    description:
      "Konya mutfak dolapları ve özel ölçü mutfak dolabı çözümleriyle yaşam alanınıza değer katın. Tasarım, üretim ve montaj hizmetlerini Parlak Mobilya güvencesiyle keşfedin.",
    excerpt:
      "Kişiye ve mekana özel tasarlanan, fonksiyonel çekmece sistemleri ve suya dayanıklı lake/akrilik mutfak dolapları.",
    image: "/images/mutfak-dolaplari.webp",
  },
  {
    slug: "modern-gardirop-modelleri",
    title: "Modern Gardırop Modelleri",
    description:
      "Konya gardırop modelleri için özel ölçü tasarım, üretim ve montaj hizmeti sunuyoruz. Modern, sürgülü, aynalı ve LED'li gardırop çözümlerini inceleyin.",
    excerpt:
      "Maksimum depolama alanı sunan sürgülü, kapaklı, aynalı ve LED aydınlatmalı özel ölçü gardırop sistemleri.",
    image: "/images/gardirop.webp",
  },
  {
    slug: "ozel-olcu-vestiyer-modelleri",
    title: "Özel Ölçü Vestiyer Modelleri",
    description:
      "Konya vestiyer modelleri için özel ölçü tasarım, üretim ve montaj hizmeti sunuyoruz. Aynalı, modern ve fonksiyonel vestiyer çözümlerini Parlak Mobilya ve Dekorasyon'da inceleyin.",
    excerpt:
      "Antrenize şıklık ve düzen getiren boy aynalı, ayakkabılıklı ve modern portmanto vestiyer tasarımları.",
    image: "/images/vestiyer.webp",
  },
  {
    slug: "komple-ev-yenileme",
    title: "Komple Ev Yenileme",
    description:
      "Konya komple ev yenileme projelerinde mutfak dolapları, gardırop, vestiyer, TV ünitesi ve tüm yaşam alanı mobilyalarını baştan aşağı yeniliyoruz.",
    excerpt:
      "Evinizin tüm ahşap ve dekorasyon ihtiyaçlarını tek elden, anahtar teslim ve mimari hassasiyetle yeniliyoruz.",
    image: "/images/komple-ev.webp",
  },
  {
    slug: "konya-tv-unitesi",
    title: "Konya TV Ünitesi",
    description:
      "Konya TV ünitesi modelleri için özel ölçü tasarım, üretim ve montaj hizmeti sunuyoruz. Modern, LED aydınlatmalı ve yaşam alanınıza uygun TV ünitelerini keşfedin.",
    excerpt:
      "Salonunuza modern hava katan şömineli, lambiri detaylı, LED ışıklı ve kablo gizleme sistemli TV üniteleri.",
    image: "/images/tv-unitesi.webp",
  },
  {
    slug: "konya-cocuk-odasi",
    title: "Konya Çocuk Odası",
    description:
      "Konya çocuk odası mobilyaları için özel ölçü tasarım, üretim ve montaj hizmeti sunuyoruz. Gardırop, çalışma masası, kitaplık ve fonksiyonel çocuk odası çözümlerini keşfedin.",
    excerpt:
      "Çocuklarınızın büyüme çağında sağlıklı, güvenli ve düzenli ders çalışma/oyun alanları sunan özel mobilyalar.",
    image: "/images/cocuk-odasi.webp",
  },
];

export const featuredServices = services;

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}

export const blogs: BlogPost[] = [
  {
    slug: "ozel-olcu-mobilya-yaptirmadan-once-dikkat-edilmesi-gerekenler",
    title: "Özel Ölçü Mobilya Yaptırmadan Önce Nelere Dikkat Etmelisiniz?",
    date: "10 Eylül 2026",
    author: "Ahmet Parlak",
    excerpt:
      "Özel ölçü mobilya yaptırmadan önce doğru ölçü alma, malzeme seçimi, mekan fonksiyonelliği ve montaj kalitesi hakkında bilmeniz gereken püf noktaları.",
    image: "/images/gardirop.webp",
  },
  {
    slug: "yeni-web-sitemiz-yayinda",
    title: "Yeni Web Sitemiz Yayında!",
    date: "17 Temmuz 2026",
    author: "Parlak Mobilya",
    excerpt:
      "Parlak Mobilya ve Dekorasyon olarak dijital dünyada sizlere daha hızlı, modern ve zengin bir deneyim sunmak için yenilendik.",
    image: "/images/mutfak-dolaplari.webp",
  },
];

export const testimonials: Testimonial[] = [
  {
    title: "Kusursuz İşçilik ve Zamanında Teslimat",
    quote:
      "Ahmet Usta'ya mutfak dolabımızı yaptırdık. Ölçüsü milimetrik oturdu, çekmecelerin ray kalitesi ve işçilik mükemmel. Söz verdikleri tarihte tertemiz teslim ettiler.",
    name: "Mustafa Yılmaz",
    role: "Ev Sahibi — Selçuklu / Konya",
    avatar: "https://framerusercontent.com/images/6zMoIHfe6tXvyx8h6TpiGgkJkLY.png?width=512&height=512",
  },
  {
    title: "Kesinlikle Tavsiye Ediyorum",
    quote:
      "Evimizin tüm vestiyer ve gardırop işlerini Parlak Mobilya yaptı. Kullanılan malzemeler birinci sınıf, montaj ekibi çok kibar ve profesyoneldi.",
    name: "Ayşe Kaya",
    role: "Ev Sahibi — Meram / Konya",
    avatar: "https://framerusercontent.com/images/zjvB6O26TW6AN7Rt1rZz8As2eA.png?width=224&height=224",
  },
  {
    title: "40 Yıllık Tecrübe Farkını Gördük",
    quote:
      "Konya'da dürüst ve zanaatkar marangoz bulmak zor derler ama Parlak Mobilya 40 yıllık tecrübesini hissettirdi. Salon TV ünitemiz herkesin hayran kaldığı bir köşe oldu.",
    name: "Mehmet Torun",
    role: "Ev Sahibi — Karatay / Konya",
    avatar: "https://framerusercontent.com/images/rrzVyfPTweyFjU787i4xwvp2rKk.png?width=512&height=512",
  },
];

export const homeTestimonials = testimonials;
export const reviews = testimonials;
export const featuredBlogs = blogs;
export const listingBlogs = blogs;

export function getBlog(slug: string) {
  return blogs.find((b) => b.slug === slug);
}

export const differentiators = [
  {
    title: "1. Sınıf Ahşap ve Sertifikalı Malzeme",
    body: "Tüm mobilyalarımızda E1 kalite standartlarında neme ve suya dayanıklı MDF lam gövdeler, kaliteli lake ve akrilik kapaklar kullanıyoruz.",
  },
  {
    title: "Dünya Standardı Ray ve Aksesuarlar",
    body: "Sessiz çalışan frenli Samet, Blum ve Hettich mekanizmaları ile uzun yıllar sorunsuz kullanım garantisi sunuyoruz.",
  },
  {
    title: "Ahmet Usta'nın 40 Yıllık Zanaat İmzası",
    body: "Fabrikasyon değil; ölçüsü milimetrik alınan, mekana özel planlanan ve her köşesinde usta eli olan kalıcı çözümler üretiyoruz.",
  },
];

export const legalIntro =
  "Parlak Mobilya ve Dekorasyon olarak web sitemizi ziyaret eden tüm kullanıcılarımızın kişisel verilerinin korunmasına, gizliliğine ve güvenliğine en üst düzeyde önem veriyoruz.";

export const privacySections = [
  {
    title: "1. Kişisel Verilerin Toplanması",
    body: "İletişim formları veya keşif talepleri üzerinden paylaştığınız ad, telefon ve adres bilgileri yalnızca size teklif sunmak ve projenizi gerçekleştirmek amacıyla işlenir.",
  },
  {
    title: "2. Veri Güvenliği",
    body: "Bilgileriniz üçüncü taraflarla ticari amaçlarla asla paylaşılmaz, güvenli sunucularda saklanır.",
  },
  {
    title: "3. Haklarınız",
    body: "KVKK kapsamında dilediğiniz zaman verilerinizin silinmesini veya güncellenmesini info@parlakmobilyadekorasyon.com üzerinden talep edebilirsiniz.",
  },
];

export const termsSections = [
  {
    title: "1. Hizmet Kapsamı",
    body: "Web sitemizde yer alan tüm proje ve hizmetler Parlak Mobilya ve Dekorasyon'un Konya ve çevre illerde sunduğu özel imalat hizmetlerini tanıtmaktadır.",
  },
  {
    title: "2. Fikri Mülkiyet",
    body: "Sitemizde yer alan görseller, metinler ve projeler Parlak Mobilya'ya aittir, izinsiz kopyalanamaz.",
  },
];

export const articleBody = {
  introTitle: "Özel Mobilya Seçiminde Uzman Tavsiyeleri",
  intro:
    "Konya'da 40 yıllık tecrübemizle yaşam alanlarınız için en doğru malzemeyi seçmenize yardımcı oluyoruz.",
  introPoints: [
    "Mekanın havalandırma ve ışık alma durumuna göre malzeme seçimi",
    "Gövde ve kapak uyumu, frenli menteşe kalitesi",
    "Kullanım ergonomisi ve maksimum depolama alanı",
  ],
  sections: [
    {
      title: "Malzeme ve Mekanizma Seçiminin Önemi",
      body: "Kaliteli bir mobilya yalnızca dış görünüşüyle değil, yıllarca bozulmadan çalışan rayları ve menteşeleriyle fark yaratır.",
      points: [
        "E1 standartlarında 1. sınıf MDF lam gövde",
        "Aşınmaya dayanıklı PVC kenar bantlama",
        "Frenli menteşe ve teleskopik çekmece sistemleri",
      ],
    },
  ],
};

export const team: TeamMember[] = [
  {
    name: "Ahmet Parlak",
    role: "Kurucu & Baş Marangoz Ustası (1984'ten Beri)",
    image: "https://framerusercontent.com/images/d63r9zhmLAGhBHQY7GibavQvvA4.png?width=1208&height=1340",
  },
  {
    name: "Murat Parlak",
    role: "Üretim & Atölye Şefi",
    image: "https://framerusercontent.com/images/KUvFci4XSAPFOgtZmkk3bya5Y.png?width=1208&height=1340",
  },
  {
    name: "Hasan Usta",
    role: "Montaj & Uygulama Uzmanı",
    image: "https://framerusercontent.com/images/jJHf91bbbQy5LKWWWCCOcxn4Gc.png?width=1208&height=1340",
  },
  {
    name: "Elif Demir",
    role: "İç Mimari & 3D Tasarım",
    image: "https://framerusercontent.com/images/3ePtToy1ll8FSKOafh2b4UPwm6s.png?width=1202&height=1100",
  },
];

export const howItWorks = [
  {
    title: "1. Ücretsiz Keşif & İhtiyaç Analizi",
    body: "Evinize veya iş yerinize gelerek net ölçü alıyor, beklentilerinizi ve ihtiyaçlarınızı birlikte belirliyoruz.",
  },
  {
    title: "2. 3D Tasarım & Malzeme Seçimi",
    body: "Mekanınıza özel 3D modelleme hazırlıyor; renk, kapak ve aksesuar detaylarını onayınıza sunuyoruz.",
  },
  {
    title: "3. Atölye Üretimi & Titiz Montaj",
    body: "Ahmet Usta'nın gözetiminde Konya'daki atölyemizde özenle üretip, söz verdiğimiz günde temiz montaj yapıyoruz.",
  },
];

export const stats = [
  { value: "40+", label: "Yıllık Zanaat Tecrübesi", hint: "1984'ten beri" },
  { value: "5000+", label: "Tamamlanan Mobilya Projesi", hint: "Konya ve çevresi" },
  { value: "%99", label: "Müşteri Memnuniyeti", hint: "Tavsiye edilen işçilik" },
];
