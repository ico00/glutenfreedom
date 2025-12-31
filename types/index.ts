export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: "lako" | "srednje" | "teško";
  ingredients: string[];
  instructions: string[];
  tags: string[];
  category: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  gallery?: string[]; // Galerija slika
  author: string;
  tags: string[];
  category: string;
  createdAt: string;
  readTime: number;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone?: string;
  website?: string;
  cuisine: string[];
  priceRange: "€" | "€€" | "€€€";
  rating?: number;
  image?: string;
  glutenFreeOptions: "djelomično" | "potpuno";
  location: {
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
  tags: string[];
  certified: boolean;
  price?: number;
  weight?: number; // u gramima
}

