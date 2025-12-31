"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";

export default function NoviBlogPostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    image: null as File | null,
    gallery: [] as File[],
    author: "",
    tags: "",
    category: "",
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

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newGallery = [...formData.gallery, ...files];
      setFormData({ ...formData, gallery: newGallery });
      
      // Kreiraj preview za nove slike
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setGalleryPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    const newGallery = formData.gallery.filter((_, i) => i !== index);
    const newPreviews = galleryPreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, gallery: newGallery });
    setGalleryPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("excerpt", formData.excerpt);
      submitData.append("content", formData.content);
      submitData.append("author", formData.author);
      submitData.append("tags", JSON.stringify(formData.tags.split(",").map((t) => t.trim())));
      submitData.append("category", formData.category);

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      // Dodaj galeriju slika
      formData.gallery.forEach((file, index) => {
        submitData.append(`gallery_${index}`, file);
      });
      submitData.append("galleryCount", formData.gallery.length.toString());

      const response = await fetch("/api/blog", {
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
      console.error("Error submitting blog post:", error);
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
          Dodaj novi blog post
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Naslov */}
          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Naslov *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              placeholder="Unesi naslov blog posta"
            />
          </div>

          {/* Kratki opis */}
          <div>
            <label htmlFor="excerpt" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Kratki opis (excerpt) *
            </label>
            <textarea
              id="excerpt"
              required
              rows={3}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              placeholder="Kratki opis koji će se prikazati na listi blog postova"
            />
          </div>

          {/* Sadržaj */}
          <div>
            <label htmlFor="content" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Sadržaj *
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
              placeholder="Glavni sadržaj blog posta. Koristi toolbar za formatiranje teksta."
            />
            <p className="mt-1 text-xs text-gf-text-secondary dark:text-neutral-400">
              Koristi toolbar za formatiranje teksta: naslovi, bold, italic, underline, boja, centriranje, veličina fonta
            </p>
          </div>

          {/* Glavna slika */}
          <div>
            <label htmlFor="image" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Glavna slika *
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
                required
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

          {/* Galerija slika */}
          <div>
            <label htmlFor="gallery" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Galerija slika (opcionalno)
            </label>
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
              
              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {galleryPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Gallery ${index + 1}`}
                        className="h-24 w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(index)}
                        className="absolute -right-2 -top-2 rounded-full bg-gf-risk p-1 text-white hover:bg-gf-risk/80"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Autor */}
          <div>
            <label htmlFor="author" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Autor *
            </label>
            <input
              type="text"
              id="author"
              required
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              placeholder="Ime autora"
            />
          </div>

          {/* Kategorija */}
          <div>
            <label htmlFor="category" className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Kategorija *
            </label>
            <input
              type="text"
              id="category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              placeholder="npr. iskustva, savjeti, vijesti"
            />
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
              placeholder="npr. iskustvo, početak, savjeti"
            />
            <p className="mt-1 text-xs text-gf-text-secondary dark:text-neutral-400">
              Odvoji tagove zarezom (npr. iskustvo, početak, savjeti)
            </p>
          </div>

          {/* Submit button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-gf-cta px-6 py-3 font-semibold text-white transition-all hover:bg-gf-cta-hover disabled:opacity-50"
            >
              {isSubmitting ? "Spremanje..." : "Spremi blog post"}
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

