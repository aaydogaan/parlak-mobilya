import { createFileRoute, notFound } from "@tanstack/react-router";
import { getBlogPostBySlugServerFn, getBlogPostsServerFn } from "@/lib/server/blog";
import { BlogPostView } from "@/components/pages/BlogPostView";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await getBlogPostBySlugServerFn({ data: { slug: params.slug } });
    if (!post || post.status === "draft") throw notFound();

    const allPosts = await getBlogPostsServerFn({ data: { includeDrafts: false } });
    const otherPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

    return { post, otherPosts };
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
  const { post, otherPosts } = Route.useLoaderData();
  return <BlogPostView post={post} otherPosts={otherPosts} />;
}
