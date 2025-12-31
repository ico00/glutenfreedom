"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ChefHat, 
  BookOpen, 
  UtensilsCrossed, 
  Store, 
  Package,
  ArrowLeft,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { BlogPost, Product } from "@/types";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"recipes" | "blog" | "restaurants" | "products">("recipes");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "blog") {
      loadBlogPosts();
    } else if (activeTab === "products") {
      loadProducts();
    }
  }, [activeTab]);

  async function loadBlogPosts() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/blog");
      if (response.ok) {
        const posts = await response.json();
        setBlogPosts(posts);
      }
    } catch (error) {
      console.error("Error loading blog posts:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadProducts() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/proizvodi", {
        cache: 'no-store',
      });
      if (response.ok) {
        const productsData = await response.json();
        setProducts(productsData);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeletePost(id: string) {
    if (!confirm("Jesi li siguran da želiš obrisati ovaj post?")) {
      return;
    }

    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadBlogPosts();
      } else {
        alert("Greška pri brisanju posta");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Greška pri brisanju posta");
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("Jesi li siguran da želiš obrisati ovaj proizvod?")) {
      return;
    }

    try {
      const response = await fetch(`/api/proizvodi/${id}`, {
        method: "DELETE",
        cache: 'no-store',
      });

      if (response.ok) {
        await loadProducts();
        router.refresh();
      } else {
        alert("Greška pri brisanju proizvoda");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Greška pri brisanju proizvoda");
    }
  }

  return (
    <div className="min-h-screen bg-gf-bg py-12 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gf-cta hover:text-gf-cta-hover dark:text-gf-cta dark:hover:text-gf-cta-hover"
          >
            <ArrowLeft className="h-4 w-4" />
            Natrag na početnu
          </Link>
          <h1 className="text-4xl font-bold text-gf-text-primary dark:text-neutral-100">
            Admin Panel
          </h1>
          <p className="mt-2 text-lg text-gf-text-secondary dark:text-neutral-400">
            Upravljaj sadržajem aplikacije
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-neutral-200 dark:border-neutral-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "recipes", label: "Recepti", icon: ChefHat },
              { id: "blog", label: "Blog", icon: BookOpen },
              { id: "restaurants", label: "Restorani", icon: UtensilsCrossed },
              { id: "products", label: "Proizvodi", icon: Package },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-gf-cta text-gf-cta dark:border-gf-cta dark:text-gf-cta"
                      : "border-transparent text-gf-text-secondary hover:border-neutral-300 hover:text-gf-text-primary dark:text-neutral-400 dark:hover:text-neutral-300"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="rounded-2xl border border-neutral-200 bg-gf-bg-card p-8 dark:border-neutral-800 dark:bg-neutral-800">
          {activeTab === "recipes" && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gf-text-primary dark:text-neutral-100">
                  Recepti
                </h2>
                <Link
                  href="/admin/recepti/novi"
                  className="inline-flex items-center gap-2 rounded-lg bg-gf-cta px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-gf-cta-hover"
                >
                  <Plus className="h-4 w-4" />
                  Dodaj novi recept
                </Link>
              </div>
              <p className="text-gf-text-secondary dark:text-neutral-400">
                Upravljaj receptima. Klikni na "Dodaj novi recept" da kreneš.
              </p>
            </div>
          )}

          {activeTab === "blog" && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gf-text-primary dark:text-neutral-100">
                  Blog postovi
                </h2>
                <Link
                  href="/admin/blog/novi"
                  className="inline-flex items-center gap-2 rounded-lg bg-gf-cta px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-gf-cta-hover"
                >
                  <Plus className="h-4 w-4" />
                  Dodaj novi post
                </Link>
              </div>

              {isLoading ? (
                <p className="text-gf-text-secondary dark:text-neutral-400">Učitavanje...</p>
              ) : blogPosts.length === 0 ? (
                <p className="text-gf-text-secondary dark:text-neutral-400">
                  Nema blog postova. Klikni na "Dodaj novi post" da kreneš.
                </p>
              ) : (
                <div className="space-y-4">
                  {blogPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gf-text-primary dark:text-neutral-100">
                          {post.title}
                        </h3>
                        <p className="mt-1 text-sm text-gf-text-secondary dark:text-neutral-400">
                          {post.excerpt.substring(0, 100)}...
                        </p>
                        <div className="mt-2 flex gap-2 text-xs text-gf-text-muted dark:text-neutral-500">
                          <span>Kategorija: {post.category}</span>
                          <span>•</span>
                          <span>Autor: {post.author}</span>
                          <span>•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString("hr-HR")}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="rounded-lg bg-gf-cta/10 p-2 text-gf-cta transition-colors hover:bg-gf-cta/20 dark:bg-gf-cta/20 dark:hover:bg-gf-cta/30"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="rounded-lg bg-gf-risk/10 p-2 text-gf-risk transition-colors hover:bg-gf-risk/20 dark:bg-gf-risk/20 dark:hover:bg-gf-risk/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "restaurants" && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gf-text-primary dark:text-neutral-100">
                  Restorani
                </h2>
                <Link
                  href="/admin/restorani/novi"
                  className="inline-flex items-center gap-2 rounded-lg bg-gf-cta px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-gf-cta-hover"
                >
                  <Plus className="h-4 w-4" />
                  Dodaj novi restoran
                </Link>
              </div>
              <p className="text-gf-text-secondary dark:text-neutral-400">
                Upravljaj restoranima. Klikni na "Dodaj novi restoran" da kreneš.
              </p>
            </div>
          )}

          {activeTab === "products" && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gf-text-primary dark:text-neutral-100">
                  Proizvodi
                </h2>
                <Link
                  href="/admin/proizvodi/novi"
                  className="inline-flex items-center gap-2 rounded-lg bg-gf-cta px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-gf-cta-hover"
                >
                  <Plus className="h-4 w-4" />
                  Dodaj novi proizvod
                </Link>
              </div>

              {isLoading ? (
                <p className="text-gf-text-secondary dark:text-neutral-400">Učitavanje...</p>
              ) : products.length === 0 ? (
                <p className="text-gf-text-secondary dark:text-neutral-400">
                  Nema proizvoda. Klikni na "Dodaj novi proizvod" da kreneš.
                </p>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gf-text-primary dark:text-neutral-100">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-sm text-gf-text-secondary dark:text-neutral-400">
                          {product.description || "Bez opisa"}
                        </p>
                        <div className="mt-2 flex gap-2 text-xs text-gf-text-muted dark:text-neutral-500">
                          <span>Marka: {product.brand}</span>
                          <span>•</span>
                          <span>Kategorija: {product.category}</span>
                          {product.price && (
                            <>
                              <span>•</span>
                              <span>Cijena: {product.price} €</span>
                            </>
                          )}
                          {product.weight && (
                            <>
                              <span>•</span>
                              <span>Težina: {product.weight}g</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/proizvodi/${product.id}/edit`}
                          className="rounded-lg bg-gf-cta/10 p-2 text-gf-cta transition-colors hover:bg-gf-cta/20 dark:bg-gf-cta/20 dark:hover:bg-gf-cta/30"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="rounded-lg bg-gf-risk/10 p-2 text-gf-risk transition-colors hover:bg-gf-risk/20 dark:bg-gf-risk/20 dark:hover:bg-gf-risk/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

