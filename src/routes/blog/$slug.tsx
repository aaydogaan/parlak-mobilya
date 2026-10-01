import { createFileRoute, notFound } from "@tanstack/react-router";
import { getBlogPost } from "@/data/posts";
import { BlogPostView } from "@/components/pages/BlogPostView";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getBlogPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  component: BlogPostPage,
  head: ({ loaderData, params }) => ({
    meta: [
      { title: loaderData?.post.metaTitle ?? "Blog — Parlak Mobilya" },
      { name: "description", content: loaderData?.post.metaDesc ?? "" },
      { property: "og:title", content: loaderData?.post.metaTitle ?? "Blog — Parlak Mobilya" },
      { property: "og:description", content: loaderData?.post.metaDesc ?? "" },
      { property: "og:image", content: loaderData?.post.image ?? "" },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `https://www.parlakmobilyadekorasyon.com/blog/${params.slug}` },
    ],
    links: [
      { rel: "canonical", href: `https://www.parlakmobilyadekorasyon.com/blog/${params.slug}` },
    ],
  }),
});

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  return <BlogPostView post={post} />;
}
