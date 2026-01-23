"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Tag, Store, ShoppingBag, Scale } from "lucide-react";
import { getCsrfToken } from "@/lib/csrfClient";
import { CustomSelect } from "@/components/CustomSelect";
import { BRANDS, STORES, PRODUCT_CATEGORIES } from "@/lib/constants";

export default function NoviProizvodPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brand: "",
    category: "",
    store: "",
    tags: "",
    certified: false,
    price: "",
    weight: "",
    weightUnit: "g" as "g" | "ml",
    image: null as File | null,
  });

  const brands = [...BRANDS];
  const stores = [...STORES];
  const categories = [...PRODUCT_CATEGORIES];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("brand", formData.brand);
      submitData.append("category", formData.category);
      submitData.append("store", formData.store);
      submitData.append("tags", JSON.stringify(formData.tags.split(",").map((t) => t.trim())));
      submitData.append("certified", formData.certified.toString());
      submitData.append("price", formData.price || "");
      submitData.append("weight", formData.weight || "");
      submitData.append("weightUnit", formData.weightUnit);

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      const csrfToken = await getCsrfToken();
      const response = await fetch("/api/proizvodi", {
        method: "POST",
        body: submitData,
        headers: {
          "x-csrf-token": csrfToken || "",
        },
      });

      if (response.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const error = await response.json();
        alert(`Greška: ${error.message || "Nešto je pošlo po zlu"}`);
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      alert("Greška pri slanju podataka");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Dodaj novi proizvod
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Naziv */}
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Naziv proizvoda *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>

          {/* Opis */}
          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Opis
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>

          {/* Brand */}
          <div>
            <label htmlFor="brand" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Marka *
            </label>
            <CustomSelect
              id="brand"
              required
              value={formData.brand}
              onChange={(value) => setFormData({ ...formData, brand: value })}
              options={brands.map((brand) => ({
                value: brand,
                label: brand,
                icon: <Tag className="h-4 w-4 text-gf-cta" />,
              }))}
              placeholder="Odaberi marku"
            />
          </div>

          {/* Kategorija */}
          <div>
            <label htmlFor="category" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Kategorija *
            </label>
            <CustomSelect
              id="category"
              required
              value={formData.category}
              onChange={(value) => setFormData({ ...formData, category: value })}
              options={categories.map((category) => ({
                value: category,
                label: category.charAt(0).toUpperCase() + category.slice(1),
                icon: <ShoppingBag className="h-4 w-4 text-gf-safe" />,
              }))}
              placeholder="Odaberi kategoriju"
            />
          </div>

          {/* Dućan */}
          <div>
            <label htmlFor="store" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Dućan
            </label>
            <CustomSelect
              id="store"
              value={formData.store}
              onChange={(value) => setFormData({ ...formData, store: value })}
              options={stores.map((store) => ({
                value: store,
                label: store,
                icon: <Store className="h-4 w-4 text-yellow-500" />,
              }))}
              placeholder="Odaberi dućan"
            />
          </div>

          {/* Cijena i težina */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
                Cijena (€)
              </label>
              <input
                type="number"
                id="price"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                placeholder="0.00"
              />
            </div>
            <div>
              <label htmlFor="weight" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
                Težina / Volumen
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  id="weight"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  placeholder="0"
                />
                <div className="w-24">
                  <CustomSelect
                    id="weightUnit"
                    value={formData.weightUnit}
                    onChange={(value) => setFormData({ ...formData, weightUnit: value as "g" | "ml" })}
                    options={[
                      { value: "g", label: "g", icon: <Scale className="h-4 w-4 text-gf-text-secondary" /> },
                      { value: "ml", label: "ml", icon: <Scale className="h-4 w-4 text-gf-text-secondary" /> },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tagovi */}
          <div>
            <label htmlFor="tags" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Tagovi (odvojeni zarezom) *
            </label>
            <input
              type="text"
              id="tags"
              required
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              placeholder="npr. pekara, osnovno"
            />
          </div>

          {/* Certificirano */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="certified"
              checked={formData.certified}
              onChange={(e) => setFormData({ ...formData, certified: e.target.checked })}
              className="h-4 w-4 rounded border-neutral-300 text-gf-cta focus:ring-gf-cta dark:border-neutral-600"
            />
            <label htmlFor="certified" className="text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Certificirani bezglutenski proizvod
            </label>
          </div>

          {/* Slika */}
          <div>
            <label htmlFor="image" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Slika
            </label>
            <div className="flex items-center gap-4">
              <label
                htmlFor="image"
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-gf-text-primary transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
              >
                <Upload className="h-4 w-4" />
                Odaberi sliku
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {imagePreview && (
                <div className="relative h-20 w-20">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full rounded-lg object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-gf-cta px-6 py-3 font-semibold text-white transition-all hover:bg-gf-cta-hover disabled:opacity-50"
            >
              {isSubmitting ? "Spremanje..." : "Spremi proizvod"}
            </button>
            <Link
              href="/admin"
              className="rounded-lg border border-neutral-300 bg-white px-6 py-3 font-semibold text-gf-text-primary transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
            >
              Odustani
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

