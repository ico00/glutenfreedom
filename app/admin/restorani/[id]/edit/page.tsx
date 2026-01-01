"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";
import { Restaurant } from "@/types";

export default function EditRestoranPage() {
  const router = useRouter();
  const params = useParams();
  const restaurantId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    addresses: [""],
    phone: "",
    website: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    cuisine: "",
    image: null as File | null,
  });
  const [imageRemoved, setImageRemoved] = useState(false);

  useEffect(() => {
    async function loadRestaurant() {
      try {
        const response = await fetch(`/api/restorani/${restaurantId}`, {
          cache: 'no-store',
        });
        if (response.ok) {
          const restaurant: Restaurant = await response.json();
          // Konvertiraj address u array ako je string (backward compatibility)
          const addresses = Array.isArray(restaurant.address) 
            ? restaurant.address 
            : restaurant.address 
              ? [restaurant.address] 
              : [""];
          
          setFormData({
            name: restaurant.name,
            description: restaurant.description || "",
            addresses: addresses,
            phone: restaurant.phone || "",
            website: restaurant.website || "",
            facebook: restaurant.facebook || "",
            instagram: restaurant.instagram || "",
            tiktok: restaurant.tiktok || "",
            cuisine: Array.isArray(restaurant.cuisine) ? restaurant.cuisine[0] || "" : restaurant.cuisine || "",
            image: null,
          });
          setImagePreview(restaurant.image || null);
        } else {
          console.error("Failed to load restaurant:", response.status, response.statusText);
          router.push("/admin?error=restaurant-not-found");
        }
      } catch (error) {
        console.error("Error loading restaurant:", error);
        router.push("/admin?error=restaurant-load-failed");
      } finally {
        setIsLoading(false);
      }
    }
    loadRestaurant();
  }, [restaurantId, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImageRemoved(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, image: null });
    setImageRemoved(true);
  };

  const handleAddAddress = () => {
    setFormData({
      ...formData,
      addresses: [...formData.addresses, ""],
    });
  };

  const handleRemoveAddress = (index: number) => {
    setFormData({
      ...formData,
      addresses: formData.addresses.filter((_, i) => i !== index),
    });
  };

  const handleAddressChange = (index: number, value: string) => {
    const newAddresses = [...formData.addresses];
    newAddresses[index] = value;
    setFormData({ ...formData, addresses: newAddresses });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      // Pošalji adrese kao array
      formData.addresses.forEach((address, index) => {
        submitData.append(`addresses[${index}]`, address);
      });
      submitData.append("phone", formData.phone);
      submitData.append("website", formData.website);
      submitData.append("facebook", formData.facebook);
      submitData.append("instagram", formData.instagram);
      submitData.append("tiktok", formData.tiktok);
      submitData.append("cuisine", formData.cuisine || "");

      if (formData.image) {
        submitData.append("image", formData.image);
      } else if (imageRemoved) {
        submitData.append("image_removed", "true");
      }

      const response = await fetch(`/api/restorani/${restaurantId}`, {
        method: "PUT",
        body: submitData,
      });

      if (response.ok) {
        router.push("/admin?success=restoran-azuriran");
      } else {
        const error = await response.json();
        alert(`Greška: ${error.message || "Nešto je pošlo po zlu"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Greška pri ažuriranju restorana");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gf-bg py-12 dark:bg-neutral-900 flex items-center justify-center">
        <p className="text-gf-text-primary dark:text-neutral-300">Učitavanje restorana...</p>
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
          Uredi restoran
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

          {/* Adrese */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
                Adrese *
              </label>
              <button
                type="button"
                onClick={handleAddAddress}
                className="inline-flex items-center gap-1 rounded-lg bg-gf-safe px-3 py-1 text-xs font-medium text-white hover:bg-gf-safe/90"
              >
                <Plus className="h-3 w-3" />
                Dodaj adresu
              </button>
            </div>
            <div className="space-y-2">
              {formData.addresses.map((address, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => handleAddressChange(index, e.target.value)}
                    placeholder={`Adresa ${index + 1}`}
                    className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                  {formData.addresses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAddress(index)}
                      className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
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
              placeholder="https://www.example.com"
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>

          {/* Social Media Links */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="facebook" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
                Facebook
              </label>
              <input
                type="url"
                id="facebook"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
            <div>
              <label htmlFor="instagram" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
                Instagram
              </label>
              <input
                type="url"
                id="instagram"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="https://instagram.com/..."
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
            <div>
              <label htmlFor="tiktok" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
                TikTok
              </label>
              <input
                type="url"
                id="tiktok"
                value={formData.tiktok}
                onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                placeholder="https://tiktok.com/@..."
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Kuhinja */}
          <div>
            <label htmlFor="cuisine" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Kuhinja
            </label>
            <select
              id="cuisine"
              value={formData.cuisine}
              onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="">Odaberi kuhinju</option>
              <option value="mediteranska">Mediteranska</option>
              <option value="vegetarijanska">Vegetarijanska</option>
              <option value="organička">Organička</option>
              <option value="zdrava">Zdrava</option>
              <option value="tradicionalna">Tradicionalna</option>
              <option value="obiteljska">Obiteljska</option>
              <option value="talijanska">Talijanska</option>
              <option value="azijska">Azijska</option>
              <option value="meksička">Meksička</option>
              <option value="američka">Američka</option>
              <option value="francuska">Francuska</option>
              <option value="hrvatska">Hrvatska</option>
              <option value="balkanska">Balkanska</option>
              <option value="vegan">Vegan</option>
              <option value="riblja">Riblja</option>
              <option value="mesna">Mesna</option>
            </select>
          </div>

          {/* Slika */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Slika
            </label>
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
                    onClick={handleRemoveImage}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <label
                htmlFor="image"
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-gf-text-primary transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
              >
                <Upload className="h-4 w-4" />
                {imagePreview ? "Promijeni sliku" : "Odaberi sliku"}
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Submit button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-gf-cta px-6 py-3 font-semibold text-white transition-all hover:bg-gf-cta-hover disabled:opacity-50"
            >
              {isSubmitting ? "Spremanje..." : "Spremi promjene"}
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

