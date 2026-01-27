"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Check, Store as StoreIcon, ShoppingCart, Globe, MapPin, Phone, ExternalLink } from "lucide-react";
import { Store } from "@/types";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import Image from "next/image";

// Tipovi dućana
const storeTypes = [
  { value: "sve", label: "Svi dućani", icon: StoreIcon },
  { value: "dućan", label: "Fizički dućani", icon: MapPin },
  { value: "online", label: "Online trgovine", icon: Globe },
  { value: "oboje", label: "Fizički + Online", icon: ShoppingCart },
];

export default function DucaniPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("sve");
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const typeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadStores() {
      try {
        const response = await fetch("/api/ducani");
        if (response.ok) {
          const stores = await response.json();
          setAllStores(stores);
        }
      } catch (error) {
        console.error("Error loading stores:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadStores();
  }, []);

  // Zatvori dropdown kada se klikne izvan ili pritisne Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setIsTypeOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isTypeOpen) {
        setIsTypeOpen(false);
      }
    };

    if (isTypeOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isTypeOpen]);

  const selectedTypeData = storeTypes.find(t => t.value === selectedType) || storeTypes[0];
  const SelectedTypeIcon = selectedTypeData.icon;

  const filteredStores = useMemo(() => {
    return allStores.filter((store) => {
      const matchesSearch =
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === "sve" || store.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [searchQuery, selectedType, allStores]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "dućan": return "Fizički dućan";
      case "online": return "Online trgovina";
      case "oboje": return "Fizički + Online";
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "dućan": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "online": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "oboje": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <div className="bg-gf-bg-card py-12 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gf-text-primary dark:text-neutral-100">
            Dućani s bezglutenskim proizvodima
          </h1>
          <p className="mt-4 text-lg text-gf-text-secondary dark:text-neutral-400">
            Pronađite najbliži dućan ili online trgovinu s bezglutenskim proizvodima
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gf-text-secondary dark:text-neutral-500" />
            <input
              type="text"
              placeholder="Pretraži dućane..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white py-3 pl-10 pr-4 text-gf-text-primary shadow-sm placeholder:text-neutral-400 focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
          </div>

          {/* Type Filter - Custom Dropdown */}
          <div ref={typeRef} className="relative">
            <button
              type="button"
              onClick={() => setIsTypeOpen(!isTypeOpen)}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-left shadow-sm transition-all hover:border-gf-cta focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 sm:w-56"
            >
              <div className="flex items-center gap-2">
                <SelectedTypeIcon className="h-5 w-5 text-gf-cta" />
                <span className="text-gf-text-primary dark:text-neutral-100">
                  {selectedTypeData.label}
                </span>
              </div>
              <ChevronDown className={`h-5 w-5 text-neutral-400 transition-transform ${isTypeOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isTypeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-50 mt-2 w-full min-w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800"
                >
                  {storeTypes.map((type) => {
                    const TypeIcon = type.icon;
                    const isSelected = selectedType === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          setSelectedType(type.value);
                          setIsTypeOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                          isSelected ? "bg-gf-cta/10 dark:bg-gf-cta/20" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <TypeIcon className={`h-5 w-5 ${isSelected ? "text-gf-cta" : "text-neutral-400"}`} />
                          <span className={`${isSelected ? "font-medium text-gf-cta" : "text-gf-text-primary dark:text-neutral-100"}`}>
                            {type.label}
                          </span>
                        </div>
                        {isSelected && <Check className="h-5 w-5 text-gf-cta" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Results count */}
        <p className="mb-6 text-sm text-gf-text-secondary dark:text-neutral-400">
          {isLoading ? "Učitavanje..." : `Pronađeno ${filteredStores.length} dućana`}
        </p>

        {/* Stores Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-700 h-80" />
            ))}
          </div>
        ) : (
          <motion.div
            layout
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredStores.map((store, index) => (
                <motion.article
                  key={store.id}
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                  whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
                  className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-gf-bg-card shadow-lg transition-all hover:border-gf-cta/30 hover:shadow-2xl dark:border-neutral-800 dark:bg-neutral-800"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-neutral-100 dark:bg-neutral-700">
                    {store.image ? (
                      <Image
                        src={store.image}
                        alt={store.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <ImagePlaceholder emoji="🏪" gradient="from-gf-safe/40 via-gf-cta/30 to-gf-safe/40" />
                    )}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"
                    />
                    {/* Type Badge */}
                    <div className="absolute right-3 top-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-md ${getTypeColor(store.type)}`}>
                        {store.type === "online" && <Globe className="h-3.5 w-3.5" />}
                        {store.type === "dućan" && <MapPin className="h-3.5 w-3.5" />}
                        {store.type === "oboje" && <ShoppingCart className="h-3.5 w-3.5" />}
                        {getTypeLabel(store.type)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-semibold text-gf-text-primary transition-colors group-hover:text-gf-cta dark:text-neutral-100 dark:group-hover:text-gf-cta">
                      {store.name}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm text-gf-text-secondary dark:text-neutral-400">
                      {store.description}
                    </p>

                    {/* Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2 text-gf-text-secondary dark:text-neutral-400">
                        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span>{store.address}</span>
                      </div>
                      {store.phone && (
                        <div className="flex items-center gap-2 text-gf-text-secondary dark:text-neutral-400">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <a href={`tel:${store.phone}`} className="transition-colors hover:text-gf-cta">
                            {store.phone}
                          </a>
                        </div>
                      )}
                      {store.website && (
                        <motion.div 
                          className="flex items-center gap-2 pt-2"
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ExternalLink className="h-4 w-4 flex-shrink-0 text-gf-cta" />
                          <a
                            href={store.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-gf-cta transition-colors hover:text-gf-cta-hover"
                          >
                            Posjeti web stranicu →
                          </a>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* No results */}
        {!isLoading && filteredStores.length === 0 && (
          <div className="py-12 text-center">
            <StoreIcon className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-600" />
            <h3 className="mt-4 text-lg font-medium text-gf-text-primary dark:text-neutral-100">
              Nema pronađenih dućana
            </h3>
            <p className="mt-2 text-gf-text-secondary dark:text-neutral-400">
              Pokušajte s drugačijim pojmom za pretragu ili filtrom.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
