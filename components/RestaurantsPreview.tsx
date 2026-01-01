"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, UtensilsCrossed, Sparkles } from "lucide-react";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { Restaurant } from "@/types";

const restaurantEmojis = ["🍽️", "🥗", "🍴"];

export function RestaurantsPreview() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRestaurants() {
      try {
        const response = await fetch("/api/restorani", {
          cache: 'no-store',
        });
        if (response.ok) {
          const allRestaurants = await response.json();
          // Uzmi prva 3 restorana
          setRestaurants(allRestaurants.slice(0, 3));
        }
      } catch (error) {
        console.error("Error loading restaurants:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadRestaurants();
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

  if (restaurants.length === 0) {
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
            initial={{ scale: 0, rotate: 180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.2 }}
            className="mb-4 inline-flex items-center gap-2"
          >
            <UtensilsCrossed className="h-6 w-6 text-gf-cta" />
            <Sparkles className="h-5 w-5 text-gf-safe" />
          </motion.div>
          <h2 className="text-4xl font-bold text-gf-text-primary dark:text-neutral-100">
            Restorani u Zagrebu
          </h2>
          <p className="mt-4 text-lg text-gf-text-secondary dark:text-neutral-400">
            Pronađite restorane s bezglutenskim opcijama
          </p>
        </motion.div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant, index) => (
            <motion.article
              key={restaurant.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-gf-bg-card shadow-lg transition-all hover:border-gf-cta/30 hover:shadow-2xl dark:border-neutral-800 dark:bg-neutral-800"
            >
              <Link href={`/restorani/${restaurant.id}`}>
                <div className="relative aspect-video w-full overflow-hidden">
                  <ImagePlaceholder
                    imageUrl={restaurant.image}
                    alt={restaurant.name}
                    emoji={restaurantEmojis[index % restaurantEmojis.length]}
                    gradient="from-gf-cta/40 via-gf-safe/30 to-gf-cta/40"
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"
                  />
                </div>
                <div className="p-6">
                  <h3 className="mb-3 text-xl font-semibold text-gf-text-primary transition-colors group-hover:text-gf-cta dark:text-neutral-100 dark:group-hover:text-gf-cta">
                    {restaurant.name}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-sm text-gf-text-secondary dark:text-neutral-400">
                    {restaurant.description}
                  </p>
                  <div className="mb-4 flex items-center gap-2 text-sm text-gf-text-muted dark:text-neutral-400">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="line-clamp-1">{restaurant.address}</span>
                  </div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {restaurant.cuisine.slice(0, 2).map((cuisine, cuisineIndex) => (
                      <motion.span
                        key={cuisine}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 + cuisineIndex * 0.1 + 0.4 }}
                        whileHover={{ scale: 1.1 }}
                        className="cursor-default rounded-full bg-gf-bg-soft px-3 py-1 text-xs font-medium text-gf-text-secondary transition-colors hover:bg-gf-cta/20 dark:bg-neutral-700 dark:text-neutral-300"
                      >
                        {cuisine}
                      </motion.span>
                    ))}
                  </div>
                  <p className="inline-flex items-center gap-2 text-sm font-medium text-gf-cta transition-all group-hover:text-gf-cta-hover dark:text-gf-cta dark:group-hover:text-gf-cta-hover">
                    Vidi detalje
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
            href="/restorani"
            className="group inline-flex items-center gap-2 rounded-xl border-2 border-gf-cta/30 bg-gf-bg-card px-8 py-3 text-sm font-semibold text-gf-text-primary transition-all hover:border-gf-cta hover:bg-gf-cta hover:text-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-gf-cta dark:hover:text-white"
          >
            Vidi sve restorane
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
