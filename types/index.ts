export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  gallery?: string[]; // Galerija slika
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: "lako" | "srednje" | "teško";
  ingredients: string[]; // Učitava se iz Markdown fajla
  instructions: string[]; // Učitava se iz Markdown fajla
  category: string;
  tags?: string[]; // Opcionalno za backward compatibility
  createdAt: string;
}

// Metadata bez ingredients i instructions (sprema se u JSON)
export interface RecipeMetadata {
  id: string;
  title: string;
  description: string;
  image: string;
  gallery?: string[]; // Galerija slika
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: "lako" | "srednje" | "teško";
  category: string;
  tags?: string[]; // Opcionalno za backward compatibility
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string; // Markdown sadržaj (učitava se iz content/posts/[id].md)
  image: string;
  gallery?: string[]; // Galerija slika
  author: string;
  tags: string[];
  category: string | string[]; // Podržava i string (backward compatibility) i array (multiple categories)
  createdAt: string;
  readTime: number;
}

// Metadata bez content polja (sprema se u JSON)
export interface BlogPostMetadata {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  gallery?: string[];
  author: string;
  tags: string[];
  category: string | string[]; // Podržava i string (backward compatibility) i array (multiple categories)
  createdAt: string;
  readTime: number;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string | string[]; // Podržava i string (backward compatibility) i array
  phone?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  cuisine: string[];
  priceRange?: "€" | "€€" | "€€€"; // Opcionalno - uklonjeno iz forme
  rating?: number; // Opcionalno - uklonjeno iz forme
  image?: string;
  glutenFreeOptions?: "djelomično" | "potpuno"; // Opcionalno - uklonjeno iz forme
  location?: {
    lat: number;
    lng: number;
  };
}

export interface Store {
  id: string;
  name: string;
  description: string;
  address: string;
  phone?: string;
  website?: string;
  type: "dućan" | "online" | "oboje";
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  image?: string;
  store?: string;
  certified: boolean;
  price?: number;
  weight?: number;
  weightUnit?: "g" | "ml"; // jedinica mjere
}

