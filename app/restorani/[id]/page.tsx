import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Script from "next/script";
import { MapPin, Phone, Globe, ArrowLeft, Facebook, Instagram } from "lucide-react";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { GoogleMap } from "@/components/GoogleMap";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Restaurant } from "@/types";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { mockRestaurants } from "@/data/mockData";
import { generateRestaurantMetadata } from "@/lib/metadata";
import { generateRestaurantSchema, generateJsonLdScript } from "@/lib/seo";

const restaurantsFilePath = path.join(process.cwd(), "data", "restaurants.json");
const deletedRestaurantsFilePath = path.join(process.cwd(), "data", "deletedRestaurants.json");

async function readRestaurantsFile(): Promise<Restaurant[]> {
  try {
    if (existsSync(restaurantsFilePath)) {
      const fileContents = await readFile(restaurantsFilePath, "utf-8");
      return JSON.parse(fileContents);
    }
    return [];
  } catch (error) {
    console.error("Error reading restaurants file:", error);
    return [];
  }
}

async function readDeletedRestaurantsFile(): Promise<string[]> {
  try {
    if (existsSync(deletedRestaurantsFilePath)) {
      const fileContents = await readFile(deletedRestaurantsFilePath, "utf-8");
      return JSON.parse(fileContents);
    }
    return [];
  } catch (error) {
    console.error("Error reading deleted restaurants file:", error);
    return [];
  }
}

async function getAllRestaurants(): Promise<Restaurant[]> {
  const dynamicRestaurants = await readRestaurantsFile();
  const deletedIds = await readDeletedRestaurantsFile();
  
  // Filtriraj mock restorane - ako postoji dinamički restoran s istim ID-om, koristi dinamički
  // Također filtriraj obrisane restorane
  const filteredMockRestaurants = mockRestaurants.filter(
    (mockRestaurant) => 
      !dynamicRestaurants.some((dynamicRestaurant) => dynamicRestaurant.id === mockRestaurant.id) &&
      !deletedIds.includes(mockRestaurant.id)
  );
  
  // Filtriraj dinamičke restorane - samo oni koji nisu obrisani
  const filteredDynamicRestaurants = dynamicRestaurants.filter(
    (restaurant) => !deletedIds.includes(restaurant.id)
  );
  
  return [...filteredMockRestaurants, ...filteredDynamicRestaurants];
}

async function getRestaurant(id: string): Promise<Restaurant | null> {
  const allRestaurants = await getAllRestaurants();
  return allRestaurants.find((r) => r.id === id) || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const restaurant = await getRestaurant(id);
  if (!restaurant) {
    return {
      title: "Restoran nije pronađen",
    };
  }
  return generateRestaurantMetadata(restaurant);
}

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const restaurant = await getRestaurant(id);

  if (!restaurant) {
    notFound();
  }

  const restaurantSchema = generateRestaurantSchema(restaurant);

  return (
    <div className="bg-gf-bg-card py-12 dark:bg-neutral-900">
      <Script
        id="restaurant-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateJsonLdScript(restaurantSchema) }}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { name: "Restorani", url: "/restorani" },
            { name: restaurant.name, url: `/restorani/${restaurant.id}` },
          ]}
        />
        <Link
          href="/restorani"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gf-cta hover:text-gf-cta-hover dark:text-gf-cta dark:hover:text-gf-cta-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          Natrag na restorane
        </Link>

        <article>
          {restaurant.image && (
            <div className="mb-8 aspect-video w-full overflow-hidden rounded-2xl">
              <ImagePlaceholder
                imageUrl={restaurant.image}
                alt={restaurant.name}
                emoji="🍽️"
                gradient="from-gf-cta/40 via-gf-safe/30 to-gf-cta/40"
              />
            </div>
          )}

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-gf-text-primary dark:text-neutral-100">
                {restaurant.name}
              </h1>
            </div>
          </div>

          <p className="mb-8 text-lg text-gf-text-secondary dark:text-neutral-400">
            {restaurant.description}
          </p>

          <div className="mb-8 space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-gf-text-muted dark:text-neutral-400" />
              <div className="flex-1">
                <p className="mb-2 font-medium text-gf-text-primary dark:text-neutral-100">
                  Adresa
                </p>
                <p className="mb-4 text-gf-text-secondary dark:text-neutral-400">
                  {Array.isArray(restaurant.address) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {restaurant.address.map((addr, index) => (
                        <li key={index}>{addr}</li>
                      ))}
                    </ul>
                  ) : (
                    restaurant.address
                  )}
                </p>
                
                {/* Google Maps */}
                <div className="overflow-hidden rounded-lg">
                  <GoogleMap restaurant={restaurant} height="300px" />
                </div>
              </div>
            </div>

            {restaurant.phone && (
              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-5 w-5 text-gf-text-muted dark:text-neutral-400" />
                <div>
                  <p className="font-medium text-gf-text-primary dark:text-neutral-100">
                    Telefon
                  </p>
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="text-gf-cta hover:text-gf-cta-hover dark:text-gf-cta dark:hover:text-gf-cta-hover"
                  >
                    {restaurant.phone}
                  </a>
                </div>
              </div>
            )}

            {(restaurant.website || restaurant.facebook || restaurant.instagram || restaurant.tiktok) && (
              <div className="flex items-start gap-3">
                <Globe className="mt-1 h-5 w-5 text-gf-text-muted dark:text-neutral-400" />
                <div className="flex-1">
                  <p className="mb-2 font-medium text-gf-text-primary dark:text-neutral-100">
                    Web/društvene mreže
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {restaurant.website && (
                      <a
                        href={restaurant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-gf-cta/10 px-3 py-2 text-sm text-gf-cta transition-colors hover:bg-gf-cta/20 dark:bg-gf-cta/20 dark:hover:bg-gf-cta/30"
                      >
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    )}
                    {restaurant.facebook && (
                      <a
                        href={restaurant.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-2 text-sm text-blue-600 transition-colors hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30"
                      >
                        <Facebook className="h-4 w-4" />
                        Facebook
                      </a>
                    )}
                    {restaurant.instagram && (
                      <a
                        href={restaurant.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-pink-500/10 px-3 py-2 text-sm text-pink-600 transition-colors hover:bg-pink-500/20 dark:bg-pink-500/20 dark:text-pink-400 dark:hover:bg-pink-500/30"
                      >
                        <Instagram className="h-4 w-4" />
                        Instagram
                      </a>
                    )}
                    {restaurant.tiktok && (
                      <a
                        href={restaurant.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-black/10 px-3 py-2 text-sm text-black transition-colors hover:bg-black/20 dark:bg-neutral-700/20 dark:text-neutral-300 dark:hover:bg-neutral-700/30"
                      >
                        <span className="text-xs font-bold">TT</span>
                        TikTok
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-semibold text-gf-text-primary dark:text-neutral-100">
              Tip kuhinje
            </h2>
            <div className="flex flex-wrap gap-2">
              {restaurant.cuisine.map((cuisine) => (
                <span
                  key={cuisine}
                  className="rounded-full bg-gf-bg-soft px-4 py-2 text-sm font-medium text-gf-text-secondary dark:bg-neutral-700 dark:text-neutral-300"
                >
                  {cuisine}
                </span>
              ))}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

