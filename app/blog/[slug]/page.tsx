// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

/** Pre-genera tutte le pagine articolo a build time (SSG, ideale per SEO). */
export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem" }}>
      <article>
        <h1>{post.title}</h1>
        <p style={{ color: "#666", fontSize: "0.9rem" }}>{post.date}</p>

        <div>
          <MDXRemote source={post.content} />
        </div>

        {post.faq && post.faq.length > 0 && (
          <section style={{ marginTop: "2rem" }}>
            <h2>Domande frequenti</h2>
            {post.faq.map((item, i) => (
              <div key={i} style={{ marginBottom: "1rem" }}>
                <strong>{item.question}</strong>
                <p>{item.answer}</p>
              </div>
            ))}
          </section>
        )}

        {post.cta && (
          <div style={{ marginTop: "2rem", padding: "1rem", background: "#f5f5f5", borderRadius: 8 }}>
            {post.cta}
          </div>
        )}

        {post.tags.length > 0 && (
          <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#666" }}>
            Tag: {post.tags.join(", ")}
          </div>
        )}
      </article>
    </main>
  );
}
