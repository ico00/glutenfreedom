"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { mockProducts, mockStores } from "@/data/mockData";
import { Search, CheckCircle } from "lucide-react";
import { Product } from "@/types";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

export default function ProizvodiPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("sve");
  const [allProducts, setAllProducts] = useState<Product[]>(mockProducts);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/proizvodi");
        if (response.ok) {
          const products = await response.json();
          setAllProducts(products);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  const categories = ["sve", ...Array.from(new Set(allProducts.map((p) => p.category)))];

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === "sve" || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, allProducts]);

  return (
    <div className="bg-gf-bg-card py-12 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gf-text-primary dark:text-neutral-100">
            Proizvodi bez glutena
          </h1>
          <p className="mt-4 text-lg text-gf-text-secondary dark:text-neutral-400">
            Pronađite proizvode i dućane s bezglutenskim artiklima
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gf-text-muted" />
            <input
              type="text"
              placeholder="Pretraži proizvode..."
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

        {/* Products Grid */}
        {isLoading ? (
          <div className="py-12 text-center">
            <p className="text-lg text-gf-text-secondary dark:text-neutral-400">Učitavanje...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product, index) => (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-gf-bg-card shadow-lg transition-all hover:border-gf-cta/30 hover:shadow-2xl dark:border-neutral-800 dark:bg-neutral-800"
              >
                {product.image && (
                  <div className="relative aspect-video w-full overflow-hidden">
                    <ImagePlaceholder
                      imageUrl={product.image}
                      alt={product.name}
                      emoji="🛒"
                      gradient="from-gf-safe/40 via-gf-cta/30 to-gf-safe/40"
                    />
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gf-text-primary transition-colors group-hover:text-gf-cta dark:text-neutral-100 dark:group-hover:text-gf-cta">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-sm text-gf-text-muted dark:text-neutral-400">
                        {product.brand}
                      </p>
                    </div>
                    {product.certified && (
                      <CheckCircle className="h-5 w-5 text-gf-safe dark:text-gf-safe" />
                    )}
                  </div>
                  <p className="mb-4 line-clamp-2 text-gf-text-secondary dark:text-neutral-400">
                    {product.description}
                  </p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {product.tags.filter(tag => tag.trim()).map((tag, tagIndex) => (
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
                  {product.store && (
                    <p className="text-sm text-gf-text-muted dark:text-neutral-400">
                      Dostupno u: {product.store}
                    </p>
                  )}
                  {product.price && (
                    <p className="mt-4 text-lg font-semibold text-gf-cta dark:text-gf-cta">
                      {product.price} €
                      {product.weight && ` / ${product.weight}g`}
                    </p>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-lg text-gf-text-secondary dark:text-neutral-400">
              Nema proizvoda koji odgovaraju vašim kriterijima.
            </p>
          </div>
        )}

        {/* Stores Section */}
        <div className="mt-16">
          <h2 className="mb-8 text-3xl font-bold text-gf-text-primary dark:text-neutral-100">
            Dućani s bezglutenskim proizvodima
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {mockStores.map((store, index) => (
              <motion.article
                key={store.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-gf-bg-card shadow-lg transition-all hover:border-gf-cta/30 hover:shadow-2xl dark:border-neutral-800 dark:bg-neutral-800"
              >
                {store.image && (
                  <div className="relative aspect-video w-full overflow-hidden">
                    <ImagePlaceholder
                      imageUrl={store.image}
                      alt={store.name}
                      emoji="🏪"
                      gradient="from-gf-cta/40 via-gf-safe/30 to-gf-cta/40"
                    />
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="mb-2 text-xl font-semibold text-gf-text-primary transition-colors group-hover:text-gf-cta dark:text-neutral-100 dark:group-hover:text-gf-cta">
                    {store.name}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-gf-text-secondary dark:text-neutral-400">
                    {store.description}
                  </p>
                  <div className="mb-4 flex items-center gap-2 text-sm text-gf-text-muted dark:text-neutral-400">
                    <span>{store.address}</span>
                  </div>
                  {store.website && (
                    <p className="inline-flex items-center gap-2 text-sm font-medium text-gf-cta transition-all group-hover:text-gf-cta-hover dark:text-gf-cta dark:group-hover:text-gf-cta-hover">
                      <a
                        href={store.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        Posjeti web stranicu
                        <motion.span
                          className="inline-block"
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
                        >
                          →
                        </motion.span>
                      </a>
                    </p>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

