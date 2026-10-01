import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/motion/Reveal";
import { X } from "lucide-react";
import { getGaleriImagesServerFn } from "@/lib/server/galeri";


export const Route = createFileRoute("/galeri")({
  loader: async () => {
    const images = await getGaleriImagesServerFn();
    return { images };
  },
  component: GaleriPage,
  head: () => ({
    meta: [
      { title: "Fotoğraf Galerisi - Parlak Mobilya ve Dekorasyon" },
      {
        name: "description",
        content:
          "Konya'da tamamladığımız mutfak dolabı, gardırop, vestiyer, TV ünitesi ve özel ölçü mobilya projelerini galerimizde inceleyin. Gerçek uygulamalardan ilham alın.",
      },
      { property: "og:title", content: "Fotoğraf Galerisi - Parlak Mobilya ve Dekorasyon" },
      { property: "og:url", content: "https://www.parlakmobilyadekorasyon.com/galeri" },
    ],
    links: [
      { rel: "canonical", href: "https://www.parlakmobilyadekorasyon.com/galeri" },
    ],
  }),
});

function GaleriPage() {
  const { images } = Route.useLoaderData();
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  return (
    <SiteLayout
      title="Fotoğraf Galerisi"
      subtitle="Konya'da Ahmet Usta ve ekibimiz tarafından üretilen ve montajı gerçekleştirilen mutfak, gardırop, vestiyer ve ahşap dekorasyon uygulamalarımız."
      eyebrow="1984'ten Bugüne Zanaat Kareleri"
    >
      {/* Video Tanıtım Bölümü - Anasayfadaki aynı gerçek WordPress tanıtım videosu */}
      <section className="bg-white pt-10 pb-6">
        <div className="container-site max-w-[1100px]">
          <div className="relative overflow-hidden rounded-[24px] bg-[#1a120c] shadow-2xl">
            <div className="aspect-video w-full">
              <video
                src="/videos/konya_parlak_mobilya_dekorasyon.mp4"
                loop
                muted
                playsInline
                autoPlay
                disablePictureInPicture
                disableRemotePlayback
                className="h-full w-full object-cover pointer-events-none"
              />
            </div>
            <div className="p-6 md:p-8 bg-gradient-to-t from-black via-black/80 to-transparent text-white">
              <h2 className="font-display text-[22px] md:text-[26px] font-medium">
                Parlak Mobilya & Dekorasyon Atölye ve Üretim Hikayesi
              </h2>
              <p className="mt-2 text-[14.5px] text-white/80 leading-relaxed max-w-[720px]">
                Konya Horozluhan Mahallesi'ndeki atölyemizde ahşabın ham halinden son montaj anına kadar her detayda titizlikle çalışıyoruz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fotoğraf Izgarası - Tam 3 Kolon (Kullanıcı İsteği: 1 satırda 4 değil 3 görsel) */}
      <section className="bg-white py-12 md:py-16">
        <div className="container-site">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {images.map((img, idx) => (
              <Reveal key={idx} delay={(idx % 6) * 40}>
                <div
                  onClick={() => setSelectedImg(img)}
                  className="group relative cursor-pointer overflow-hidden rounded-[20px] bg-[#1a120c] aspect-[4/3] shadow-sm hover:shadow-xl transition-all"
                >
                  <img
                    src={img}
                    alt={`Konya Parlak Mobilya Proje Fotoğrafı ${idx + 1}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="rounded-full bg-white/95 px-4 py-2 text-[13px] font-semibold text-black shadow">
                      Büyüt
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImg(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImg(null)}
              className="absolute -top-12 right-0 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition cursor-pointer"
              aria-label="Kapat"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={selectedImg}
              alt="Konya Parlak Mobilya Fotoğrafı"
              className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
