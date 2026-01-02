import { BlogPost, Recipe, Restaurant, Product } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Helper funkcija za kreiranje apsolutnog URL-a
export function getAbsoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

// Helper funkcija za kreiranje slike URL-a
export function getImageUrl(imagePath?: string): string | undefined {
  if (!imagePath) return undefined;
  if (imagePath.startsWith("http")) return imagePath;
  return getAbsoluteUrl(imagePath);
}

// Organization Schema
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Gluten Freedom",
    url: SITE_URL,
    logo: getAbsoluteUrl("/images/logo.png"), // Ako postoji logo
    description: "Web aplikacija i informativna platforma vezana uz celijakiju, gluten free recepte, savjete, restorane i proizvode bez glutena.",
    sameAs: [
      // Dodati social media linkove ako postoje
    ],
  };
}

// WebSite Schema
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Gluten Freedom",
    url: SITE_URL,
    description: "Web aplikacija i informativna platforma vezana uz celijakiju, gluten free recepte, savjete, restorane i proizvode bez glutena.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// BlogPosting Schema
export function generateBlogPostingSchema(post: BlogPost) {
  const tags = Array.isArray(post.tags) ? post.tags : [post.tags];
  const categories = Array.isArray(post.category) ? post.category : [post.category];

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: getImageUrl(post.image),
    datePublished: post.createdAt,
    dateModified: post.createdAt, // Može se ažurirati ako postoji updatedAt
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Gluten Freedom",
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": getAbsoluteUrl(`/blog/${post.id}`),
    },
    keywords: tags.join(", "),
    articleSection: categories.join(", "),
    articleBody: post.content,
  };
}

// Recipe Schema
export function generateRecipeSchema(recipe: Recipe) {
  const totalTime = recipe.prepTime + recipe.cookTime;

  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description,
    image: getImageUrl(recipe.image),
    author: {
      "@type": "Organization",
      name: "Gluten Freedom",
    },
    datePublished: recipe.createdAt,
    prepTime: `PT${recipe.prepTime}M`,
    cookTime: `PT${recipe.cookTime}M`,
    totalTime: `PT${totalTime}M`,
    recipeYield: recipe.servings.toString(),
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.instructions.map((instruction, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text: instruction,
    })),
    keywords: recipe.tags.join(", "),
    recipeCategory: recipe.category,
    recipeCuisine: "Gluten Free",
    difficulty: recipe.difficulty,
  };
}

// LocalBusiness Schema (za restorane)
export function generateRestaurantSchema(restaurant: Restaurant) {
  const address = Array.isArray(restaurant.address) 
    ? restaurant.address[0] 
    : restaurant.address;

  // Parsiraj adresu u strukturu (osnovna implementacija)
  const addressParts = address.split(",").map(s => s.trim());
  
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    description: restaurant.description,
    image: getImageUrl(restaurant.image),
    address: {
      "@type": "PostalAddress",
      streetAddress: addressParts[0] || address,
      addressLocality: "Zagreb",
      addressCountry: "HR",
    },
    servesCuisine: restaurant.cuisine,
  };

  if (restaurant.phone) {
    schema.telephone = restaurant.phone;
  }

  if (restaurant.website) {
    schema.url = restaurant.website;
  }

  if (restaurant.location) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: restaurant.location.lat,
      longitude: restaurant.location.lng,
    };
  }

  if (restaurant.priceRange) {
    schema.priceRange = restaurant.priceRange;
  }

  return schema;
}

// Product Schema
export function generateProductSchema(product: Product) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    image: getImageUrl(product.image),
    category: product.category,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
    },
  };

  if (product.price) {
    schema.offers.price = product.price;
    schema.offers.priceCurrency = "EUR";
  }

  if (product.certified) {
    schema.additionalProperty = [
      {
        "@type": "PropertyValue",
        name: "Certified Gluten Free",
        value: "Yes",
      },
    ];
  }

  return schema;
}

// BreadcrumbList Schema
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: getAbsoluteUrl(item.url),
    })),
  };
}

// Helper za generiranje JSON-LD script taga
export function generateJsonLdScript(schema: object): string {
  return JSON.stringify(schema, null, 2);
}

