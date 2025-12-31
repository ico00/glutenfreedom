"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { mockRestaurants } from "@/data/mockData";
import { MapPin, Star, UtensilsCrossed, Sparkles } from "lucide-react";
import { ImagePlaceholder } from "./ImagePlaceholder";

const restaurantEmojis = ["🍽️", "🥗", "🍴"];

export function RestaurantsPreview() {
  const restaurants = mockRestaurants.slice(0, 3);

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
                    emoji={restaurantEmojis[index]}
                    gradient="from-gf-cta/40 via-gf-safe/30 to-gf-cta/40"
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"
                  />
                </div>
                <div className="p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                        restaurant.glutenFreeOptions === "potpuno"
                          ? "bg-gf-safe/20 text-gf-safe dark:bg-gf-safe/30 dark:text-gf-safe"
                          : "bg-gf-caution/20 text-gf-caution dark:bg-gf-caution/30 dark:text-gf-caution"
                      }`}
                    >
                      {restaurant.glutenFreeOptions === "potpuno"
                        ? "Potpuno GF"
                        : "Djelomično GF"}
                    </motion.span>
                    {restaurant.rating && (
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="flex items-center gap-1 text-sm text-gf-text-secondary dark:text-neutral-400"
                      >
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{restaurant.rating}</span>
                      </motion.div>
                    )}
                  </div>
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
