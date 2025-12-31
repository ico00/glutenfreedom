"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";

export default function NoviRestoranPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    website: "",
    cuisine: "",
    priceRange: "€" as "€" | "€€" | "€€€",
    rating: "",
    glutenFreeOptions: "djelomično" as "djelomično" | "potpuno",
    lat: "",
    lng: "",
    image: null as File | null,
  });

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
      submitData.append("address", formData.address);
      submitData.append("phone", formData.phone);
      submitData.append("website", formData.website);
      submitData.append("cuisine", JSON.stringify(formData.cuisine.split(",").map((c) => c.trim())));
      submitData.append("priceRange", formData.priceRange);
      submitData.append("rating", formData.rating || "");
      submitData.append("glutenFreeOptions", formData.glutenFreeOptions);
      submitData.append("lat", formData.lat);
      submitData.append("lng", formData.lng);

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      const response = await fetch("/api/restorani", {
        method: "POST",
        body: submitData,
      });

      if (response.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const error = await response.json();
        alert(`Greška: ${error.message || "Nešto je pošlo po zlu"}`);
      }
    } catch (error) {
      console.error("Error submitting restaurant:", error);
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
          Dodaj novi restoran
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Naziv */}
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Naziv restorana *
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
              Opis *
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>

          {/* Adresa */}
          <div>
            <label htmlFor="address" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Adresa *
            </label>
            <input
              type="text"
              id="address"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>

          {/* Telefon */}
          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Telefon
            </label>
            <input
              type="text"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Website
            </label>
            <input
              type="url"
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>

          {/* Kuhinja */}
          <div>
            <label htmlFor="cuisine" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Kuhinja (odvojeno zarezom) *
            </label>
            <input
              type="text"
              id="cuisine"
              required
              value={formData.cuisine}
              onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              placeholder="npr. mediteranska, vegetarijanska"
            />
          </div>

          {/* Cjenovni rang */}
          <div>
            <label htmlFor="priceRange" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Cjenovni rang *
            </label>
            <select
              id="priceRange"
              required
              value={formData.priceRange}
              onChange={(e) => setFormData({ ...formData, priceRange: e.target.value as "€" | "€€" | "€€€" })}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="€">€ - Jeftino</option>
              <option value="€€">€€ - Srednje</option>
              <option value="€€€">€€€ - Skupo</option>
            </select>
          </div>

          {/* Ocjena */}
          <div>
            <label htmlFor="rating" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Ocjena (0-5)
            </label>
            <input
              type="number"
              id="rating"
              min="0"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>

          {/* Bezglutenske opcije */}
          <div>
            <label htmlFor="glutenFreeOptions" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Bezglutenske opcije *
            </label>
            <select
              id="glutenFreeOptions"
              required
              value={formData.glutenFreeOptions}
              onChange={(e) => setFormData({ ...formData, glutenFreeOptions: e.target.value as "djelomično" | "potpuno" })}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="djelomično">Djelomično</option>
              <option value="potpuno">Potpuno</option>
            </select>
          </div>

          {/* Koordinate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="lat" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
                Širina (lat) *
              </label>
              <input
                type="number"
                id="lat"
                required
                step="any"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                placeholder="45.8150"
              />
            </div>
            <div>
              <label htmlFor="lng" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
                Dužina (lng) *
              </label>
              <input
                type="number"
                id="lng"
                required
                step="any"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                placeholder="15.9819"
              />
            </div>
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
              {isSubmitting ? "Spremanje..." : "Spremi restoran"}
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

