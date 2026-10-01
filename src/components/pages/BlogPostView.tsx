import { useEffect, useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/data/site";
import { migratedBlogPosts, type BlogPostItem } from "@/data/posts";
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Eye,
  Share2,
  Check,
  PhoneCall,
  ChevronRight,
} from "lucide-react";
import { useAdminStore } from "@/lib/admin/adminStore";
import { incrementBlogPostViewServerFn } from "@/lib/server/blog";

interface Props {
  post: BlogPostItem;
  otherPosts?: BlogPostItem[];
}

function cleanAuthorName(author?: string): string {
  if (!author) return "Ahmet Parlak";
  // Remove parenthetical nicknames like "(Ahmet Usta)"
  const cleaned = author.replace(/\s*\([^)]*\)/g, "").trim();
  return cleaned || "Ahmet Parlak";
}

export function BlogPostView({ post, otherPosts: propOtherPosts }: Props) {
  const incrementBlogPostViews = useAdminStore((s) => s.incrementBlogPostViews);
  const [copiedLink, setCopiedLink] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // View count increment logic
  useEffect(() => {
    if (post && post.slug && typeof window !== "undefined") {
      const storageKey = `pm_viewed_post_${post.slug}`;
      if (!sessionStorage.getItem(storageKey)) {
        sessionStorage.setItem(storageKey, "1");
        incrementBlogPostViews(post.slug);
        incrementBlogPostViewServerFn({ data: { slug: post.slug } }).catch(() => {});
      }
    }
  }, [post, incrementBlogPostViews]);

  // Reading scroll progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Normalize empty paragraphs and trailing breaks so multiple Enters always render proper vertical space
  const formattedContentHtml = useMemo(() => {
    if (!post.contentHtml) return "";
    return post.contentHtml
      .replace(/<p>\s*<\/p>/gi, "<p>&nbsp;</p>")
      .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, "<p>&nbsp;</p>");
  }, [post.contentHtml]);

  // Wrap any tables in .tableWrapper to prevent any horizontal overflow on mobile
  useEffect(() => {
    if (typeof document !== "undefined") {
      const articleEl = document.querySelector(".blog-content");
      if (articleEl) {
        const tables = articleEl.querySelectorAll("table");
        tables.forEach((table) => {
          if (!table.parentElement?.classList.contains("tableWrapper")) {
            const wrapper = document.createElement("div");
            wrapper.className = "tableWrapper";
            table.parentNode?.insertBefore(wrapper, table);
            wrapper.appendChild(table);
          }
        });
      }
    }
  }, [formattedContentHtml]);

  const otherPosts = propOtherPosts || migratedBlogPosts.filter((p) => p.slug !== post.slug);
  const authorName = cleanAuthorName(post.author);

  function handleCopyLink() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDesc,
    image: post.image?.startsWith("http")
      ? post.image
      : `https://www.parlakmobilyadekorasyon.com${post.image || ""}`,
    author: {
      "@type": "Person",
      name: authorName,
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

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${post.title} - https://www.parlakmobilyadekorasyon.com/blog/${post.slug}`
  )}`;

  return (
    <SiteLayout variant="light" showCta={false}>
      {/* Top Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-amber-500 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Structured SEO Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Main Blog Article Container */}
      <article className="bg-[#ffffff] text-ink pb-16 md:pb-24">
        {/* Editorial Header Section */}
        <section className="bg-gradient-to-b from-[#faf8f5] to-white pt-6 sm:pt-8 pb-8 sm:pb-10 border-b border-black/5">
          <div className="container-site max-w-[860px]">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-[12px] sm:text-[13px] text-black/50 mb-4 sm:mb-5 flex-wrap">
              <Link to="/" className="hover:text-ink transition">
                Ana Sayfa
              </Link>
              <ChevronRight className="size-3 text-black/30 shrink-0" />
              <Link to="/blog" className="hover:text-ink transition">
                Blog
              </Link>
              <ChevronRight className="size-3 text-black/30 shrink-0" />
              <span className="text-black/75 font-medium truncate max-w-[200px] sm:max-w-none">
                {post.category}
              </span>
            </nav>

            {/* Category Badge: Clean Solid Black (No AI orange/amber) */}
            <div className="mb-3.5">
              <span className="inline-block rounded-full bg-black px-3.5 py-1 text-[11.5px] font-semibold text-white tracking-wide">
                {post.category}
              </span>
            </div>

            {/* Title (H1) */}
            <h1 className="font-display text-[26px] sm:text-[34px] md:text-[40px] lg:text-[44px] font-semibold text-[#0d0100] tracking-tight leading-[1.22] mb-4">
              {post.title}
            </h1>

            {/* Subtitle / Excerpt */}
            {post.metaDesc && (
              <p className="text-[15px] sm:text-[16.5px] text-[#4d4845] leading-relaxed mb-6 font-normal">
                {post.metaDesc}
              </p>
            )}

            {/* Meta Row: Responsive, Consistent on Desktop and Mobile */}
            <div className="pt-4 border-t border-black/8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Author & Publishing Details */}
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full overflow-hidden bg-black text-white border border-black/10 shrink-0 flex items-center justify-center font-display font-semibold text-[13px] shadow-2xs">
                  <img
                    src="/images/ahmet-parlak-mobilyaa-1.jpg"
                    alt={authorName}
                    className="size-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <span className="hidden select-none">AP</span>
                </div>

                <div className="min-w-0">
                  <span className="font-semibold text-ink text-[14px] leading-tight block truncate">
                    {authorName}
                  </span>
                  <div className="flex items-center gap-2 text-[12px] text-black/50 mt-0.5 font-medium flex-wrap">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                    {typeof post.views === "number" && (
                      <>
                        <span>•</span>
                        <span>{post.views.toLocaleString("tr-TR")} Okunma</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Clean & Proportionate */}
              <div className="flex items-center gap-2 pt-1 sm:pt-0">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/15 bg-white hover:bg-black/5 text-[12.5px] font-medium text-ink transition shadow-2xs cursor-pointer"
                  title="Bağlantıyı Kopyala"
                >
                  {copiedLink ? (
                    <>
                      <Check className="size-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Kopyalandı</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="size-3.5 text-black/60" />
                      <span>Paylaş</span>
                    </>
                  )}
                </button>

                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-[#25D366] text-white text-[12.5px] font-semibold shadow-2xs hover:brightness-105 transition cursor-pointer"
                  title="WhatsApp'ta Paylaş"
                >
                  <MessageCircle className="size-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Content & Proportional Cover Section */}
        <section className="container-site max-w-[860px] pt-8 sm:pt-10">
          {/* Refined Proportional Cover Image (Cinematic, not screen-eating) */}
          {post.image && (
            <Reveal>
              <div className="relative w-full max-h-[360px] sm:max-h-[400px] overflow-hidden rounded-[20px] sm:rounded-[24px] bg-[#1a120c] shadow-sm border border-black/5 mb-8 sm:mb-10">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full max-h-[360px] sm:max-h-[400px] object-cover"
                />
              </div>
            </Reveal>
          )}

          {/* Real Styled Blog HTML Content */}
          <Reveal delay={60}>
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: formattedContentHtml }}
            />
          </Reveal>

          {/* Quick Lead & WhatsApp Consultation Card */}
          <div className="mt-12 rounded-[24px] bg-gradient-to-br from-[#1c140d] to-[#271d12] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <h3 className="font-display text-[21px] sm:text-[24px] font-semibold text-white leading-snug">
                  Eviniz İçin Özel Ölçü Mobilya mı Planlıyorsunuz?
                </h3>
                <p className="text-[13.5px] text-white/75 leading-relaxed">
                  Konya atölyemizde mutfak dolabı, gardırop, vestiyer ve komple ev yenileme projeleriniz için 40 yılı aşkın tecrübeyle ücretsiz keşif ve 3D projelendirme yapıyoruz.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
                <a
                  href={`https://api.whatsapp.com/send?phone=905071721196&text=${encodeURIComponent(
                    `Merhaba, web sitenizdeki "${post.title}" yazınızı okudum. Özel mobilya yaptırmak istiyorum, bilgi alabilir miyim?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-md hover:brightness-110 transition cursor-pointer"
                >
                  <MessageCircle className="size-4" />
                  <span>WhatsApp'tan Yazın</span>
                </a>

                <a
                  href="tel:05071721196"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white/15 hover:bg-white/25 px-5 py-2.5 text-[13.5px] font-semibold text-white transition border border-white/20 cursor-pointer"
                >
                  <PhoneCall className="size-4" />
                  <span>0507 172 11 96</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Share & Return Row */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-black/10">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-ink hover:text-brown transition"
            >
              <ArrowLeft className="size-4" />
              <span>Tüm Rehber ve Blog Yazılarına Dön</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/10 bg-white hover:bg-black/5 text-[12.5px] font-medium text-ink transition cursor-pointer"
              >
                <Share2 className="size-3.5" />
                <span>{copiedLink ? "Kopyalandı!" : "Linki Kopyala"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Other Posts (Compact, Elegant Horizontal Cards) */}
        {otherPosts.length > 0 && (
          <section className="bg-[#faf8f5] py-12 md:py-16 mt-14 border-t border-black/5">
            <div className="container-site max-w-[860px]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-[21px] sm:text-[24px] font-semibold text-ink">
                    İlginizi Çekebilecek Diğer Rehberler
                  </h2>
                </div>
                <Link
                  to="/blog"
                  className="text-[13px] font-semibold text-brown hover:underline hidden sm:inline-block"
                >
                  Tümünü Gör →
                </Link>
              </div>

              {/* Compact Card List */}
              <div className="grid sm:grid-cols-2 gap-4">
                {otherPosts.slice(0, 2).map((p) => (
                  <article
                    key={p.slug}
                    className="group flex items-center gap-3.5 p-3 rounded-[18px] bg-white border border-black/8 hover:border-black/20 hover:shadow-sm transition"
                  >
                    {/* Small Proportionate Thumbnail */}
                    <div className="relative size-20 sm:size-22 rounded-[12px] overflow-hidden bg-[#1a120c] shrink-0 border border-black/5">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-black/50 mb-1">
                        <span className="font-semibold text-black bg-zinc-100 px-2 py-0.5 rounded-full text-[10px]">
                          {p.category}
                        </span>
                        <span>•</span>
                        <span>{p.readTime}</span>
                      </div>

                      <h3 className="font-display text-[14px] sm:text-[14.5px] font-semibold text-ink group-hover:text-brown transition line-clamp-2 leading-snug">
                        {p.title}
                      </h3>

                      <div className="mt-1.5">
                        <Link
                          to="/blog/$slug"
                          params={{ slug: p.slug }}
                          className="inline-flex items-center gap-1 text-[12px] font-medium text-brown group-hover:underline"
                        >
                          <span>Yazıyı Oku</span>
                          <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </SiteLayout>
  );
}
