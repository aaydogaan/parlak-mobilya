import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/data/site";
import { migratedBlogPosts, type BlogPostItem } from "@/data/posts";
import {
  Calendar,
  User,
  Clock,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Eye,
  Share2,
  Check,
  PhoneCall,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useAdminStore } from "@/lib/admin/adminStore";
import { incrementBlogPostViewServerFn } from "@/lib/server/blog";

interface Props {
  post: BlogPostItem;
  otherPosts?: BlogPostItem[];
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

  const otherPosts = propOtherPosts || migratedBlogPosts.filter((p) => p.slug !== post.slug);

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
    image: post.image.startsWith("http")
      ? post.image
      : `https://www.parlakmobilyadekorasyon.com${post.image}`,
    author: {
      "@type": "Person",
      name: post.author || "Ahmet Parlak (Ahmet Usta)",
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
        <section className="bg-gradient-to-b from-[#faf8f5] to-white pt-8 pb-10 sm:pb-12 border-b border-black/5">
          <div className="container-site max-w-[880px]">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-[12.5px] sm:text-[13px] text-black/50 mb-6 flex-wrap">
              <Link to="/" className="hover:text-ink transition">
                Ana Sayfa
              </Link>
              <ChevronRight className="size-3.5 text-black/30 shrink-0" />
              <Link to="/blog" className="hover:text-ink transition">
                Blog & Rehber
              </Link>
              <ChevronRight className="size-3.5 text-black/30 shrink-0" />
              <span className="text-black/80 font-medium truncate max-w-[240px] sm:max-w-none">
                {post.category}
              </span>
            </nav>

            {/* Category Pill Badge */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-3.5 py-1 text-[12px] font-semibold text-amber-900 shadow-2xs uppercase tracking-wider">
                <Sparkles className="size-3 text-amber-600" />
                {post.category}
              </span>
            </div>

            {/* Title (H1) */}
            <h1 className="font-display text-[27px] sm:text-[36px] md:text-[42px] lg:text-[46px] font-semibold text-[#0d0100] tracking-tight leading-[1.22] mb-5">
              {post.title}
            </h1>

            {/* Subtitle / Excerpt */}
            {post.metaDesc && (
              <p className="text-[15.5px] sm:text-[17.5px] text-[#4d4845] leading-relaxed mb-6 font-normal">
                {post.metaDesc}
              </p>
            )}

            {/* Meta Row: Author, Date, Reading Time, Views & Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-black/8 text-[13px] text-black/60">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {/* Author */}
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-full overflow-hidden bg-black/5 border border-black/10 shrink-0 flex items-center justify-center font-display font-semibold text-black text-[13px]">
                    <img
                      src="/images/logo-footer.png"
                      alt={post.author || "Ahmet Usta"}
                      className="size-full object-contain p-1"
                    />
                  </div>
                  <div>
                    <span className="font-semibold text-ink block leading-tight text-[13.5px]">
                      {post.author || "Ahmet Parlak (Ahmet Usta)"}
                    </span>
                    <span className="text-[11.5px] text-black/45 leading-tight block">
                      Kurucu & Baş Usta
                    </span>
                  </div>
                </div>

                <div className="h-6 w-px bg-black/10 hidden sm:block" />

                {/* Date */}
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="size-3.5 text-black/40" />
                  <span>{post.date}</span>
                </div>

                {/* Read Time */}
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="size-3.5 text-black/40" />
                  <span>{post.readTime}</span>
                </div>

                {/* Views Count */}
                {typeof post.views === "number" && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <Eye className="size-3.5 text-black/40" />
                    <span>{post.views.toLocaleString("tr-TR")} Okunma</span>
                  </div>
                )}
              </div>

              {/* Share & Copy Buttons */}
              <div className="flex items-center gap-2 ml-auto sm:ml-0">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 bg-white hover:bg-black/5 text-ink text-[12px] font-medium transition cursor-pointer shadow-2xs"
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
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `${post.title} - https://www.parlakmobilyadekorasyon.com/blog/${post.slug}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#25D366] text-white text-[12px] font-semibold shadow-2xs hover:brightness-105 transition"
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
        <section className="container-site max-w-[880px] pt-8 sm:pt-10">
          {/* Refined Proportional Cover Image (Cinematic, not screen-eating) */}
          {post.image && (
            <Reveal>
              <div className="relative w-full max-h-[380px] sm:max-h-[430px] overflow-hidden rounded-[22px] sm:rounded-[26px] bg-[#1a120c] shadow-md border border-black/5 mb-10 sm:mb-12">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full max-h-[380px] sm:max-h-[430px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
              </div>
            </Reveal>
          )}

          {/* Real Styled Blog HTML Content */}
          <Reveal delay={60}>
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          </Reveal>

          {/* Quick Lead & WhatsApp Consultation Card */}
          <div className="mt-14 rounded-[26px] bg-gradient-to-br from-[#1c140d] to-[#271d12] p-7 sm:p-9 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 size-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11.5px] font-semibold uppercase tracking-wider text-amber-300">
                  <Sparkles className="size-3" /> Özel İmalat & Keşif
                </span>
                <h3 className="font-display text-[22px] sm:text-[25px] font-semibold text-white leading-snug">
                  Eviniz İçin Özel Ölçü Mobilya mı Planlıyorsunuz?
                </h3>
                <p className="text-[14px] text-white/75 leading-relaxed">
                  Konya atölyemizde mutfak dolabı, gardırop, vestiyer ve komple ev yenileme projeleriniz için 40 yılı aşkın tecrübeyle ücretsiz keşif ve 3D projelendirme yapıyoruz.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
                <a
                  href={`https://api.whatsapp.com/send?phone=905071721196&text=${encodeURIComponent(
                    `Merhaba Ahmet Usta, web sitenizdeki "${post.title}" makalenizi okudum. Özel mobilya yaptırmak istiyorum, bilgi alabilir miyim?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-[14px] font-semibold text-white shadow-md hover:brightness-110 transition cursor-pointer"
                >
                  <MessageCircle className="size-4" />
                  <span>WhatsApp'tan Yazın</span>
                </a>

                <a
                  href="tel:05071721196"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white/15 hover:bg-white/25 px-6 py-3 text-[14px] font-semibold text-white transition border border-white/20 cursor-pointer"
                >
                  <PhoneCall className="size-4" />
                  <span>0507 172 11 96</span>
                </a>
              </div>
            </div>
          </div>

          {/* Author Box */}
          <div className="mt-12 rounded-[24px] border border-black/8 bg-[#faf8f5] p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
            <div className="size-20 rounded-full overflow-hidden bg-white border-2 border-black/10 shadow-sm shrink-0 flex items-center justify-center p-2.5">
              <img
                src="/images/logo-footer.png"
                alt="Parlak Mobilya ve Dekorasyon"
                className="size-full object-contain"
              />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h4 className="font-display text-[19px] font-semibold text-ink">
                  Ahmet Parlak (Ahmet Usta)
                </h4>
                <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-[11.5px] font-semibold text-black/60">
                  1984'ten Beri
                </span>
              </div>
              <p className="text-[13px] font-medium text-amber-800">
                Parlak Mobilya ve Dekorasyon Kurucusu & Baş Usta
              </p>
              <p className="text-[14px] text-subtle leading-relaxed pt-1">
                40 yılı aşkın süredir Konya Selçuklu Horozluhan Sanayi'deki atölyesinde özel ölçü ahşap mutfak dolapları, gardıroplar, vestiyerler ve komple mekan dekorasyon projeleri üretmektedir.
              </p>
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
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-black/10 bg-white hover:bg-black/5 text-[13px] font-medium text-ink transition cursor-pointer"
              >
                <Share2 className="size-3.5" />
                <span>{copiedLink ? "Kopyalandı!" : "Linki Kopyala"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Other Posts (Recommendations) */}
        {otherPosts.length > 0 && (
          <section className="bg-[#faf8f5] py-16 md:py-20 mt-16 border-t border-black/5">
            <div className="container-site max-w-[880px]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-black/40 block mb-1">
                    DİĞER YAZILAR
                  </span>
                  <h2 className="font-display text-[24px] sm:text-[28px] font-semibold text-ink">
                    İlginizi Çekebilecek Diğer Rehberler
                  </h2>
                </div>
                <Link
                  to="/blog"
                  className="text-[13.5px] font-semibold text-brown hover:underline hidden sm:inline-block"
                >
                  Tümünü Gör →
                </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {otherPosts.slice(0, 2).map((p) => (
                  <article
                    key={p.slug}
                    className="group flex flex-col overflow-hidden rounded-[22px] bg-white border border-black/8 shadow-2xs hover:shadow-md transition hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#1a120c]">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-ink shadow-2xs uppercase tracking-wider">
                          {p.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-center gap-2 text-[12.5px] text-black/50 mb-2">
                        <span>{p.date}</span>
                        <span>•</span>
                        <span>{p.readTime}</span>
                      </div>
                      <h3 className="font-display text-[18px] font-semibold text-ink group-hover:text-brown transition line-clamp-2 leading-snug">
                        {p.title}
                      </h3>
                      <p className="mt-2 text-[13.5px] text-subtle line-clamp-2 leading-relaxed">
                        {p.metaDesc}
                      </p>
                      <div className="mt-auto pt-5">
                        <Link
                          to="/blog/$slug"
                          params={{ slug: p.slug }}
                          className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-brown group-hover:text-ink transition"
                        >
                          <span>Yazının Devamı</span>
                          <ArrowRight className="size-3.5" />
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
