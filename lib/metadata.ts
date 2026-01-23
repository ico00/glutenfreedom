import { Metadata } from "next";
import { BlogPost, Recipe, Restaurant, Product } from "@/types";
import { getAbsoluteUrl, getImageUrl } from "./seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_NAME = "Bezglutenska sila";

// Osnovni metadata za glavnu stranicu
export function generateHomeMetadata(): Metadata {
  return {
    title: "Bezglutenska sila - Celijakija, Recepti i Savjeti",
    description: "Web aplikacija i informativna platforma vezana uz celijakiju, gluten free recepte, savjete, restorane i proizvode bez glutena.",
    keywords: ["celijakija", "gluten free", "recepti", "restorani", "Zagreb", "bez glutena", "gluten free recepti"],
    openGraph: {
      type: "website",
      locale: "hr_HR",
      url: SITE_URL,
      siteName: SITE_NAME,
      title: "Bezglutenska sila - Celijakija, Recepti i Savjeti",
      description: "Web aplikacija i informativna platforma vezana uz celijakiju, gluten free recepte, savjete, restorane i proizvode bez glutena.",
      images: [
        {
          url: getImageUrl("/images/og-image.jpg") || getAbsoluteUrl("/images/blog/default.jpg"),
          width: 1200,
          height: 630,
          alt: "Bezglutenska sila",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Bezglutenska sila - Celijakija, Recepti i Savjeti",
      description: "Web aplikacija i informativna platforma vezana uz celijakiju, gluten free recepte, savjete, restorane i proizvode bez glutena.",
      images: [getImageUrl("/images/og-image.jpg") || getAbsoluteUrl("/images/blog/default.jpg")],
    },
  };
}

// Metadata za blog post
export function generateBlogPostMetadata(post: BlogPost): Metadata {
  const tags = Array.isArray(post.tags) ? post.tags : [post.tags];
  const categories = Array.isArray(post.category) ? post.category : [post.category];

  return {
    title: `${post.title} | ${SITE_NAME}`,
    description: post.excerpt,
    keywords: tags,
    authors: [{ name: post.author }],
    openGraph: {
      type: "article",
      locale: "hr_HR",
      url: getAbsoluteUrl(`/blog/${post.id}`),
      siteName: SITE_NAME,
      title: post.title,
      description: post.excerpt,
      images: [
        {
          url: getImageUrl(post.image) || getAbsoluteUrl("/images/blog/default.jpg"),
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.createdAt,
      authors: [post.author],
      tags: tags,
      section: categories.join(", "),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [getImageUrl(post.image) || getAbsoluteUrl("/images/blog/default.jpg")],
    },
    alternates: {
      canonical: getAbsoluteUrl(`/blog/${post.id}`),
    },
  };
}

// Metadata za recept
export function generateRecipeMetadata(recipe: Recipe): Metadata {
  return {
    title: `${recipe.title} | ${SITE_NAME}`,
    description: recipe.description,
    keywords: ["recept", "gluten free", recipe.category],
    openGraph: {
      type: "article",
      locale: "hr_HR",
      url: getAbsoluteUrl(`/recepti/${recipe.id}`),
      siteName: SITE_NAME,
      title: recipe.title,
      description: recipe.description,
      images: [
        {
          url: getImageUrl(recipe.image) || getAbsoluteUrl("/images/recipes/default.jpg"),
          width: 1200,
          height: 630,
          alt: recipe.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: recipe.title,
      description: recipe.description,
      images: [getImageUrl(recipe.image) || getAbsoluteUrl("/images/recipes/default.jpg")],
    },
    alternates: {
      canonical: getAbsoluteUrl(`/recepti/${recipe.id}`),
    },
  };
}

// Metadata za restoran
export function generateRestaurantMetadata(restaurant: Restaurant): Metadata {
  return {
    title: `${restaurant.name} | ${SITE_NAME}`,
    description: restaurant.description,
    keywords: ["restoran", "gluten free", "Zagreb"],
    openGraph: {
      type: "website",
      locale: "hr_HR",
      url: getAbsoluteUrl(`/restorani/${restaurant.id}`),
      siteName: SITE_NAME,
      title: restaurant.name,
      description: restaurant.description,
      images: restaurant.image
        ? [
            {
              url: getImageUrl(restaurant.image) || getAbsoluteUrl("/images/restaurants/default.jpg"),
              width: 1200,
              height: 630,
              alt: restaurant.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: restaurant.name,
      description: restaurant.description,
      images: restaurant.image
        ? [getImageUrl(restaurant.image) || getAbsoluteUrl("/images/restaurants/default.jpg")]
        : undefined,
    },
    alternates: {
      canonical: getAbsoluteUrl(`/restorani/${restaurant.id}`),
    },
  };
}

// Metadata za proizvod
export function generateProductMetadata(product: Product): Metadata {
  return {
    title: `${product.name} | ${SITE_NAME}`,
    description: product.description,
    keywords: ["proizvod", "gluten free", product.brand, ...product.tags],
    openGraph: {
      type: "product",
      locale: "hr_HR",
      url: getAbsoluteUrl(`/proizvodi/${product.id}`),
      siteName: SITE_NAME,
      title: product.name,
      description: product.description,
      images: product.image
        ? [
            {
              url: getImageUrl(product.image) || getAbsoluteUrl("/images/products/default.jpg"),
              width: 1200,
              height: 630,
              alt: product.name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: product.image
        ? [getImageUrl(product.image) || getAbsoluteUrl("/images/products/default.jpg")]
        : undefined,
    },
    alternates: {
      canonical: getAbsoluteUrl(`/proizvodi/${product.id}`),
    },
  };
}

