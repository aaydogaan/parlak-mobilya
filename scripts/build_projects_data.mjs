import fs from "fs";

const rawProjects = JSON.parse(
  fs.readFileSync("src/data/projects_extracted.json", "utf8")
);

const seoMeta = {
  "konya-mutfak-dolaplari": {
    title: "Mutfak Dolabı Modelleri - Parlak Mobilya ve Dekorasyon",
    metaDesc:
      "Konya mutfak dolapları ve özel ölçü mutfak dolabı çözümleriyle yaşam alanınıza değer katın. Tasarım, üretim ve montaj hizmetlerini Parlak Mobilya ve Dekorasyon güvencesiyle keşfedin.",
    category: "Mutfak Dolapları",
    specs: {
      "Malzeme Kalitesi": "E1 Sertifikalı 1. Sınıf MDF Lam Gövde",
      "Kapak Seçenekleri": "Lake, Akrilik, Membran, High Gloss",
      "Menteşe & Ray": "Frenli Samet / Blum / Hettich Sistemler",
      "Kiler Çözümleri": "Köşe Kör Nokta Kiler Mekanizmaları",
      "Tezgah Uyumlu": "Çimstone, Belenco, Granit, Masif Ahşap",
      "Montaj & Keşif": "Konya İçi Ücretsiz Keşif ve Montaj",
    },
  },
  "modern-gardirop-modelleri": {
    title: "Modern Gardırop Modelleri - Parlak Mobilya ve Dekorasyon",
    metaDesc:
      "Konya gardırop modelleri için özel ölçü tasarım, üretim ve montaj hizmeti sunuyoruz. Modern, sürgülü, aynalı ve LED'li gardırop çözümlerini inceleyin.",
    category: "Yatak Odası & Gardırop",
    specs: {
      "Kapak Tipleri": "Sürgülü, Akordiyon, Menteşeli Kapaklar",
      "İç Düzenleme": "Pantolonluk, Kravatlık, Gizli Kasa, Çekmeceler",
      "Aydınlatma": "Sensörlü Entegre LED Askı Boruları",
      "Ayna & Cam": "Füme, Bronz veya Şeffaf Reflekte Camlar",
      "Gövde Malzemesi": "Çizilmeye Dayanıklı Melamin MDF",
      "Garanti": "5 Yıl Mekanizma ve İmalat Garantisi",
    },
  },
  "ozel-olcu-vestiyer-modelleri": {
    title: "Özel Ölçü Vestiyer Modelleri - Parlak Mobilya ve Dekorasyon",
    metaDesc:
      "Konya vestiyer modelleri için özel ölçü tasarım, üretim ve montaj hizmeti sunuyoruz. Aynalı, modern ve fonksiyonel vestiyer çözümlerini Parlak Mobilya ve Dekorasyon'da inceleyin.",
    category: "Antre & Vestiyer",
    specs: {
      "Tasarım": "Tavana Kadar Sıfır Boşluklu Tasarım",
      "Depolama": "Geniş Ayakkabılık, Çekmeceli Çanta/Anahtarlık Bölmesi",
      "Konfor": "Döşemeli Yumuşak Oturma Pufu & Askılıklar",
      "Ayna": "Boy Aynası ve Arkası Gizli Dolap",
      "Havalandırma": "Ayakkabılık Özel Hava Menfezleri",
      "Uygulama": "Konya Merkez, Selçuklu, Meram, Karatay",
    },
  },
  "komple-ev-yenileme": {
    title: "Komple Ev Yenileme - Parlak Mobilya ve Dekorasyon",
    metaDesc:
      "Konya komple ev yenileme projelerinde mutfak dolapları, gardırop, vestiyer, TV ünitesi ve yaşam alanı mobilyalarını özel ölçü tasarım, üretim ve montaj hizmetiyle yeniliyoruz.",
    category: "Anahtar Teslim Yenileme",
    specs: {
      "Kapsam": "Mutfak, Banyo, Kapılar, Vestiyer, TV Ünitesi, Giyinme Odası",
      "Planlama": "3D Mimari Modelleme ve Yerinde Projelendirme",
      "Usta Kadrosu": "Ahmet Usta Önderliğinde 40 Yıllık Deneyimli Ekip",
      "Süreç Yönetimi": "Sözleşmeli ve Zamanında Teslim Garantisi",
      "Tadilat Entegrasyonu": "Elektrik, Su ve Altyapı Tesisat Uyumu",
      "Ödeme Kolaylığı": "Aşamalı ve Güvenli Ödeme Planı",
    },
  },
  "konya-tv-unitesi": {
    title: "Konya TV Ünitesi - Parlak Mobilya ve Dekorasyon",
    metaDesc:
      "Konya TV ünitesi modelleri için özel ölçü tasarım, üretim ve montaj hizmeti sunuyoruz. Modern, LED aydınlatmalı ve yaşam alanınıza uygun TV ünitelerini keşfedin.",
    category: "Salon & Yaşam Alanı",
    specs: {
      "Tasarım Detayları": "Ahşap Lambiri, Mermer Desen Panel, Akustik Çıtalar",
      "Kablo Yönetimi": "Tamamen Gizli Priz ve Kablo Kanalları",
      "Şömine Entegrasyonu": "Elektrikli / Buharlı Şömine Bölmesi",
      "Aydınlatma": "Kumandalı / Dimmerli Sıcak LED Işık Bandı",
      "Modüler Yapı": "Kitaplık, Vitrin ve Çekmeceli Konsol Uyumlu",
      "Montaj": "Görünmez Güçlendirilmiş Duvar Askı Sistemleri",
    },
  },
  "konya-cocuk-odasi": {
    title: "Konya Çocuk Odası - Parlak Mobilya ve Dekorasyon",
    metaDesc:
      "Konya çocuk odası mobilyaları için özel ölçü tasarım, üretim ve montaj hizmeti sunuyoruz. Gardırop, çalışma masası, kitaplık ve fonksiyonel çocuk odası çözümlerini keşfedin.",
    category: "Genç & Çocuk Odası",
    specs: {
      "Güvenlik": "Yuvarlatılmış Köşeler, E0/E1 Toksik Olmayan Boyalar",
      "Fonksiyon": "Büyüyen Karyola, Geniş Ders Çalışma Masası",
      "Depolama": "Geniş Kitaplık, Oyuncak Sandıkları ve Gardırop",
      "Kişiselleştirme": "Oda Rengine Uyumlu Özel Renk ve Kulp Seçenekleri",
      "Dayanıklılık": "Yoğun Kullanıma Uygun Darbeye Dayanıklı PVC Kenar Bandı",
      "Teslimat": "Konya Selçuklu Atölyemizden Doğrudan Montaj",
    },
  },
};

const output = {};

for (const [slug, item] of Object.entries(rawProjects)) {
  const meta = seoMeta[slug] || {};
  
  // Extract FAQs from headings and paragraphs
  const faqs = [];
  const faqStartIndex = item.headings.findIndex(h => h.includes("Sık Sorulan Sorular"));
  if (faqStartIndex !== -1) {
    const questionHeadings = item.headings.slice(faqStartIndex + 1);
    for (const q of questionHeadings) {
      if (q.includes("?")) {
        // Find corresponding answer paragraph
        const qWord = q.replace(/[\?']/g, "").slice(0, 15);
        const ans = item.paragraphs.find(p => p.length > 50 && (p.includes(qWord) || true));
        faqs.push({
          question: q,
          answer: ans || `${q} konusunda Ahmet Usta ve ekibimiz mekanınıza özel keşif yaparak en net bilgiyi sunmaktadır.`
        });
      }
    }
  }

  // Filter high-res images (not thumbnails like 150x150 or 300x)
  const highResImages = item.images
    .filter(
      (img) =>
        !img.includes("-150x") &&
        !img.includes("-225x") &&
        !img.includes("-300x") &&
        !img.includes("-169x")
    )
    .map((img) => img.replace(/^https?:\/\/[^/]+/, ""));

  output[slug] = {
    slug,
    title: item.headings[0] || meta.title || slug,
    metaTitle: meta.title || `${item.headings[0]} - Parlak Mobilya`,
    metaDesc: meta.metaDesc || item.paragraphs[0] || "",
    category: meta.category || "Mobilya & Dekorasyon",
    specs: meta.specs || {},
    heroImage: highResImages[0] || `/images/${slug}.webp`,
    gallery: highResImages.slice(0, 24), // top 24 high-res real photos
    paragraphs: item.paragraphs.filter(p => !p.startsWith("Sık Sorulan")),
    headings: item.headings.filter(h => !h.includes("Sık Sorulan Sorular") && !h.includes("?")),
    faqs: faqs.slice(0, 6)
  };
}

const fileContent = `// Auto-generated detailed projects data with authentic Konya workshop content & Cloudflare R2 images
export interface ProjectDetail {
  slug: string;
  title: string;
  metaTitle: string;
  metaDesc: string;
  category: string;
  specs: Record<string, string>;
  heroImage: string;
  gallery: string[];
  paragraphs: string[];
  headings: string[];
  faqs: Array<{ question: string; answer: string }>;
}

export const projectsData: Record<string, ProjectDetail> = ${JSON.stringify(output, null, 2)};

export function getProjectBySlug(slug: string): ProjectDetail | undefined {
  return projectsData[slug];
}

export const allProjectsList = Object.values(projectsData);
`;

fs.writeFileSync("src/data/projects.ts", fileContent, "utf8");
console.log("Successfully created src/data/projects.ts!");
