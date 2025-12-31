import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { mockBlogPosts } from "@/data/mockData";
import { Clock, ArrowLeft } from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

// Učitaj dinamičke blog postove
async function getAllPosts() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/blog`, {
      cache: "no-store",
    });
    if (response.ok) {
      const dynamicPosts = await response.json();
      return dynamicPosts;
    }
  } catch {
    // Ako ne uspije, koristi samo mock podatke
  }
  return mockBlogPosts;
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
  return {
    title: `${post.title} | Gluten Freedom`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const allPosts = await getAllPosts();
  const post = allPosts.find((p: { id: string }) => p.id === id);

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-gf-bg-card py-12 dark:bg-neutral-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gf-cta hover:text-gf-cta-hover dark:text-gf-cta dark:hover:text-gf-cta-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          Natrag na blog
        </Link>

        <article>
          <div className="mb-8 aspect-video w-full overflow-hidden rounded-2xl">
            <ImagePlaceholder
              imageUrl={post.image}
              alt={post.title}
              emoji="📚"
              gradient="from-gf-safe/40 via-gf-cta/30 to-gf-safe/40"
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
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gf-safe/20 px-3 py-1 text-sm font-medium text-gf-safe dark:bg-gf-safe/30 dark:text-gf-safe"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p className="text-xl text-gf-text-primary dark:text-neutral-300">
              {post.excerpt}
            </p>
            <div
              className="mt-8 text-gf-text-primary dark:text-neutral-300 prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Galerija slika */}
          {post.gallery && post.gallery.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-6 text-2xl font-bold text-gf-text-primary dark:text-neutral-100">
                Galerija
              </h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {post.gallery.map((imageUrl, index) => (
                  <div key={index} className="relative aspect-square w-full overflow-hidden rounded-lg">
                    <ImagePlaceholder
                      imageUrl={imageUrl}
                      alt={`Galerija slika ${index + 1}`}
                      emoji="📷"
                      gradient="from-gf-cta/40 via-gf-safe/30 to-gf-cta/40"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12">
            <Disclaimer />
          </div>
        </article>
      </div>
    </div>
  );
}

