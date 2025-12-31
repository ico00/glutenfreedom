"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, BookOpen, Sparkles } from "lucide-react";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { BlogPost } from "@/types";

const blogEmojis = ["📚", "💡", "✨"];

export function LatestPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const response = await fetch("/api/blog");
        if (response.ok) {
          const allPosts = await response.json();
          // Sortiraj po datumu (najnoviji prvi) i uzmi prva 3
          const sortedPosts = allPosts.sort((a: BlogPost, b: BlogPost) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setPosts(sortedPosts.slice(0, 3));
        }
      } catch (error) {
        console.error("Error loading posts:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadPosts();
  }, []);

  if (isLoading) {
    return (
      <section className="relative bg-gf-bg-card py-20 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gf-text-secondary dark:text-neutral-400">
            Učitavanje...
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-gf-bg-card py-20 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.2 }}
            className="mb-4 inline-flex items-center gap-2"
          >
            <BookOpen className="h-6 w-6 text-gf-cta" />
            <Sparkles className="h-5 w-5 text-gf-safe" />
          </motion.div>
          <h2 className="text-4xl font-bold text-gf-text-primary dark:text-neutral-100">
            Najnoviji savjeti
          </h2>
          <p className="mt-4 text-lg text-gf-text-secondary dark:text-neutral-400">
            Edukativni članci o celijakiji i bezglutenskoj prehrani
          </p>
        </motion.div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-gf-bg-card shadow-lg transition-all hover:border-gf-cta/30 hover:shadow-2xl dark:border-neutral-800 dark:bg-neutral-800"
            >
              <div className="relative aspect-video w-full overflow-hidden">
                <ImagePlaceholder
                  imageUrl={post.image}
                  alt={post.title}
                  emoji={blogEmojis[index % blogEmojis.length]}
                  gradient="from-gf-safe/40 via-gf-cta/30 to-gf-safe/40"
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
                />
              </div>
              <div className="p-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 + 0.3 }}
                  className="mb-3 flex items-center gap-2 text-sm text-gf-text-muted dark:text-neutral-400"
                >
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime} min čitanja</span>
                </motion.div>
                <h3 className="mb-3 text-xl font-semibold text-gf-text-primary transition-colors group-hover:text-gf-cta dark:text-neutral-100 dark:group-hover:text-gf-cta">
                  {post.title}
                </h3>
                <p className="mb-4 line-clamp-2 text-gf-text-secondary dark:text-neutral-400">
                  {post.excerpt}
                </p>
                <Link
                  href={`/blog/${post.id}`}
                  className="group/link inline-flex items-center gap-2 text-sm font-medium text-gf-cta transition-all hover:text-gf-cta-hover dark:text-gf-cta dark:hover:text-gf-cta-hover"
                >
                  Pročitaj više
                  <motion.span
                    className="inline-block"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
                  >
                    →
                  </motion.span>
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 rounded-xl border-2 border-gf-cta/30 bg-gf-bg-card px-8 py-3 text-sm font-semibold text-gf-text-primary transition-all hover:border-gf-cta hover:bg-gf-cta hover:text-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-gf-cta dark:hover:text-white"
          >
            Vidi sve članke
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            >
              →
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

