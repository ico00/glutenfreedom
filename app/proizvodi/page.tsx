"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockProducts } from "@/data/mockData";
import { Search, CheckCircle, ChevronDown, Check, ShoppingBag, Wheat, ChefHat, Cookie, Coffee, Package, UtensilsCrossed, MoreHorizontal } from "lucide-react";
import { Product } from "@/types";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

// Mapiranje kategorija proizvoda na ikone
const productCategoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "sve": ShoppingBag,
  "brašno": Wheat,
  "tjestenine": ChefHat,
  "pekara": Cookie,
  "slatkiši": Cookie,
  "snack": Package,
  "pića": Coffee,
  "konzerve": Package,
  "začini": UtensilsCrossed,
  "ostalo": MoreHorizontal,
};

export default function ProizvodiPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("sve");
  const [allProducts, setAllProducts] = useState<Product[]>(mockProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

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

  // Zatvori dropdown kada se klikne izvan ili pritisne Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isCategoryOpen) {
        setIsCategoryOpen(false);
      }
    };

    if (isCategoryOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isCategoryOpen]);

  // Koristi statički definirane kategorije umjesto dinamičkih iz proizvoda
  const categories = ["sve", ...PRODUCT_CATEGORIES];
  
  const selectedCategoryLabel = selectedCategory === "sve" ? "Sve kategorije" : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
  const SelectedCategoryIcon = productCategoryIcons[selectedCategory] || ShoppingBag;

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === "sve" || 
        product.category.toLowerCase() === selectedCategory.toLowerCase();

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
            Pronađite bezglutenske proizvode za svakodnevnu prehranu
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
          
          {/* Custom Category Dropdown */}
          <div ref={categoryRef} className="relative">
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex w-full items-center justify-between rounded-lg border border-neutral-300 bg-gf-bg-card px-4 py-3 text-sm font-medium text-gf-text-primary transition-all hover:border-gf-cta hover:bg-gf-bg-soft focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
            >
              <div className="flex items-center gap-2">
                <SelectedCategoryIcon className="h-4 w-4 text-gf-cta" />
                <span>{selectedCategoryLabel}</span>
              </div>
              <ChevronDown 
                className={`h-4 w-4 text-gf-text-muted transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            <AnimatePresence>
              {isCategoryOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800"
                >
                  {categories.map((category) => {
                    const Icon = productCategoryIcons[category] || ShoppingBag;
                    const isSelected = selectedCategory === category;
                    const label = category === "sve" ? "Sve kategorije" : category.charAt(0).toUpperCase() + category.slice(1);
                    
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(category);
                          setIsCategoryOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                          isSelected
                            ? "bg-gf-cta/10 text-gf-cta dark:bg-gf-cta/20"
                            : "text-gf-text-primary hover:bg-gf-bg-soft dark:text-neutral-300 dark:hover:bg-neutral-700"
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isSelected ? 'text-gf-cta' : 'text-gf-text-muted'}`} />
                        <span className="flex-1">{label}</span>
                        {isSelected && (
                          <Check className="h-4 w-4 text-gf-cta" />
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
                      {product.weight && ` / ${product.weight}${product.weightUnit || "g"}`}
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

      </div>
    </div>
  );
}

