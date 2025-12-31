"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { mockRestaurants } from "@/data/mockData";
import { MapPin, Star, Search, UtensilsCrossed } from "lucide-react";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Restaurant } from "@/types";

export default function RestoraniPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("sve");
  const [selectedGF, setSelectedGF] = useState<string>("sve");
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRestaurants() {
      try {
        const response = await fetch("/api/restorani");
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

  const allCuisines = Array.from(
    new Set(allRestaurants.flatMap((r) => r.cuisine))
  );

  const filteredRestaurants = useMemo(() => {
    return allRestaurants.filter((restaurant) => {
      const matchesSearch =
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCuisine =
        selectedCuisine === "sve" || restaurant.cuisine.includes(selectedCuisine);

      const matchesGF =
        selectedGF === "sve" ||
        (selectedGF === "potpuno" && restaurant.glutenFreeOptions === "potpuno") ||
        (selectedGF === "djelomično" && restaurant.glutenFreeOptions === "djelomično");

      return matchesSearch && matchesCuisine && matchesGF;
    });
  }, [searchQuery, selectedCuisine, selectedGF, allRestaurants]);

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
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-gf-bg-card px-4 py-2 text-sm text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="sve">Sve kuhinje</option>
              {allCuisines.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={selectedGF}
              onChange={(e) => setSelectedGF(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-gf-bg-card px-4 py-2 text-sm text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="sve">Sve opcije</option>
              <option value="potpuno">Potpuno bezglutenski</option>
              <option value="djelomično">Djelomično bezglutenski</option>
            </select>
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
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 + cuisineIndex * 0.1 + 0.3 }}
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

