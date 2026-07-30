// app/blog/page.tsx
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata = {
  title: "Blog",
  description: "Articoli e guide.",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>Blog</h1>

      {posts.length === 0 && <p>Nessun articolo pubblicato ancora.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {posts.map((post) => (
          <li key={post.slug} style={{ marginBottom: "2rem" }}>
            <Link href={`/blog/${post.slug}`}>
              <h2 style={{ marginBottom: "0.25rem" }}>{post.title}</h2>
            </Link>
            <p style={{ color: "#666", fontSize: "0.9rem" }}>{post.date}</p>
            <p>{post.excerpt}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
