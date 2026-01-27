"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Users, Search, ChefHat, ChevronDown, Check, Croissant, IceCream, Utensils, Salad, Pizza, Cake, Zap, Home, Cookie, Coffee, MoreHorizontal, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import type { Recipe } from "@/types";
import { RECIPE_CATEGORIES } from "@/lib/constants";

// Mapiranje kategorija recepta na ikone
const recipeCategoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "sve": ChefHat,
  "Pekara": Croissant,
  "Deserti": IceCream,
  "Glavna jela": Utensils,
  "Predjela": Salad,
  "Salate": Salad,
  "Pizze": Pizza,
  "Torte i kolači": Cake,
  "Brza hrana": Zap,
  "Domaća jela": Home,
  "Zimnica": Cookie,
  "Napitci": Coffee,
  "Ostalo": MoreHorizontal,
};

// Mapiranje težine na ikone
const difficultyIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "sve": ChefHat,
  "lako": TrendingDown,
  "srednje": Minus,
  "teško": TrendingUp,
};

export default function ReceptiPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const difficultyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Učitaj dinamičke recepte
    fetch("/api/recepti", {
      cache: 'no-store',
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRecipes(data);
        } else {
          console.error("API did not return an array:", data);
          setRecipes([]);
        }
      })
      .catch((error) => {
        console.error("Error loading recipes:", error);
        setRecipes([]);
      })
      .finally(() => setIsLoading(false));
  }, []);
  const [selectedCategory, setSelectedCategory] = useState<string>("sve");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("sve");

  // Zatvori dropdownove kada se klikne izvan ili pritisne Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (difficultyRef.current && !difficultyRef.current.contains(event.target as Node)) {
        setIsDifficultyOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCategoryOpen(false);
        setIsDifficultyOpen(false);
      }
    };

    if (isCategoryOpen || isDifficultyOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isCategoryOpen, isDifficultyOpen]);

  // Koristi statički definirane kategorije umjesto dinamičkih iz recepata
  const categories = ["sve", ...RECIPE_CATEGORIES];
  const difficulties = ["sve", "lako", "srednje", "teško"];
  
  const selectedCategoryLabel = selectedCategory === "sve" ? "Sve kategorije" : selectedCategory;
  const selectedDifficultyLabel = selectedDifficulty === "sve" ? "Sva težina" : selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1);
  const SelectedCategoryIcon = recipeCategoryIcons[selectedCategory] || ChefHat;
  const SelectedDifficultyIcon = difficultyIcons[selectedDifficulty] || ChefHat;

  const filteredRecipes = useMemo(() => {
    const filtered = recipes.filter((recipe) => {
      const matchesSearch =
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === "sve" || 
        recipe.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesDifficulty =
        selectedDifficulty === "sve" || recipe.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });

    // Sortiraj po datumu - najnoviji prvi
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Opadajući redoslijed (najnoviji prvi)
    });
  }, [searchQuery, selectedCategory, selectedDifficulty, recipes]);

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
            <ChefHat className="h-8 w-8 text-gf-cta" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gf-text-primary dark:text-neutral-100">
          Be careful not to choke on your aspirations

          </h1>
          <p className="mt-4 text-lg text-gf-text-secondary dark:text-neutral-400">
          Jednostavni bezglutenski recepti za koliko toliko jestivu hranu
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gf-text-muted" />
            <input
              type="text"
              placeholder="Pretraži recepte..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-gf-bg-card py-3 pl-10 pr-4 text-gf-text-primary placeholder-gf-text-muted focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            {/* Custom Category Dropdown */}
            <div ref={categoryRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsCategoryOpen(!isCategoryOpen);
                  setIsDifficultyOpen(false);
                }}
                className="flex items-center justify-between gap-2 rounded-lg border border-neutral-300 bg-gf-bg-card px-4 py-3 text-sm font-medium text-gf-text-primary transition-all hover:border-gf-cta hover:bg-gf-bg-soft focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
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
                    className="absolute left-0 top-full z-50 mt-2 w-64 max-h-80 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    {categories.map((category) => {
                      const Icon = recipeCategoryIcons[category] || ChefHat;
                      const isSelected = selectedCategory === category;
                      const label = category === "sve" ? "Sve kategorije" : category;
                      
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

            {/* Custom Difficulty Dropdown */}
            <div ref={difficultyRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsDifficultyOpen(!isDifficultyOpen);
                  setIsCategoryOpen(false);
                }}
                className="flex items-center justify-between gap-2 rounded-lg border border-neutral-300 bg-gf-bg-card px-4 py-3 text-sm font-medium text-gf-text-primary transition-all hover:border-gf-cta hover:bg-gf-bg-soft focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
              >
                <div className="flex items-center gap-2">
                  <SelectedDifficultyIcon className="h-4 w-4 text-gf-cta" />
                  <span>{selectedDifficultyLabel}</span>
                </div>
                <ChevronDown 
                  className={`h-4 w-4 text-gf-text-muted transition-transform ${isDifficultyOpen ? 'rotate-180' : ''}`} 
                />
              </button>

              <AnimatePresence>
                {isDifficultyOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 top-full z-50 mt-2 w-48 rounded-lg border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    {difficulties.map((difficulty) => {
                      const Icon = difficultyIcons[difficulty] || ChefHat;
                      const isSelected = selectedDifficulty === difficulty;
                      const label = difficulty === "sve" ? "Sva težina" : difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
                      
                      return (
                        <button
                          key={difficulty}
                          type="button"
                          onClick={() => {
                            setSelectedDifficulty(difficulty);
                            setIsDifficultyOpen(false);
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
        </div>

        {/* Recipes Grid */}
        {isLoading ? (
          <div className="py-12 text-center">
            <p className="text-lg text-gf-text-secondary dark:text-neutral-400">
              Učitavanje recepata...
            </p>
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecipes.map((recipe, index) => (
              <motion.article
                key={recipe.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-gf-bg-card shadow-lg transition-all hover:border-gf-safe/50 hover:shadow-2xl dark:border-neutral-800 dark:bg-neutral-800"
              >
                <Link href={`/recepti/${recipe.id}`}>
                  <div className="relative aspect-video w-full overflow-hidden">
                    <ImagePlaceholder
                      imageUrl={recipe.image}
                      alt={recipe.title}
                      emoji={["🍞", "🍫", "🍝"][index % 3]}
                      gradient="from-gf-cta/40 via-gf-safe/30 to-gf-cta/40"
                    />
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"
                    />
                    <motion.div
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                  </div>
                  <div className="p-6">
                    <div className="mb-3 flex items-center gap-4 text-sm text-gf-text-muted dark:text-neutral-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{recipe.prepTime + recipe.cookTime} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{recipe.servings} porcija</span>
                      </div>
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-gf-text-primary transition-colors group-hover:text-gf-cta dark:text-neutral-100 dark:group-hover:text-gf-cta">
                      {recipe.title}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-gf-text-secondary dark:text-neutral-400">
                      {recipe.description}
                    </p>
                    <div className="mb-4 flex flex-wrap gap-2">
                      <motion.span
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        whileHover={{ scale: 1.1 }}
                        className="cursor-default rounded-full bg-gf-safe/20 px-3 py-1 text-xs font-medium text-gf-safe transition-colors hover:bg-gf-safe/30 dark:bg-gf-safe/30 dark:text-gf-safe"
                      >
                        {recipe.category}
                      </motion.span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-lg text-gf-text-secondary dark:text-neutral-400">
              Nema recepata koji odgovaraju vašim kriterijima.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

