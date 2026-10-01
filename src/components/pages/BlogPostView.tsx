import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/data/site";
import { migratedBlogPosts, type BlogPostItem } from "@/data/posts";
import { Calendar, User, Clock, ArrowLeft, ArrowRight, MessageCircle } from "lucide-react";
import { useAdminStore } from "@/lib/admin/adminStore";

interface Props {
  post: BlogPostItem;
}

export function BlogPostView({ post }: Props) {
  const incrementBlogPostViews = useAdminStore((s) => s.incrementBlogPostViews);

  useEffect(() => {
    if (post && post.slug) {
      incrementBlogPostViews(post.slug);
    }
  }, [post, incrementBlogPostViews]);
  const otherPosts = migratedBlogPosts.filter((p) => p.slug !== post.slug);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDesc,
    image: post.image.startsWith("http") ? post.image : `https://www.parlakmobilyadekorasyon.com${post.image}`,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Parlak Mobilya ve Dekorasyon",
      logo: {
        "@type": "ImageObject",
        url: "https://www.parlakmobilyadekorasyon.com/images/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.parlakmobilyadekorasyon.com/blog/${post.slug}`,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana Sayfa",
        item: "https://www.parlakmobilyadekorasyon.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://www.parlakmobilyadekorasyon.com/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://www.parlakmobilyadekorasyon.com/blog/${post.slug}`,
      },
    ],
  };

  return (
    <SiteLayout
      title={post.title}
      subtitle={post.metaDesc}
      eyebrow={`${post.category} — ${post.date}`}
    >
      {/* Article & Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Breadcrumb */}
      <section className="border-b border-black/5 bg-[#faf7f2] py-4">
        <div className="container-site flex flex-wrap items-center justify-between gap-4 text-[13.5px] text-subtle">
          <nav className="flex items-center gap-2">
            <Link to="/" className="hover:text-ink transition">Ana Sayfa</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-ink transition">Blog</Link>
            <span>/</span>
            <span className="font-medium text-ink">{post.title}</span>
          </nav>
          <div className="flex items-center gap-4 text-[13px]">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-ink" />
              {post.date}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-ink" />
              {post.author}
            </span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="bg-white py-12 md:py-16">
        <div className="container-site max-w-[860px]">
          {/* Featured Image */}
          <Reveal>
            <div className="overflow-hidden rounded-[24px] bg-[#1a120c] shadow-lg">
              <img
                src={post.image}
                alt={post.title}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          </Reveal>

          {/* Body Html with Tailwind Typography */}
          <div className="mt-10 md:mt-12">
            <Reveal delay={80}>
              <div
                className="prose prose-lg max-w-none text-ink/85 leading-relaxed
                  prose-headings:font-display prose-headings:font-medium prose-headings:tracking-tight prose-headings:text-ink
                  prose-h2:text-[26px] prose-h2:mt-10 prose-h2:mb-4 md:prose-h2:text-[30px]
                  prose-h3:text-[22px] prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-[16.5px] prose-p:leading-[1.75] prose-p:mb-5 prose-p:text-subtle
                  prose-strong:text-ink prose-strong:font-semibold
                  prose-ul:my-5 prose-ul:list-disc prose-ul:pl-6 prose-li:mb-2 prose-li:text-[16px] prose-li:text-subtle
                  prose-a:text-ink prose-a:underline hover:opacity-80"
                dangerouslySetInnerHTML={{ __html: post.contentHtml }}
              />
            </Reveal>
          </div>

          {/* Author Box */}
          <div className="mt-14 rounded-[22px] border border-black/10 bg-[#faf7f2] p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full bg-black/5 border-2 border-black/10 shadow-sm">
              <img
                src="/images/logo-footer.png"
                alt="Parlak Mobilya"
                className="h-full w-full object-contain p-2"
              />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-display text-[20px] font-medium text-ink">
                Ahmet Parlak (Ahmet Usta)
              </h3>
              <p className="mt-1 text-[13.5px] text-ink/70 font-medium">
                Kurucu & Baş Usta — 1984'ten Beri
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-subtle">
                40 yılı aşkın süredir Konya'da ahşap mobilya imalatı, mutfak dolapları ve özel dekorasyon çözümleri üretmektedir.
              </p>
            </div>
          </div>

          {/* Share on WhatsApp */}
          <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-6">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-[14.5px] font-medium text-subtle hover:text-ink transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Tüm Yazılara Dön</span>
            </Link>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `${post.title} - https://www.parlakmobilyadekorasyon.com/blog/${post.slug}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-[13.5px] font-medium text-white shadow hover:brightness-110 transition"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp'ta Paylaş</span>
            </a>
          </div>
        </div>
      </article>

      {/* Read More Section */}
      {otherPosts.length > 0 && (
        <section className="bg-[#faf7f2] py-14 md:py-18 border-t border-black/5">
          <div className="container-site max-w-[860px]">
            <h2 className="font-display text-[26px] font-medium text-ink md:text-[32px]">
              Diğer Blog ve Rehber Yazılarımız
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {otherPosts.map((p) => (
                <article
                  key={p.slug}
                  className="group flex flex-col overflow-hidden rounded-[20px] bg-white border border-black/10 shadow-sm hover:shadow-md transition"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#1a120c]">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-ink shadow-sm uppercase tracking-wider">
                        {p.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-[19px] font-medium text-ink group-hover:opacity-80 transition">
                      {p.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-[14px] text-subtle leading-relaxed">
                      {p.metaDesc}
                    </p>
                    <div className="mt-auto pt-5">
                      <Link
                        to="/blog/$slug"
                        params={{ slug: p.slug }}
                        className="inline-flex items-center gap-1.5 text-[14px] font-medium text-ink group-hover:opacity-80 transition"
                      >
                        <span>Yazıyı Oku</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
