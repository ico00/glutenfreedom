"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Users, ChefHat, Sparkles } from "lucide-react";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { useState, useEffect } from "react";
import type { Recipe } from "@/types";

const recipeEmojis = ["🍞", "🍫", "🍝"];

export function FeaturedRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    fetch("/api/recepti", {
      cache: 'no-store',
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Sortiraj po datumu (najnoviji prvi) i uzmi prva 3
          const sortedRecipes = data.sort((a: Recipe, b: Recipe) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setRecipes(sortedRecipes.slice(0, 3));
        }
      })
      .catch((error) => {
        console.error("Error loading recipes:", error);
        setRecipes([]);
      });
  }, []);

  // Ne prikazuj sekciju ako nema recepata
  if (recipes.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-gf-bg-soft py-20 dark:bg-neutral-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.2 }}
            className="mb-4 inline-flex items-center gap-2"
          >
            <ChefHat className="h-6 w-6 text-gf-cta" />
            <Sparkles className="h-5 w-5 text-gf-safe" />
          </motion.div>
          <h2 className="text-4xl font-bold text-gf-text-primary dark:text-neutral-100">
            Izdvojeni recepti
          </h2>
          <p className="mt-4 text-lg text-gf-text-secondary dark:text-neutral-400">
            Ukusni bezglutenski recepti za svaki dan
          </p>
        </motion.div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe, index) => (
            <motion.article
              key={recipe.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-gf-bg-card shadow-lg transition-all hover:border-gf-safe/50 hover:shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
            >
              <Link href={`/recepti/${recipe.id}`}>
                <div className="relative aspect-video w-full overflow-hidden">
                  <ImagePlaceholder
                    imageUrl={recipe.image}
                    alt={recipe.title}
                    emoji={recipeEmojis[index]}
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
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 + 0.3 }}
                    className="mb-3 flex items-center gap-4 text-sm text-gf-text-muted dark:text-neutral-400"
                  >
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{recipe.prepTime + recipe.cookTime} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{recipe.servings} porcija</span>
                    </div>
                  </motion.div>
                  <h3 className="mb-3 text-xl font-semibold text-gf-text-primary transition-colors group-hover:text-gf-cta dark:text-neutral-100 dark:group-hover:text-gf-cta">
                    {recipe.title}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-gf-text-secondary dark:text-neutral-400">
                    {recipe.description}
                  </p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 + 0.4 }}
                      whileHover={{ scale: 1.1 }}
                      className="cursor-default rounded-full bg-gf-safe/20 px-3 py-1 text-xs font-medium text-gf-safe transition-colors hover:bg-gf-safe/30 dark:bg-gf-safe/30 dark:text-gf-safe"
                    >
                      {recipe.category}
                    </motion.span>
                  </div>
                  <p className="inline-flex items-center gap-2 text-sm font-medium text-gf-cta transition-all group-hover:text-gf-cta-hover dark:text-gf-cta dark:group-hover:text-gf-cta-hover">
                    Vidi recept
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
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Link
            href="/recepti"
            className="group inline-flex items-center gap-2 rounded-xl border-2 border-gf-safe/30 bg-gf-bg-card px-8 py-3 text-sm font-semibold text-gf-text-primary transition-all hover:border-gf-safe hover:bg-gf-safe hover:text-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-gf-safe dark:hover:text-white"
          >
            Vidi sve recepte
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

