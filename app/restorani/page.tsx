"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { mockRestaurants } from "@/data/mockData";
import { MapPin, Search, UtensilsCrossed } from "lucide-react";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Restaurant } from "@/types";

export default function RestoraniPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRestaurants() {
      try {
        const response = await fetch("/api/restorani", {
          cache: 'no-store',
        });
        if (response.ok) {
          const restaurants = await response.json();
          setAllRestaurants(restaurants);
        }
      } catch (error) {
        console.error("Error loading restaurants:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadRestaurants();
  }, []);

  const filteredRestaurants = useMemo(() => {
    return allRestaurants.filter((restaurant) => {
      const matchesSearch =
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(restaurant.address) 
          ? restaurant.address.some(addr => addr.toLowerCase().includes(searchQuery.toLowerCase()))
          : restaurant.address.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSearch;
    });
  }, [searchQuery, allRestaurants]);

  return (
    <div className="bg-gf-bg-card py-12 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="mb-4 inline-flex items-center gap-2"
          >
            <UtensilsCrossed className="h-8 w-8 text-gf-cta" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gf-text-primary dark:text-neutral-100">
            Restorani u Zagrebu
          </h1>
          <p className="mt-4 text-lg text-gf-text-secondary dark:text-neutral-400">
            Pronađite restorane s bezglutenskim opcijama
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gf-text-muted" />
            <input
              type="text"
              placeholder="Pretraži restorane..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-gf-bg-card py-3 pl-10 pr-4 text-gf-text-primary placeholder-gf-text-muted focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400"
            />
          </div>
        </div>

        {/* Restaurants Grid */}
        {isLoading ? (
          <div className="py-12 text-center">
            <p className="text-lg text-gf-text-secondary dark:text-neutral-400">Učitavanje...</p>
          </div>
        ) : filteredRestaurants.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredRestaurants.map((restaurant, index) => (
              <motion.article
                key={restaurant.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-gf-bg-card shadow-lg transition-all hover:border-gf-cta/30 hover:shadow-2xl dark:border-neutral-800 dark:bg-neutral-800"
              >
                <Link href={`/restorani/${restaurant.id}`}>
                  <div className="relative aspect-video w-full overflow-hidden">
                    <ImagePlaceholder
                      imageUrl={restaurant.image}
                      alt={restaurant.name}
                      emoji={["🍽️", "🥗", "🍴"][index % 3]}
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
                    <div className="mb-4 space-y-1 text-sm text-gf-text-muted dark:text-neutral-400">
                      {Array.isArray(restaurant.address) ? (
                        restaurant.address.map((addr, addrIndex) => (
                          <div key={addrIndex} className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span className="line-clamp-1">{addr}</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="line-clamp-1">{restaurant.address}</span>
                        </div>
                      )}
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
        ) : (
          <div className="py-12 text-center">
            <p className="text-lg text-gf-text-secondary dark:text-neutral-400">
              Nema restorana koji odgovaraju vašim kriterijima.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

