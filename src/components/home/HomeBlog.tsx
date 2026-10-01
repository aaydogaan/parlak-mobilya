import { Reveal } from "@/components/motion/Reveal";
import { BlogCard } from "@/components/cards/BlogCard";
import { featuredBlogs } from "@/data/site";

export function HomeBlog() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container-site">
        <Reveal>
          <div className="mx-auto max-w-[620px] text-center">
            <h2 className="font-['Lexend'] text-[32px] sm:text-[38px] md:text-[44px] font-semibold tracking-[-2px] text-[#0d0100]">
              Blog
            </h2>
            <p className="mt-3 font-['Lexend'] text-[15px] sm:text-[16px] leading-relaxed text-[#524e4e]">
              Mobilya seçimi, doğru ölçü alma ve modern ev dekorasyonu hakkında pratik ipuçları ve güncel rehberler.
            </p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredBlogs.map((p, i) => (
            <Reveal key={p.slug} delay={i * 70}>
              <BlogCard post={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
