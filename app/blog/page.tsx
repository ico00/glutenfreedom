"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { mockBlogPosts } from "@/data/mockData";
import { Clock, Search, BookOpen } from "lucide-react";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { BlogPost } from "@/types";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("sve");
  const [allPosts, setAllPosts] = useState<BlogPost[]>(mockBlogPosts);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const response = await fetch("/api/blog", {
          cache: 'no-store',
        });
        if (response.ok) {
          const posts = await response.json();
          setAllPosts(posts);
        }
      } catch (error) {
        console.error("Error loading posts:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadPosts();
  }, []);

  const categories = ["sve", ...Array.from(new Set(allPosts.map((p) => p.category)))];

  const filteredPosts = useMemo(() => {
    const filtered = allPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === "sve" || post.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sortiraj po datumu - najnoviji prvi
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Opadajući redoslijed (najnoviji prvi)
    });
  }, [searchQuery, selectedCategory, allPosts]);

  return (
    <div className="bg-gf-bg-card py-12 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="mb-4 inline-flex items-center gap-2"
          >
            <BookOpen className="h-8 w-8 text-gf-cta" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gf-text-primary dark:text-neutral-100">
            Blog i Savjeti
          </h1>
          <p className="mt-4 text-lg text-gf-text-secondary dark:text-neutral-400">
            Edukativni članci o celijakiji i bezglutenskoj prehrani
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gf-text-muted" />
            <input
              type="text"
              placeholder="Pretraži članke..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-gf-bg-card py-3 pl-10 pr-4 text-gf-text-primary placeholder-gf-text-muted focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-gf-bg-card px-4 py-2 text-sm text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-gf-bg-card shadow-lg transition-all hover:border-gf-cta/30 hover:shadow-2xl dark:border-neutral-800 dark:bg-neutral-800"
              >
                <Link href={`/blog/${post.id}`}>
                  <div className="relative aspect-video w-full overflow-hidden">
                    <ImagePlaceholder
                      imageUrl={post.image || undefined}
                      alt={post.title}
                      emoji={["📚", "💡", "✨"][index % 3]}
                      gradient="from-gf-safe/40 via-gf-cta/30 to-gf-safe/40"
                    />
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
                    />
                  </div>
                  <div className="p-6">
                    <div className="mb-3 flex items-center gap-2 text-sm text-gf-text-muted dark:text-neutral-400">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime} min čitanja</span>
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-gf-text-primary transition-colors group-hover:text-gf-cta dark:text-neutral-100 dark:group-hover:text-gf-cta">
                      {post.title}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-gf-text-secondary dark:text-neutral-400">
                      {post.excerpt}
                    </p>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {post.tags.map((tag, tagIndex) => (
                        <motion.span
                          key={tag}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 + tagIndex * 0.1 + 0.3 }}
                          whileHover={{ scale: 1.1 }}
                          className="cursor-default rounded-full bg-gf-safe/20 px-3 py-1 text-xs font-medium text-gf-safe transition-colors hover:bg-gf-safe/30 dark:bg-gf-safe/30 dark:text-gf-safe"
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                    <p className="inline-flex items-center gap-2 text-sm font-medium text-gf-cta transition-all group-hover:text-gf-cta-hover dark:text-gf-cta dark:group-hover:text-gf-cta-hover">
                      Pročitaj više
                      <motion.span
                        className="inline-block"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
                      >
                        →
                      </motion.span>
                    </p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-lg text-gf-text-secondary dark:text-neutral-400">
              Nema članaka koji odgovaraju vašim kriterijima.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

