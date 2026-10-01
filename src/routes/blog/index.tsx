import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/motion/Reveal";
import { getBlogPostsServerFn } from "@/lib/server/blog";
import { ArrowRight, Calendar } from "lucide-react";

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
      { property: "og:url", content: "https://www.parlakmobilyadekorasyon.com/blog" },
    ],
    links: [
      { rel: "canonical", href: "https://www.parlakmobilyadekorasyon.com/blog" },
    ],
  }),
});

export function BlogIndexPage() {
  const { posts } = Route.useLoaderData();
  return (
    <SiteLayout
      title="Blog ve Dekorasyon Rehberi"
      subtitle="Özel ölçü mobilya yaptırmadan önce bilmeniz gerekenler, malzeme seçimleri, trendler ve atölyemizden haberler."
      eyebrow="Güncel Makaleler & İpuçları"
    >
      <section className="bg-white py-16 md:py-20">
        <div className="container-site max-w-[1100px]">
          <div className="grid gap-8 md:grid-cols-2">
            {posts.map((post, idx) => (
              <Reveal key={post.slug} delay={idx * 60}>
                <article className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-black/10 bg-[#faf7f2] shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-[16/9] overflow-hidden bg-[#1a120c]">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[11.5px] font-semibold text-ink shadow-sm uppercase tracking-wider">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-7">
                    <div className="flex items-center gap-2 text-[13px] text-subtle">
                      <Calendar className="h-3.5 w-3.5 text-ink" />
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>

                    <h2 className="mt-3 font-display text-[22px] font-medium leading-snug text-ink transition group-hover:opacity-80">
                      {post.title}
                    </h2>

                    <p className="mt-2.5 line-clamp-3 text-[14.5px] leading-relaxed text-subtle">
                      {post.metaDesc}
                    </p>

                    <div className="mt-auto pt-6">
                      <Link
                        to="/blog/$slug"
                        params={{ slug: post.slug }}
                        className="inline-flex items-center gap-2 text-[14px] font-medium text-brown transition group-hover:text-ink group-hover:translate-x-1"
                      >
                        <span>Yazının Devamını Oku</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
