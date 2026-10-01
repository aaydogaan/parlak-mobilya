import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Play, X, Award, Eye, ShieldCheck, HeartHandshake, Compass, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Header } from "@/components/layout/Header";
import { Reveal } from "@/components/motion/Reveal";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "Hakkımızda - Parlak Mobilya ve Dekorasyon | 1984'ten Bugüne" },
      {
        name: "description",
        content:
          "1984 yılında Konya'da Ahmet Parlak tarafından temelleri atılan Parlak Mobilya, 40 yılı aşkın marangozluk zanaatını modern 3D mimari tasarımla birleştiriyor.",
      },
      { property: "og:title", content: "Hakkımızda - Parlak Mobilya ve Dekorasyon" },
      { property: "og:url", content: "https://www.parlakmobilyadekorasyon.com/hakkimizda" },
    ],
    links: [
      { rel: "canonical", href: "https://www.parlakmobilyadekorasyon.com/hakkimizda" },
    ],
  }),
});

const stats = [
  {
    icon: Award,
    title: "40+ Yıllık Tecrübe",
    desc: "1984'ten bu yana Konya'da kesintisiz ahşap zanaatı ve üretim disiplini.",
  },
  {
    icon: Eye,
    title: "Dijital 3D Tasarım",
    desc: "Üretime geçmeden önce mekana özel fotogerçekçi 3D mimari görselleştirme.",
  },
  {
    icon: ShieldCheck,
    title: "Anahtar Teslim Hizmet",
    desc: "Ölçüden 3D tasarıma, CNC hassas üretimden titiz montaja tek elden güvence.",
  },
];

const values = [
  {
    title: "Ömürlük İmza",
    body: "Kullandığımız her malzemeyi, yapacağımız her işi önce kendi evimize koyar gibi düşünürüz. İçimize sinmeyen hiçbir iş atölyemizden dışarı çıkmaz.",
  },
  {
    title: "Aile Sıcaklığı",
    body: "Müşterilerimizi birer dosya veya proje olarak değil, evine konuk olduğumuz bir aile ferdi olarak görürüz. Montaj sonrasında da her daim arkasındayız.",
  },
  {
    title: "Görsel Netlik (3D)",
    body: "Hayalinizde olan ile evinize monte edilen birebir aynı olsun diye 3D projelendiriyoruz. Asla kötü sürprizlere yer bırakmıyoruz.",
  },
  {
    title: "Sözümüz Senettir",
    body: "1984'ten bu yana verilen her söz eksiksiz tutuldu. Teslim tarihi, malzeme kalitesi ve bütçe şeffaflığında asla geri adım atmayız.",
  },
];

const leadership = [
  {
    name: "Ahmet PARLAK",
    role: "Kurucu & Baş Ahşap Zanaatkarı",
    desc: "1984 yılından beri ahşabın dokusuna hayat veren 40 yıllık zanaat tecrübesi.",
    image: "/images/ahmet-parlak-mobilyaa-1.jpg",
  },
  {
    name: "Emre PARLAK",
    role: "Tasarım & Proje Yöneticisi",
    desc: "Geleneksel mobilya ustalığını modern 3D modelleme ve dijital üretimle buluşturan yeni nesil vizyon.",
    image: "/images/emre-parkak.jpg",
  },
];

const brandLogos = [
  { src: "/images/lo1.webp", alt: "Partner Marka 1" },
  { src: "/images/lo3.webp", alt: "Partner Marka 2" },
  { src: "/images/lo4.webp", alt: "Partner Marka 3" },
  { src: "/images/LOGO-03.png", alt: "Partner Marka 4" },
];

export function AboutPage() {
  const [playing, setPlaying] = useState(false);

  return (
    <SiteLayout
      customHero={
        <div className="relative w-full bg-white overflow-hidden">
          {/* Koyu Ahşap Katman */}
          <div className="absolute inset-x-0 top-0 h-[62%] sm:h-[64%] bg-[#271d12]" />

          {/* Header */}
          <div className="relative z-20">
            <Header variant="dark" />
          </div>

          {/* Başlık */}
          <div className="relative z-10 pt-10 sm:pt-14 md:pt-16 pb-10 sm:pb-12 text-center px-4 sm:px-6">
            <Reveal>
              <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-medium tracking-wide text-white border border-white/15">
                1984'ten Bu Yana Konya'da Bir Zanaat Yolculuğu
              </span>
              <h1 className="mt-4 font-['Lexend'] text-[38px] sm:text-[50px] md:text-[60px] font-semibold tracking-[-2px] text-white">
                Hakkımızda
              </h1>
              <p className="mt-4 mx-auto max-w-[620px] font-['Lexend'] text-[16px] sm:text-[18px] font-light leading-[1.65] text-[#f6f5f5]">
                Ahmet Usta'nın kırk yıllık el emeği ile Emre Bey'in modern 3D mimari vizyonu, Parlak Mobilya'da tek bir çatı altında buluşuyor.
              </p>
            </Reveal>
          </div>

          {/* Video Kapsayıcısı */}
          <div className="relative z-10 w-full max-w-[1240px] mx-auto px-4 sm:px-6 pb-12 sm:pb-16 md:pb-20">
            <div className="relative aspect-[16/10] sm:aspect-[1.58/1] w-full rounded-[20px] overflow-hidden shadow-2xl bg-[#1c140d]">
              <video
                src="/videos/konya_parlak_mobilya_dekorasyon.mp4"
                loop
                muted
                playsInline
                autoPlay
                className="w-full h-full object-cover"
              />

              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-16 sm:size-20 rounded-full bg-white text-ink flex items-center justify-center shadow-2xl hover:scale-105 transition-transform cursor-pointer"
                aria-label="Videoyu sesli oynat"
              >
                <Play className="ml-1 size-7 sm:size-8 fill-ink text-ink" />
              </button>
            </div>
          </div>
        </div>
      }
    >
      {/* Video Modal */}
      {playing ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-sm"
          onClick={() => setPlaying(false)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-[20px] bg-[#271d12] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-[#0d0100] hover:bg-white transition-colors cursor-pointer"
              onClick={() => setPlaying(false)}
              aria-label="Kapat"
            >
              <X className="size-5" />
            </button>
            <div className="aspect-video w-full">
              <video
                src="/videos/konya_parlak_mobilya_dekorasyon.mp4"
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Hikayemiz Bölümü */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-site">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Sol: Büyük Atölye / Üretim Görseli */}
            <div className="lg:col-span-5">
              <Reveal>
                <div className="relative rounded-[24px] overflow-hidden shadow-xl aspect-[4/5] bg-fog">
                  <img
                    src="/images/DSCF4488-2.webp"
                    alt="Parlak Mobilya Atölye ve Ahşap İşçiliği"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                    <span className="text-[13px] font-semibold uppercase tracking-wider text-white/90">Kuruluş 1984</span>
                    <p className="mt-1 text-[20px] font-semibold font-['Lexend'] leading-snug">
                      "Kendi evimize kurmayacağımız hiçbir detayı müşterimizle buluşturmayız."
                    </p>
                    <span className="mt-2 text-[14px] text-white/80">— Ahmet Usta</span>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Sağ: Hikaye Metni */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <Reveal>
                <div className="inline-flex items-center gap-2 text-ink font-semibold text-[14px]">
                  <span className="size-2 rounded-full bg-ink" />
                  <span>Hikayemiz</span>
                </div>
                <h2 className="mt-2 font-['Lexend'] text-[32px] sm:text-[38px] md:text-[44px] font-semibold text-ink tracking-tight leading-[1.2]">
                  Bir Kapının Ardında Başlayan Zanaat Sevdası
                </h2>
              </Reveal>

              <Reveal delay={100}>
                <div className="space-y-4 font-['Lexend'] text-[16px] text-muted leading-relaxed">
                  <p>
                    1984 yılında Konya'da 16 yaşındaki Ahmet Parlak, bir marangoz atölyesinin kapısını çaldı.
                    Ustasından tek istediği öğrenmek ve çalışmaktı. O yıllarda ahşabı elle kesmek, gözle ölçmek,
                    bilek gücüyle şekillendirmekti zanaat. Ahmet Usta bu mesleği sıfırdan, yerinde ve alın teriyle öğrendi.
                  </p>
                  <p>
                    <strong>Parlak</strong>, bu ailenin soyadı. Yıllar sonra markamızın adı da aynı kelime oldu.
                    Tesadüf değil; aynı emekle, aynı dürüstlükle kazanıldı.
                  </p>
                  <p>
                    Yıllar içinde sektör büyük dönüşümler geçirdi. Formikadan profil kapaklara, oradan modern panel
                    ve akrilik sistemlere... Her şey değişti. Ahmet Usta yenilikleri benimsedi ama tek bir ilkeden asla taviz vermedi:
                    <span className="italic text-ink font-medium"> “Kendi evimize kurmayacağımız hiçbir detayı müşterimizle buluşturmayız.”</span>
                  </p>
                  <p>
                    Bugün Emre Parlak, babasının zanaatına çağdaş 3D mimari tasarım araçlarını kattı. Artık her proje,
                    üretim başlamadan önce 3D olarak tasarlanıyor ve onayınızla hayat buluyor.
                  </p>
                </div>

                <div className="mt-6 rounded-2xl border-l-4 border-ink bg-fog p-5">
                  <p className="font-['Lexend'] text-[17px] font-semibold text-ink italic">
                    "Bizim imzamız, sizin huzurunuzdur."
                  </p>
                  <p className="mt-1 text-[13.5px] font-medium text-muted">
                    Ahmet PARLAK · 1984'ten Bugüne
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Temel Sütun (40 Yıllık Zanaat, Modern Tasarım) */}
      <section className="bg-sand/40 border-y border-line py-16 md:py-20">
        <div className="container-site">
          <div className="text-center max-w-[680px] mx-auto mb-12">
            <Reveal>
              <h2 className="font-['Lexend'] text-[30px] sm:text-[36px] font-semibold text-ink tracking-tight">
                40 Yıllık Zanaat, Modern Tasarım
              </h2>
              <p className="mt-3 text-[16px] text-muted font-light">
                Geleneksel marangozluk titizliği ile bugünün modern mimari teknolojisini tek bir atölyede birleştirdik.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((s, idx) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.title} delay={idx * 80}>
                  <div className="h-full rounded-2xl bg-white p-8 shadow-sm border border-black/8 hover:border-black/25 transition-colors">
                    <div className="size-12 rounded-xl bg-fog border border-black/8 flex items-center justify-center text-ink mb-5">
                      <Icon className="size-6 text-ink" />
                    </div>
                    <h3 className="font-['Lexend'] text-[20px] font-semibold text-ink">
                      {s.title}
                    </h3>
                    <p className="mt-3 font-['Lexend'] text-[15px] text-muted leading-relaxed font-light">
                      {s.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ustanın Elleri, Tasarımcının Gözü (Ekip / Kurucular) */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-site">
          <div className="text-center max-w-[640px] mx-auto mb-14">
            <Reveal>
              <span className="text-[13px] font-semibold uppercase tracking-wider text-muted">İki Nesil, Tek Tutku</span>
              <h2 className="mt-2 font-['Lexend'] text-[32px] sm:text-[40px] font-semibold text-ink tracking-tight">
                Ustanın Elleri, Tasarımcının Gözü
              </h2>
              <p className="mt-3 font-['Lexend'] text-[16px] text-muted font-light leading-relaxed">
                Parlak Mobilya'nın gücü, kuşaklar arası bu eşsiz iş birliğinde yatıyor. Ahmet Usta'nın 40 yıllık titiz el işçiliği ile Emre Bey'in 3D tasarım vizyonu her mekanda buluşuyor.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-[880px] mx-auto">
            {leadership.map((person, i) => (
              <Reveal key={person.name} delay={i * 100}>
                <div className="group rounded-[20px] overflow-hidden border border-black/5 bg-white shadow-md hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[4/4.5] overflow-hidden bg-fog">
                    <img
                      src={person.image}
                      alt={person.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-['Lexend'] text-[22px] font-semibold text-ink">
                      {person.name}
                    </h3>
                    <p className="text-[14px] font-medium text-muted mt-1">
                      {person.role}
                    </p>
                    <p className="mt-3 font-['Lexend'] text-[14.5px] text-muted leading-relaxed">
                      {person.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Vizyon, Misyon ve Değerlerimiz */}
      <section className="bg-[#271d12] text-white py-16 md:py-24">
        <div className="container-site">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <Reveal>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm h-full">
                <div className="inline-flex items-center gap-2 text-white/90 mb-4">
                  <Compass className="size-5" />
                  <span className="font-semibold uppercase tracking-wider text-[13px]">Geleceğe Bakışımız</span>
                </div>
                <h3 className="font-['Lexend'] text-[26px] font-semibold text-white mb-4">
                  Vizyonumuz
                </h3>
                <div className="space-y-3 font-['Lexend'] text-[15.5px] text-[#f6f5f5]/85 leading-relaxed font-light">
                  <p>
                    1984'te kurulan bir atölyenin vizyonu olmaz diyenler yanılıyor. Ahmet Usta'nın o yıl kurduğu temelden bugüne taşıdığımız tek bir hedef var:
                  </p>
                  <p>
                    Konya'dan yükselen bu usta-çırak disiplinini, teknolojiye rağmen değil, teknolojiyle birlikte büyütmek. Her dokunuşta güven, her tasarımda dürüstlük inşa etmek.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm h-full">
                <div className="inline-flex items-center gap-2 text-white/90 mb-4">
                  <HeartHandshake className="size-5" />
                  <span className="font-semibold uppercase tracking-wider text-[13px]">Varoluş Amacımız</span>
                </div>
                <h3 className="font-['Lexend'] text-[26px] font-semibold text-white mb-4">
                  Misyonumuz
                </h3>
                <div className="space-y-3 font-['Lexend'] text-[15.5px] text-[#f6f5f5]/85 leading-relaxed font-light">
                  <p>
                    Her projeye şu soruyla başlıyoruz: <em>“Bu alanı kullanan kişi burada huzur bulacak mı?”</em>
                  </p>
                  <p>
                    Cevap evet olana kadar tasarlıyor, üretiyor ve monte ediyoruz. Müşterimizin farklı ustalar arasında yorulmasına gerek kalmadan, başından sonuna tek elden teslim ediyoruz.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Değerlerimiz */}
          <div>
            <Reveal>
              <h3 className="font-['Lexend'] text-[28px] sm:text-[34px] font-semibold text-center text-white mb-10">
                Bizi Biz Yapan Değerlerimiz
              </h3>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <Reveal key={v.title} delay={i * 80}>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-white/40 transition-colors h-full">
                    <CheckCircle2 className="size-6 text-white mb-3" />
                    <h4 className="font-['Lexend'] text-[18px] font-semibold text-white">
                      {v.title}
                    </h4>
                    <p className="mt-2 text-[14px] text-white/75 font-light leading-relaxed">
                      {v.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Çalıştığımız Markalar */}
      <section className="bg-white py-14 border-t border-line">
        <div className="container-site">
          <p className="text-center font-['Lexend'] text-[14px] font-medium uppercase tracking-wider text-muted mb-8">
            Çözüm Ortaklarımız ve Kullandığımız Markalar
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75">
            {brandLogos.map((b, i) => (
              <img
                key={i}
                src={b.src}
                alt={b.alt}
                className="h-10 sm:h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
