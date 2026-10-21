import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/motion/Reveal";
import { getBlogPostsServerFn } from "@/lib/server/blog";
import { ArrowRight, Calendar, Clock } from "lucide-react";

export const Route = createFileRoute("/blog/")({
  loader: async () => {
    const posts = await getBlogPostsServerFn({ data: { includeDrafts: false } });
    return { posts };
  },
  component: BlogIndexPage,
  head: () => ({
    meta: [
      { title: "Blog - Parlak Mobilya ve Dekorasyon" },
      {
        name: "description",
        content:
          "Konya mobilya ve mutfak dolapları hakkında uzman rehberleri okuyun. Gardırop, vestiyer, TV ünitesi ve dekorasyon fikirleriyle yaşam alanlarınızı daha bilinçli planlayın.",
      },
      { property: "og:title", content: "Blog ve Dekorasyon Rehberi - Parlak Mobilya" },
      { property: "og:url", content: "https://parlakmobilyadekorasyon.com/blog" },
    ],
    links: [
      { rel: "canonical", href: "https://parlakmobilyadekorasyon.com/blog" },
    ],
  }),
});

function BlogIndexPage() {
  const { posts } = Route.useLoaderData();
  return (
    <SiteLayout
      title="Blog ve Dekorasyon Rehberi"
      subtitle="Özel ölçü mobilya yaptırmadan önce bilmeniz gerekenler, malzeme seçimleri, trendler ve atölyemizden haberler."
    >
      <section className="bg-white py-16 md:py-20">
        <div className="container-site max-w-[1140px]">
          <div className="grid gap-8 md:grid-cols-2">
            {posts.map((post, idx) => (
              <Reveal key={post.slug} delay={idx * 60}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-black/8 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] hover:border-black/20 cursor-pointer"
                >
                  {/* Görsel Alanı */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#1a120c]">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
                    <div className="absolute top-4 left-4">
                      <span className="rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1 text-[11px] font-semibold text-[#0d0100] shadow-sm uppercase tracking-wider">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* İçerik Alanı */}
                  <div className="flex flex-1 flex-col p-6 sm:p-7 md:p-8">
                    <div className="flex items-center gap-3 text-[13px] text-[#524e4e] font-['Lexend']">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-amber-800" />
                        <span>{post.date}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-amber-800" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    <h2 className="mt-3.5 font-['Lexend'] text-[20px] sm:text-[22px] font-semibold leading-[1.3] text-[#0d0100] transition-colors group-hover:text-amber-900 line-clamp-2">
                      {post.title}
                    </h2>

                    <p className="mt-2.5 font-['Lexend'] font-light text-[14.5px] leading-relaxed text-[#524e4e] line-clamp-3">
                      {post.metaDesc}
                    </p>

                    <div className="mt-auto pt-6 border-t border-black/5 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#0d0100] transition-colors group-hover:text-amber-900">
                        <span>Yazıyı Oku</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5 text-amber-800" />
                      </span>
                      <span className="text-[12px] font-medium text-amber-900 bg-amber-50 px-2.5 py-1 rounded-full group-hover:bg-amber-100 transition-colors">
                        Rehber
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
