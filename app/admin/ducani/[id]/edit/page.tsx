"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Store } from "@/types";
import { getCsrfToken } from "@/lib/csrfClient";

export default function EditDucanPage() {
  const router = useRouter();
  const params = useParams();
  const storeId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    website: "",
    type: "dućan" as "dućan" | "online" | "oboje",
    image: null as File | null,
  });
  const [imageRemoved, setImageRemoved] = useState(false);

  useEffect(() => {
    async function loadStore() {
      try {
        const response = await fetch(`/api/ducani/${storeId}`, {
          cache: 'no-store',
        });
        if (response.ok) {
          const store: Store = await response.json();
          setFormData({
            name: store.name,
            description: store.description || "",
            address: store.address,
            phone: store.phone || "",
            website: store.website || "",
            type: store.type || "dućan",
            image: null,
          });
          setImagePreview(store.image || null);
        } else {
          console.error("Failed to load store:", response.status, response.statusText);
          router.push("/admin?error=store-not-found");
        }
      } catch (error) {
        console.error("Error loading store:", error);
        router.push("/admin?error=store-load-failed");
      } finally {
        setIsLoading(false);
      }
    }
    loadStore();
  }, [storeId, router]);

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
      submitData.append("type", formData.type);

      if (formData.image) {
        submitData.append("image", formData.image);
      } else if (imageRemoved) {
        submitData.append("image_removed", "true");
      }

      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/ducani/${storeId}`, {
        method: "PUT",
        body: submitData,
        headers: {
          "x-csrf-token": csrfToken || "",
        },
      });

      if (response.ok) {
        router.push("/admin?success=ducan-azuriran");
      } else {
        const error = await response.json();
        alert(`Greška: ${error.message || "Nešto je pošlo po zlu"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Greška pri ažuriranju dućana");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gf-bg py-12 dark:bg-neutral-900 flex items-center justify-center">
        <p className="text-gf-text-primary dark:text-neutral-300">Učitavanje dućana...</p>
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

        <h1 className="mb-8 text-3xl font-bold text-gf-text-primary dark:text-neutral-100">
          Uredi dućan
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Naziv */}
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Naziv *
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

          {/* Tip */}
          <div>
            <label htmlFor="type" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Tip *
            </label>
            <select
              id="type"
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as "dućan" | "online" | "oboje" })}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="dućan">Dućan</option>
              <option value="online">Online</option>
              <option value="oboje">Oboje</option>
            </select>
          </div>

          {/* Slika */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Slika
            </label>
            {imagePreview ? (
              <div className="relative mb-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-48 w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : null}
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-gf-text-primary transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700">
                <Upload className="h-4 w-4" />
                {imagePreview ? "Promijeni sliku" : "Dodaj sliku"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Submit */}
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

