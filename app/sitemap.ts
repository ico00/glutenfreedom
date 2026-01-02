import { MetadataRoute } from "next";
import { getAllBlogPosts } from "@/lib/blogUtils";
import { getAllRecipes } from "@/lib/recipeUtils";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { Restaurant, Product } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function getAllRestaurants(): Promise<Restaurant[]> {
  const restaurantsFilePath = path.join(process.cwd(), "data", "restaurants.json");
  const deletedRestaurantsFilePath = path.join(process.cwd(), "data", "deletedRestaurants.json");

  try {
    let restaurants: Restaurant[] = [];
    let deletedIds: string[] = [];

    if (existsSync(restaurantsFilePath)) {
      const fileContents = await readFile(restaurantsFilePath, "utf-8");
      restaurants = JSON.parse(fileContents);
    }

    if (existsSync(deletedRestaurantsFilePath)) {
      const fileContents = await readFile(deletedRestaurantsFilePath, "utf-8");
      deletedIds = JSON.parse(fileContents);
    }

    return restaurants.filter((r) => !deletedIds.includes(r.id));
  } catch (error) {
    console.error("Error reading restaurants:", error);
    return [];
  }
}

async function getAllProducts(): Promise<Product[]> {
  const productsFilePath = path.join(process.cwd(), "data", "products.json");
  const deletedProductsFilePath = path.join(process.cwd(), "data", "deletedProducts.json");

  try {
    let products: Product[] = [];
    let deletedIds: string[] = [];

    if (existsSync(productsFilePath)) {
      const fileContents = await readFile(productsFilePath, "utf-8");
      products = JSON.parse(fileContents);
    }

    if (existsSync(deletedProductsFilePath)) {
      const fileContents = await readFile(deletedProductsFilePath, "utf-8");
      deletedIds = JSON.parse(fileContents);
    }

    return products.filter((p) => !deletedIds.includes(p.id));
  } catch (error) {
    console.error("Error reading products:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // Glavne stranice
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/recepti`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/restorani`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/proizvodi`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Blog postovi
  const blogPosts = await getAllBlogPosts();
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: new Date(post.createdAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Recepti
  const recipes = await getAllRecipes();
  const recipePages: MetadataRoute.Sitemap = recipes.map((recipe) => ({
    url: `${baseUrl}/recepti/${recipe.id}`,
    lastModified: new Date(recipe.createdAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Restorani
  const restaurants = await getAllRestaurants();
  const restaurantPages: MetadataRoute.Sitemap = restaurants.map((restaurant) => ({
    url: `${baseUrl}/restorani/${restaurant.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Proizvodi (ako ima detail stranice u budućnosti)
  // Za sada samo listing stranica

  return [...staticPages, ...blogPages, ...recipePages, ...restaurantPages];
}

