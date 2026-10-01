import { createFileRoute, notFound } from "@tanstack/react-router";
import { getBlogPost } from "@/data/posts";
import { BlogPostView } from "@/components/pages/BlogPostView";

export const Route = createFileRoute(
  "/ozel-olcu-mobilya-yaptirmadan-once-dikkat-edilmesi-gerekenler"
)({
  loader: () => {
    const post = getBlogPost(
      "ozel-olcu-mobilya-yaptirmadan-once-dikkat-edilmesi-gerekenler"
    );
    if (!post) throw notFound();
    return { post };
  },
  component: PostPage,
  head: ({ loaderData }) => ({
    meta: [
      {
        title:
          loaderData?.post.metaTitle ??
          "Özel Ölçü Mobilya Yaptırmadan Önce Nelere Dikkat Edilmeli?",
      },
      { name: "description", content: loaderData?.post.metaDesc ?? "" },
      {
        property: "og:title",
        content:
          loaderData?.post.metaTitle ??
          "Özel Ölçü Mobilya Yaptırmadan Önce Nelere Dikkat Edilmeli?",
      },
      { property: "og:description", content: loaderData?.post.metaDesc ?? "" },
      { property: "og:image", content: loaderData?.post.image ?? "" },
      { property: "og:type", content: "article" },
      {
        property: "og:url",
        content:
          "https://www.parlakmobilyadekorasyon.com/blog/ozel-olcu-mobilya-yaptirmadan-once-dikkat-edilmesi-gerekenler",
      },
    ],
    links: [
      {
        rel: "canonical",
        href:
          "https://www.parlakmobilyadekorasyon.com/blog/ozel-olcu-mobilya-yaptirmadan-once-dikkat-edilmesi-gerekenler",
      },
    ],
  }),
});

function PostPage() {
  const { post } = Route.useLoaderData();
  return <BlogPostView post={post} />;
}
