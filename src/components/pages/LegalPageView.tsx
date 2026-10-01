import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/data/site";
import { Mail, Phone } from "lucide-react";

interface Props {
  title: string;
  metaDesc: string;
  contentHtml: string;
}

export function LegalPageView({ title, metaDesc, contentHtml }: Props) {
  return (
    <SiteLayout title={title} subtitle={metaDesc} eyebrow="Yasal Bilgilendirme">
      <section className="bg-white py-14 md:py-20">
        <div className="container-site max-w-[840px]">
          <Reveal>
            <div
              className="prose prose-lg max-w-none text-ink/80 leading-relaxed
                prose-headings:font-display prose-headings:font-medium prose-headings:text-ink
                prose-h2:text-[24px] prose-h2:mt-8 prose-h2:mb-3
                prose-h3:text-[20px] prose-h3:mt-6 prose-h3:mb-2
                prose-p:text-[15.5px] prose-p:leading-[1.75] prose-p:mb-4 prose-p:text-subtle
                prose-strong:text-ink prose-strong:font-semibold
                prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6 prose-li:mb-1.5 prose-li:text-[15px] prose-li:text-subtle"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            <div className="mt-12 rounded-[20px] border border-black/10 bg-[#faf7f2] p-6 text-[14.5px] text-subtle">
              <h4 className="font-display font-medium text-ink text-[16px]">
                Sorularınız veya Bilgi Talepleriniz İçin
              </h4>
              <p className="mt-1.5 leading-relaxed">
                Kişisel verilerinizin işlenmesi veya politikalarımız hakkında her türlü sorunuz için bizimle doğrudan iletişime geçebilirsiniz.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-[14px]">
                <a href={`mailto:${site.email}`} className="flex items-center gap-1.5 font-medium text-ink hover:underline">
                  <Mail className="h-4 w-4 text-ink" />
                  <span>{site.email}</span>
                </a>
                <a href={`tel:${site.phoneRaw}`} className="flex items-center gap-1.5 font-medium text-ink hover:underline">
                  <Phone className="h-4 w-4 text-ink" />
                  <span>{site.phone}</span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
