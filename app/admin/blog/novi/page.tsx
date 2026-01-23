"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { DatePicker } from "@/components/DatePicker";
import { getCsrfToken } from "@/lib/csrfClient";
import { BLOG_CATEGORIES } from "@/lib/constants";

export default function NoviBlogPostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    image: null as File | null,
    gallery: [] as File[],
    category: [] as string[], // Array kategorija
    createdAt: new Date().toISOString().split("T")[0], // Default: današnji datum
  });
  
  // Provjeri ima li nesačuvanih promjena
  const checkForChanges = useCallback(() => {
    return formData.title.trim() !== "" || 
           formData.excerpt.trim() !== "" || 
           formData.content.trim() !== "" || 
           formData.image !== null || 
           formData.gallery.length > 0 ||
           formData.category.length > 0;
  }, [formData]);
  
  // Ažuriraj hasUnsavedChanges kad se podaci promijene
  useEffect(() => {
    setHasUnsavedChanges(checkForChanges());
  }, [formData, checkForChanges]);
  
  // Upozorenje prije zatvaranja/refresha stranice
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);
  
  // Presretanje klikova na sve linkove
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && hasUnsavedChanges) {
        const href = link.getAttribute('href');
        // Provjeri je li to interni link (ne eksterni)
        if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          e.preventDefault();
          e.stopPropagation();
          setPendingNavigation(href);
          setShowUnsavedModal(true);
        }
      }
    };
    
    // Dodaj event listener na document
    document.addEventListener('click', handleLinkClick, true);
    return () => document.removeEventListener('click', handleLinkClick, true);
  }, [hasUnsavedChanges]);
  
  // Funkcija za sigurnu navigaciju
  const handleSafeNavigation = (href: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(href);
      setShowUnsavedModal(true);
    } else {
      router.push(href);
    }
  };
  
  // Potvrdi napuštanje stranice
  const confirmNavigation = () => {
    setShowUnsavedModal(false);
    setHasUnsavedChanges(false); // Resetiraj da se ne aktivira ponovno
    if (pendingNavigation) {
      router.push(pendingNavigation);
    }
  };

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
    
    // Validacija: glavna slika mora biti uploadana
    if (!formData.image) {
      alert("Morate uploadati glavnu sliku");
      return;
    }
    
    // Validacija: barem jedna kategorija mora biti odabrana
    if (formData.category.length === 0) {
      alert("Odaberi barem jednu kategoriju");
      return;
    }
    
    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("excerpt", formData.excerpt);
      submitData.append("content", formData.content);
      submitData.append("author", "Ivica Drusany");
      submitData.append("tags", JSON.stringify([])); // Prazan array za backward compatibility
      submitData.append("category", JSON.stringify(formData.category)); // Pošalji kao JSON array
      submitData.append("createdAt", formData.createdAt);

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      // Dodaj galeriju slika
      formData.gallery.forEach((file, index) => {
        submitData.append(`gallery_${index}`, file);
      });
      submitData.append("galleryCount", formData.gallery.length.toString());

      const csrfToken = await getCsrfToken();
      const response = await fetch("/api/blog", {
        method: "POST",
        body: submitData,
        headers: {
          "x-csrf-token": csrfToken || "",
        },
      });

      if (response.ok) {
        // Resetiraj stanje nesačuvanih promjena prije navigacije
        setHasUnsavedChanges(false);
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
        {/* Unsaved Changes Modal */}
        {showUnsavedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowUnsavedModal(false)}
            />
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-700 dark:bg-neutral-800">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gf-text-primary dark:text-neutral-100">
                Nesačuvane promjene
              </h3>
              <p className="mb-6 text-gf-text-secondary dark:text-neutral-400">
                Imate nesačuvane promjene. Jeste li sigurni da želite napustiti stranicu? Sve promjene će biti izgubljene.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowUnsavedModal(false)}
                  className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-3 font-medium text-gf-text-primary transition-all hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
                >
                  Ostani na stranici
                </button>
                <button
                  type="button"
                  onClick={confirmNavigation}
                  className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 font-medium text-white shadow-lg transition-all hover:shadow-xl"
                >
                  Napusti stranicu
                </button>
              </div>
            </div>
          </div>
        )}
        
        <button
          type="button"
          onClick={() => handleSafeNavigation("/admin")}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gf-cta hover:text-gf-cta-hover dark:text-gf-cta dark:hover:text-gf-cta-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          Natrag na admin panel
        </button>

        <h1 className="mb-8 text-4xl font-bold text-gf-text-primary dark:text-neutral-100">
          Dodaj novi blog post
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Naslov - istaknuti */}
          <div className="rounded-xl border border-neutral-200 bg-gradient-to-r from-gf-cta/5 to-gf-safe/5 p-6 dark:border-neutral-700 dark:from-gf-cta/10 dark:to-gf-safe/10">
            <label htmlFor="title" className="mb-3 block text-sm font-semibold uppercase tracking-wide text-gf-cta dark:text-gf-cta">
              Naslov posta *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border-2 border-neutral-200 bg-white px-5 py-4 text-2xl font-bold text-gf-text-primary placeholder:text-neutral-400 focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              placeholder="Unesite privlačan naslov..."
            />
          </div>

          {/* Kratki opis - istaknuti */}
          <div className="rounded-xl border border-neutral-200 bg-gradient-to-r from-gf-safe/5 to-gf-cta/5 p-6 dark:border-neutral-700 dark:from-gf-safe/10 dark:to-gf-cta/10">
            <label htmlFor="excerpt" className="mb-3 block text-sm font-semibold uppercase tracking-wide text-gf-safe dark:text-gf-safe">
              Kratki opis (excerpt) *
            </label>
            <textarea
              id="excerpt"
              required
              rows={3}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full rounded-lg border-2 border-neutral-200 bg-white px-5 py-4 text-lg text-gf-text-primary placeholder:text-neutral-400 focus:border-gf-safe focus:outline-none focus:ring-2 focus:ring-gf-safe/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              placeholder="Kratak, privlačan opis koji će privući čitatelje..."
            />
            <p className="mt-2 text-xs text-gf-text-secondary dark:text-neutral-400">
              Ovaj tekst se prikazuje na listi blogova i u Google rezultatima
            </p>
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
                name="image"
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
            {!formData.image && (
              <p className="mt-2 text-xs text-gf-risk">Morate uploadati glavnu sliku</p>
            )}
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

          {/* Kategorija */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Kategorije * (možeš odabrati više)
            </label>
            <div className="flex flex-wrap gap-2">
              {BLOG_CATEGORIES.map((category) => {
                const isSelected = formData.category.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setFormData({
                          ...formData,
                          category: formData.category.filter((c) => c !== category),
                        });
                      } else {
                        setFormData({
                          ...formData,
                          category: [...formData.category, category],
                        });
                      }
                    }}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-gf-cta text-white hover:bg-gf-cta-hover"
                        : "bg-gf-bg-soft text-gf-text-primary hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
            {formData.category.length === 0 && (
              <p className="mt-2 text-xs text-gf-risk">Odaberi barem jednu kategoriju</p>
            )}
          </div>

              {/* Datum */}
              <div>
                <DatePicker
                  id="createdAt"
                  value={formData.createdAt}
                  onChange={(value) => setFormData({ ...formData, createdAt: value })}
                  required
                  className="w-full"
                />
                <p className="mt-1 text-xs text-gf-text-secondary dark:text-neutral-400">
                  Odaberi datum kada je post objavljen
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

