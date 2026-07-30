// lib/blog.ts
//
// Legge i file MDX da content/blog/, ne estrae il frontmatter (title,
// description, slug, date, tags, cta, faq) e il corpo Markdown.
// Nessun database: gli articoli SONO i file nel repo — è il modello
// standard per un blog statico Next.js su Vercel.
//
// Dipendenze richieste (da aggiungere al package.json del sito):
//   npm install gray-matter next-mdx-remote

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface BlogFrontmatter {
  title: string;
  description: string;
  excerpt: string;
  slug: string;
  date: string;
  tags: string[];
  cta?: string;
  faq?: { question: string; answer: string }[];
}

export interface BlogPost extends BlogFrontmatter {
  content: string; // corpo MDX grezzo, da passare a <MDXRemote>
}

/** Elenca tutti gli slug disponibili (nome file senza estensione .mdx). */
export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

/** Legge e parsa un singolo articolo dato lo slug. Restituisce null se non esiste. */
export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    title: data.title ?? slug,
    description: data.description ?? "",
    excerpt: data.excerpt ?? "",
    slug: data.slug ?? slug,
    date: data.date ?? "",
    tags: data.tags ?? [],
    cta: data.cta,
    faq: data.faq,
    content,
  };
}

/** Elenca tutti gli articoli con solo il frontmatter, ordinati dal più recente. */
export function getAllPosts(): BlogFrontmatter[] {
  return getAllPostSlugs()
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(({ content, ...frontmatter }) => frontmatter);
}
