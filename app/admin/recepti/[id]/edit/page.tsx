"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Recipe } from "@/types";

export default function EditReceptPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
    tags: "",
    category: "",
  });

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
            tags: recipe.tags.join(", "),
            category: recipe.category,
          });
          setImagePreview(recipe.image || null);
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
      formDataToSend.append("tags", formData.tags);
      
      formData.ingredients.forEach((ingredient, index) => {
        formDataToSend.append(`ingredients[${index}]`, ingredient);
      });
      
      formData.instructions.forEach((instruction, index) => {
        formDataToSend.append(`instructions[${index}]`, instruction);
      });

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await fetch(`/api/recepti/${recipeId}`, {
        method: "PUT",
        body: formDataToSend,
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
                  <select
                    required
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  >
                    <option value="lako">Lako</option>
                    <option value="srednje">Srednje</option>
                    <option value="teško">Teško</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
                    Kategorija *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="npr. pekara, deserti, glavna jela"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
                  Tagovi (odvojeni zarezom) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="npr. kruh, doručak, osnovno"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
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
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    placeholder={`Sastojak ${index + 1}`}
                    className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  />
                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(index)}
                      className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
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

