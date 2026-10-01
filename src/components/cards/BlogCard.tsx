import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "@/data/site";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group relative block overflow-hidden rounded-[20px] aspect-[1.1/1] shadow-sm cursor-pointer"
    >
      {/* Blog Görseli */}
      {post.image ? (
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-[#f6f5f5]" />
      )}

      {/* Alt Beyaz Kutu */}
      <div className="absolute inset-x-4 bottom-4 sm:inset-x-5 sm:bottom-5">
        <div className="rounded-[16px] bg-white p-5 shadow-[0_10px_30px_rgba(13,1,0,0.08)] border border-black/5">
          <h3 className="font-['Lexend'] text-[16px] sm:text-[17px] font-semibold leading-snug tracking-[-0.3px] text-[#0d0100] line-clamp-2">
            {post.title}
          </h3>
          <span className="mt-3.5 inline-flex items-center gap-2 font-['Lexend'] text-[13.5px] font-medium text-[#524e4e] group-hover:text-[#0d0100] transition-colors">
            Devamını Oku
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
