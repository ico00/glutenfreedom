"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X, Search, Package, Plus, ChefHat, Gauge } from "lucide-react";
import { Recipe, Product } from "@/types";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { CustomSelect } from "@/components/CustomSelect";
import { getCsrfToken } from "@/lib/csrfClient";
import { RECIPE_CATEGORIES } from "@/lib/constants";

export default function EditReceptPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]); // Postojeće slike (URL-ovi)
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]); // Nove slike (File objekti)
  const [newGalleryPreviews, setNewGalleryPreviews] = useState<string[]>([]); // Preview za nove slike
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null as File | null,
    prepTime: "",
    cookTime: "",
    servings: "",
    difficulty: "lako" as "lako" | "srednje" | "teško",
    ingredients: [""],
    instructions: [""],
    category: "",
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [showProductSearch, setShowProductSearch] = useState<number | null>(null);

  useEffect(() => {
    async function loadRecipe() {
      try {
        const response = await fetch(`/api/recepti/${recipeId}`, {
          cache: 'no-store',
        });
        if (response.ok) {
          const recipe: Recipe = await response.json();
          setFormData({
            title: recipe.title,
            description: recipe.description,
            image: null,
            prepTime: recipe.prepTime.toString(),
            cookTime: recipe.cookTime.toString(),
            servings: recipe.servings.toString(),
            difficulty: recipe.difficulty,
            ingredients: recipe.ingredients.length > 0 ? recipe.ingredients : [""],
            instructions: recipe.instructions.length > 0 ? recipe.instructions : [""],
            category: recipe.category,
          });
          setImagePreview(recipe.image || null);
          setExistingGalleryUrls(recipe.gallery || []);
          setNewGalleryFiles([]);
          setNewGalleryPreviews([]);
          
          // Ako kategorija nije u predefiniranoj listi, dodaj je privremeno
          if (recipe.category && !(RECIPE_CATEGORIES as readonly string[]).includes(recipe.category)) {
            // Kategorija će biti prikazana u dropdown-u jer je value postavljen
            // Ali možemo je dodati u listu ako želimo
          }
        }
      } catch (error) {
        console.error("Error loading recipe:", error);
        alert("Greška pri učitavanju recepta");
      } finally {
        setIsLoading(false);
      }
    }
    loadRecipe();
  }, [recipeId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setNewGalleryFiles((prev) => [...prev, ...files]);
      
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewGalleryPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveExistingGalleryImage = (index: number) => {
    setExistingGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewGalleryImage = (index: number) => {
    setNewGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setNewGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Kombiniraj postojeće i nove slike za prikaz i drag & drop
  const getAllGalleryItems = () => {
    const existing = existingGalleryUrls.map((url, index) => ({
      type: 'existing' as const,
      url,
      index,
    }));
    const newItems = newGalleryPreviews.map((preview, index) => ({
      type: 'new' as const,
      preview,
      fileIndex: index,
    }));
    return [...existing, ...newItems];
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const items = getAllGalleryItems();
    const draggedItem = items[draggedIndex];
    const newItems = [...items];
    newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    // Razdvoji postojeće i nove slike
    const newExisting: string[] = [];
    const newNewFiles: File[] = [];
    const newNewPreviews: string[] = [];

    newItems.forEach((item) => {
      if (item.type === 'existing') {
        newExisting.push(item.url);
      } else {
        newNewFiles.push(newGalleryFiles[item.fileIndex]);
        newNewPreviews.push(item.preview);
      }
    });

    setExistingGalleryUrls(newExisting);
    setNewGalleryFiles(newNewFiles);
    setNewGalleryPreviews(newNewPreviews);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleAddIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, ""],
    });
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData({ ...formData, ingredients: newIngredients });
    // Ne zatvaraj dropdown automatski - korisnik može nastaviti tipkati ili koristiti pretragu
  };

  // Učitaj proizvode
  useEffect(() => {
    async function loadProducts() {
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
      }
    }
    loadProducts();
  }, []);

  // Zatvori dropdown kada se klikne izvan
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showProductSearch !== null && !target.closest('.product-search-dropdown')) {
        setShowProductSearch(null);
        setProductSearchQuery("");
      }
    };

    if (showProductSearch !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showProductSearch]);

  // Filtriraj proizvode za pretraživanje
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(productSearchQuery.toLowerCase())
  ).slice(0, 5); // Prikaži samo prvih 5 rezultata

  const handleAddProductAsIngredient = (index: number, product: Product) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = `${product.name}${product.brand ? ` (${product.brand})` : ""}`;
    setFormData({ ...formData, ingredients: newIngredients });
    setShowProductSearch(null);
    setProductSearchQuery("");
  };

  const handleAddInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, ""],
    });
  };

  const handleRemoveInstruction = (index: number) => {
    setFormData({
      ...formData,
      instructions: formData.instructions.filter((_, i) => i !== index),
    });
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData({ ...formData, instructions: newInstructions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("prepTime", formData.prepTime);
      formDataToSend.append("cookTime", formData.cookTime);
      formDataToSend.append("servings", formData.servings);
      formDataToSend.append("difficulty", formData.difficulty);
      formDataToSend.append("category", formData.category);
      
      formData.ingredients.forEach((ingredient, index) => {
        formDataToSend.append(`ingredients[${index}]`, ingredient);
      });
      
      formData.instructions.forEach((instruction, index) => {
        formDataToSend.append(`instructions[${index}]`, instruction);
      });

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      // Pošalji galeriju u redoslijedu kako su prikazane (kombiniraj postojeće i nove)
      const allGalleryItems = getAllGalleryItems();
      const galleryOrder: Array<{ type: 'existing' | 'new'; index: number }> = [];
      
      allGalleryItems.forEach((item) => {
        if (item.type === 'existing') {
          galleryOrder.push({ type: 'existing', index: item.index });
        } else {
          galleryOrder.push({ type: 'new', index: item.fileIndex });
        }
      });

      // Pošalji redoslijed galerije
      formDataToSend.append("galleryOrder", JSON.stringify(galleryOrder));
      
      // Pošalji postojeće slike iz galerije (u originalnom redoslijedu)
      formDataToSend.append("existingGallery", JSON.stringify(existingGalleryUrls));

      // Pošalji nove slike
      newGalleryFiles.forEach((file, index) => {
        formDataToSend.append(`gallery_${index}`, file);
      });
      // Uvijek pošalji galleryCount, čak i ako je 0
      formDataToSend.append("galleryCount", newGalleryFiles.length.toString());

      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/recepti/${recipeId}`, {
        method: "PUT",
        body: formDataToSend,
        headers: {
          "x-csrf-token": csrfToken || "",
        },
      });

      if (response.ok) {
        router.push("/admin?success=recept-azuriran");
      } else {
        const error = await response.json();
        alert(`Greška: ${error.message || "Nešto je pošlo po zlu"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Greška pri ažuriranju recepta");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gf-bg py-12 dark:bg-neutral-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-gf-text-secondary dark:text-neutral-400">Učitavanje...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gf-bg py-12 dark:bg-neutral-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/admin"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gf-cta hover:text-gf-cta-hover dark:text-gf-cta dark:hover:text-gf-cta-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          Natrag na admin panel
        </Link>

        <h1 className="mb-8 text-4xl font-bold text-gf-text-primary dark:text-neutral-100">
          Uredi recept
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Osnovne informacije */}
          <div className="rounded-2xl border border-neutral-200 bg-gf-bg-card p-6 dark:border-neutral-800 dark:bg-neutral-800">
            <h2 className="mb-6 text-xl font-semibold text-gf-text-primary dark:text-neutral-100">
              Osnovne informacije
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
                  Naziv recepta *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
                  Opis *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
                    Vrijeme pripreme (min) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.prepTime}
                    onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
                    Vrijeme kuhanja (min) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.cookTime}
                    onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
                    Broj porcija *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.servings}
                    onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
                    Težina *
                  </label>
                  <CustomSelect
                    id="difficulty"
                    required
                    value={formData.difficulty}
                    onChange={(value) => setFormData({ ...formData, difficulty: value as "lako" | "srednje" | "teško" })}
                    options={[
                      { value: "lako", label: "Lako", icon: <Gauge className="h-4 w-4 text-gf-safe" /> },
                      { value: "srednje", label: "Srednje", icon: <Gauge className="h-4 w-4 text-yellow-500" /> },
                      { value: "teško", label: "Teško", icon: <Gauge className="h-4 w-4 text-gf-risk" /> },
                    ]}
                    placeholder="Odaberi težinu"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
                    Kategorija *
                  </label>
                  <CustomSelect
                    id="category"
                    required
                    value={formData.category}
                    onChange={(value) => setFormData({ ...formData, category: value })}
                    options={[
                      ...RECIPE_CATEGORIES.map((category) => ({
                        value: category,
                        label: category,
                        icon: <ChefHat className="h-4 w-4 text-gf-cta" />,
                      })),
                      // Ako postojeća kategorija nije u listi, dodaj je kao opciju
                      ...(formData.category && !RECIPE_CATEGORIES.includes(formData.category)
                        ? [{ value: formData.category, label: `${formData.category} (postojeća)`, icon: <ChefHat className="h-4 w-4 text-gf-cta" /> }]
                        : []),
                    ]}
                    placeholder="Odaberi kategoriju"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Slika */}
          <div className="rounded-2xl border border-neutral-200 bg-gf-bg-card p-6 dark:border-neutral-800 dark:bg-neutral-800">
            <h2 className="mb-6 text-xl font-semibold text-gf-text-primary dark:text-neutral-100">
              Fotografija
            </h2>
            
            <div className="space-y-4">
              {imagePreview && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData({ ...formData, image: null });
                    }}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-gf-bg-soft p-8 transition-colors hover:border-gf-cta dark:border-neutral-700 dark:bg-neutral-700">
                <Upload className="mb-2 h-8 w-8 text-gf-text-secondary" />
                <span className="text-sm font-medium text-gf-text-primary dark:text-neutral-300">
                  {imagePreview ? "Promijeni fotografiju" : "Dodaj fotografiju"}
                </span>
                <span className="mt-1 text-xs text-gf-text-secondary">
                  JPG, PNG ili WEBP (max 5MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Galerija slika */}
          <div className="rounded-2xl border border-neutral-200 bg-gf-bg-card p-6 dark:border-neutral-800 dark:bg-neutral-800">
            <h2 className="mb-6 text-xl font-semibold text-gf-text-primary dark:text-neutral-100">
              Galerija slika
            </h2>
            <div className="space-y-4">
              <label
                htmlFor="gallery"
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-gf-text-primary transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
              >
                <Plus className="h-4 w-4" />
                Dodaj slike u galeriju
              </label>
              <input
                type="file"
                id="gallery"
                accept="image/*"
                multiple
                onChange={handleGalleryChange}
                className="hidden"
              />
              
              {(existingGalleryUrls.length > 0 || newGalleryPreviews.length > 0) && (
                <div className="grid grid-cols-4 gap-4">
                  {getAllGalleryItems().map((item, index) => (
                    <div
                      key={item.type === 'existing' ? `existing-${item.index}` : `new-${item.fileIndex}`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`relative cursor-move transition-opacity ${
                        draggedIndex === index ? 'opacity-50' : ''
                      } ${
                        dragOverIndex === index ? 'ring-2 ring-gf-cta' : ''
                      }`}
                    >
                      <img
                        src={item.type === 'existing' ? item.url : item.preview}
                        alt={`Gallery ${index + 1}`}
                        className="h-24 w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (item.type === 'existing') {
                            handleRemoveExistingGalleryImage(item.index);
                          } else {
                            handleRemoveNewGalleryImage(item.fileIndex);
                          }
                        }}
                        className="absolute -right-2 -top-2 rounded-full bg-gf-risk p-1 text-white hover:bg-gf-risk/80 z-10"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {(existingGalleryUrls.length > 0 || newGalleryPreviews.length > 0) && (
                <p className="text-xs text-gf-text-secondary dark:text-neutral-400">
                  💡 Povuci i spusti slike za promjenu redoslijeda
                </p>
              )}
            </div>
          </div>

          {/* Sastojci */}
          <div className="rounded-2xl border border-neutral-200 bg-gf-bg-card p-6 dark:border-neutral-800 dark:bg-neutral-800">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gf-text-primary dark:text-neutral-100">
                Sastojci *
              </h2>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="rounded-lg bg-gf-safe px-4 py-2 text-sm font-medium text-white hover:bg-gf-safe/90"
              >
                + Dodaj sastojak
              </button>
            </div>

            <div className="space-y-3">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        required
                        value={ingredient}
                        onChange={(e) => handleIngredientChange(index, e.target.value)}
                        placeholder={`Sastojak ${index + 1} (možeš upisati ručno ili odabrati iz baze)`}
                        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 pr-12 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (showProductSearch === index) {
                            setShowProductSearch(null);
                            setProductSearchQuery("");
                          } else {
                            setShowProductSearch(index);
                            setProductSearchQuery("");
                          }
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gf-text-secondary hover:bg-gf-bg-soft hover:text-gf-cta dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-gf-cta"
                        title="Pretraži proizvode iz baze"
                      >
                        <Package className="h-5 w-5" />
                      </button>
                      {showProductSearch === index && (
                        <div className="product-search-dropdown absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                          <div className="border-b border-neutral-200 p-2 dark:border-neutral-700">
                            <div className="relative flex items-center gap-2">
                              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gf-text-secondary" />
                              <input
                                type="text"
                                value={productSearchQuery}
                                onChange={(e) => setProductSearchQuery(e.target.value)}
                                placeholder="Pretraži proizvode..."
                                className="flex-1 rounded-lg border border-neutral-300 bg-gf-bg-soft px-10 py-2 text-sm text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Escape") {
                                    setShowProductSearch(null);
                                    setProductSearchQuery("");
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setShowProductSearch(null);
                                  setProductSearchQuery("");
                                }}
                                className="rounded-lg bg-red-500 p-2 text-white hover:bg-red-600 transition-colors"
                                title="Zatvori"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          {productSearchQuery && filteredProducts.length > 0 ? (
                            <div className="max-h-60 overflow-y-auto">
                              {filteredProducts.map((product) => (
                                <button
                                  key={product.id}
                                  type="button"
                                  onClick={() => handleAddProductAsIngredient(index, product)}
                                  className="flex w-full items-center gap-3 border-b border-neutral-100 px-4 py-3 text-left transition-colors hover:bg-gf-bg-soft dark:border-neutral-700 dark:hover:bg-neutral-700"
                                >
                                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded">
                                    <ImagePlaceholder
                                      imageUrl={product.image}
                                      alt={product.name}
                                      emoji="🛒"
                                      gradient="from-gf-safe/40 via-gf-cta/30 to-gf-safe/40"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-gf-text-primary dark:text-neutral-100">
                                      {product.name}
                                    </div>
                                    {product.brand && (
                                      <div className="text-xs text-gf-text-secondary dark:text-neutral-400">
                                        {product.brand}
                                      </div>
                                    )}
                                  </div>
                                  <Package className="h-4 w-4 text-gf-cta" />
                                </button>
                              ))}
                            </div>
                          ) : productSearchQuery ? (
                            <div className="p-4 text-center text-sm text-gf-text-secondary dark:text-neutral-400">
                              Nema proizvoda koji odgovaraju pretrazi
                            </div>
                          ) : (
                            <div className="p-4 text-center text-sm text-gf-text-secondary dark:text-neutral-400">
                              Unesi tekst za pretraživanje proizvoda
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {formData.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(index)}
                        className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                        title="Ukloni sastojak"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upute */}
          <div className="rounded-2xl border border-neutral-200 bg-gf-bg-card p-6 dark:border-neutral-800 dark:bg-neutral-800">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gf-text-primary dark:text-neutral-100">
                Upute za pripremu *
              </h2>
              <button
                type="button"
                onClick={handleAddInstruction}
                className="rounded-lg bg-gf-cta px-4 py-2 text-sm font-medium text-white hover:bg-gf-cta-hover"
              >
                + Dodaj korak
              </button>
            </div>

            <div className="space-y-3">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gf-cta text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <textarea
                    required
                    rows={2}
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    placeholder={`Korak ${index + 1}`}
                    className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  />
                  {formData.instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveInstruction(index)}
                      className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-gf-cta px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-gf-cta-hover disabled:opacity-50"
            >
              {isSubmitting ? "Spremanje..." : "Spremi promjene"}
            </button>
            <Link
              href="/admin"
              className="rounded-lg border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-gf-text-primary transition-colors hover:bg-gf-bg-soft dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            >
              Odustani
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

