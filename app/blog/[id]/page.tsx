import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Script from "next/script";
import { mockBlogPosts } from "@/data/mockData";
import { Clock, ArrowLeft } from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { GallerySection } from "@/components/GallerySection";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { generateBlogPostMetadata } from "@/lib/metadata";
import { generateBlogPostingSchema, generateJsonLdScript } from "@/lib/seo";
import type { BlogPost } from "@/types";

// Učitaj dinamičke blog postove
async function getAllPosts() {
  try {
    // Koristi direktno getAllBlogPosts umjesto fetch-a za server-side rendering
    const { getAllBlogPosts } = await import("@/lib/blogUtils");
    const dynamicPosts = await getAllBlogPosts();
    return dynamicPosts;
  } catch (error) {
    console.error("Error loading blog posts:", error);
    return [];
  }
}

export async function generateStaticParams() {
  const allPosts = await getAllPosts();
  return allPosts.map((post: { id: string }) => ({
    id: post.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const allPosts = await getAllPosts();
  const post = allPosts.find((p: { id: string }) => p.id === id);
  if (!post) {
    return {
      title: "Članak nije pronađen",
    };
  }
  return generateBlogPostMetadata(post as BlogPost);
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const allPosts = await getAllPosts();
  const post = allPosts.find((p: { id: string }) => p.id === id);

  if (!post) {
    notFound();
  }

  // Helper funkcija za dohvaćanje tagova kao array
  const getPostTags = (post: any): string[] => {
    if (Array.isArray(post.tags)) {
      return post.tags;
    }
    return post.tags ? [post.tags] : [];
  };

  const postTags = getPostTags(post);
  const blogPostingSchema = generateBlogPostingSchema(post as BlogPost);

  return (
    <div className="bg-gf-bg-card py-12 dark:bg-neutral-900">
      <Script
        id="blog-posting-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateJsonLdScript(blogPostingSchema) }}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { name: "Blog", url: "/blog" },
            { name: post.title, url: `/blog/${post.id}` },
          ]}
        />
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gf-cta hover:text-gf-cta-hover dark:text-gf-cta dark:hover:text-gf-cta-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          Natrag na blog
        </Link>

        <article>
          <div className="mb-8 aspect-video w-full overflow-hidden rounded-2xl">
            <ImagePlaceholder
              imageUrl={post.image || undefined}
              alt={post.title}
              emoji="📚"
              gradient="from-gf-safe/40 via-gf-cta/30 to-gf-safe/40"
              priority
            />
          </div>

          <div className="mb-6 flex items-center gap-4 text-sm text-gf-text-secondary dark:text-neutral-400">
            <div className="flex items-center gap-1">
              <Clock className="h-5 w-5" />
              <span>{post.readTime} min čitanja</span>
            </div>
            <span>Autor: {post.author}</span>
            <span>{new Date(post.createdAt).toLocaleDateString("hr-HR")}</span>
          </div>

          <h1 className="mb-4 text-4xl font-bold text-gf-text-primary dark:text-neutral-100">
            {post.title}
          </h1>

          <div className="mb-8 flex flex-wrap gap-2">
            {postTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gf-safe/20 px-3 py-1 text-sm font-medium text-gf-safe dark:bg-gf-safe/30 dark:text-gf-safe"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Kratki opis - istaknut */}
          <div className="mb-8 rounded-lg border-l-4 border-gf-cta bg-gf-bg-soft/50 px-6 py-4 dark:bg-neutral-800/50">
            <p className="text-xl font-semibold leading-relaxed text-gf-text-primary dark:text-neutral-100">
              {post.excerpt}
            </p>
          </div>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <div className="text-gf-text-primary dark:text-neutral-300">
              <MarkdownRenderer content={post.content} />
            </div>
          </div>

          {/* Galerija slika */}
          {post.gallery && post.gallery.length > 0 && (
            <GallerySection images={post.gallery} />
          )}

          <div className="mt-12">
            <Disclaimer />
          </div>
        </article>
      </div>
    </div>
  );
}

