import { createFileRoute, notFound } from "@tanstack/react-router";
import { getBlogPost } from "@/data/posts";
import { BlogPostView } from "@/components/pages/BlogPostView";

export const Route = createFileRoute("/yeni-web-sitemiz-yayinda")({
  loader: () => {
    const post = getBlogPost("yeni-web-sitemiz-yayinda");
    if (!post) throw notFound();
    return { post };
  },
  component: PostPage,
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.post.metaTitle ?? "Yeni Web Sitemiz Yayında! - Parlak Mobilya" },
      { name: "description", content: loaderData?.post.metaDesc ?? "" },
      { property: "og:title", content: loaderData?.post.metaTitle ?? "Yeni Web Sitemiz Yayında! - Parlak Mobilya" },
      { property: "og:description", content: loaderData?.post.metaDesc ?? "" },
      { property: "og:image", content: loaderData?.post.image ?? "" },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://www.parlakmobilyadekorasyon.com/blog/yeni-web-sitemiz-yayinda" },
    ],
    links: [
      { rel: "canonical", href: "https://www.parlakmobilyadekorasyon.com/blog/yeni-web-sitemiz-yayinda" },
    ],
  }),
});

function PostPage() {
  const { post } = Route.useLoaderData();
  return <BlogPostView post={post} />;
}
