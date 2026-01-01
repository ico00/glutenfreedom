import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, Phone, Globe, ArrowLeft } from "lucide-react";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Restaurant } from "@/types";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { mockRestaurants } from "@/data/mockData";

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
  return {
    title: `${restaurant.name} | Gluten Freedom`,
    description: restaurant.description,
  };
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

  return (
    <div className="bg-gf-bg-card py-12 dark:bg-neutral-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/restorani"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gf-cta hover:text-gf-cta-hover dark:text-gf-cta dark:hover:text-gf-cta-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          Natrag na restorane
        </Link>

        <article>
          <div className="mb-8 aspect-video w-full overflow-hidden rounded-2xl">
            <ImagePlaceholder
              imageUrl={restaurant.image}
              alt={restaurant.name}
              emoji="🍽️"
              gradient="from-gf-cta/40 via-gf-safe/30 to-gf-cta/40"
            />
          </div>

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
              <div>
                <p className="font-medium text-gf-text-primary dark:text-neutral-100">
                  Adresa
                </p>
                <p className="text-gf-text-secondary dark:text-neutral-400">
                  {restaurant.address}
                </p>
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

            {restaurant.website && (
              <div className="flex items-start gap-3">
                <Globe className="mt-1 h-5 w-5 text-gf-text-muted dark:text-neutral-400" />
                <div>
                  <p className="font-medium text-gf-text-primary dark:text-neutral-100">
                    Web stranica
                  </p>
                  <a
                    href={restaurant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gf-cta hover:text-gf-cta-hover dark:text-gf-cta dark:hover:text-gf-cta-hover"
                  >
                    {restaurant.website}
                  </a>
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

