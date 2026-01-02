"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";
import { BlogPost } from "@/types";
import { RichTextEditor } from "@/components/RichTextEditor";
import { DatePicker } from "@/components/DatePicker";
import { getCsrfToken } from "@/lib/csrfClient";

// Predefinirane kategorije za blog postove
const BLOG_CATEGORIES = [
  "Iskustva",
  "Savjeti",
  "Vijesti",
  "Recepti",
  "Zdravlje",
  "Dijagnoza",
  "Proizvodi",
  "Restorani",
  "Ostalo"
];

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]); // Postojeće slike (URL-ovi)
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]); // Nove slike (File objekti)
  const [newGalleryPreviews, setNewGalleryPreviews] = useState<string[]>([]); // Preview za nove slike
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    image: null as File | null,
    tags: [] as string[], // Array tagova
    category: [] as string[], // Array kategorija
    createdAt: "",
  });
  const [newTag, setNewTag] = useState("");
  const [existingTags, setExistingTags] = useState<string[]>([]); // Postojeći tagovi iz svih postova
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  useEffect(() => {
    async function loadPost() {
      try {
        const response = await fetch(`/api/blog/${postId}`, {
          cache: 'no-store',
        });
        if (response.ok) {
          const post: BlogPost = await response.json();
          // Konvertiraj category u array ako je string (backward compatibility)
              const categoryArray = Array.isArray(post.category) 
                ? post.category 
                : post.category ? [post.category] : [];

              // Osiguraj da tags uvijek bude array
              // Ako je string, parsiraj ga (može biti "tag1, tag2" ili samo "tag1")
              let tagsArray: string[] = [];
              if (Array.isArray(post.tags)) {
                tagsArray = post.tags;
              } else if (typeof post.tags === 'string') {
                // Ako je string, parsiraj ga po zarezu
                tagsArray = post.tags
                  .split(',')
                  .map(tag => tag.trim())
                  .filter(tag => tag.length > 0);
              }

              setFormData({
                title: post.title,
                excerpt: post.excerpt,
                content: post.content,
                image: null,
                tags: tagsArray, // Osiguraj da je uvijek array
                category: categoryArray,
                createdAt: post.createdAt,
              });
          setImagePreview(post.image || null);
          setExistingGalleryUrls(post.gallery || []);
          setNewGalleryFiles([]);
          setNewGalleryPreviews([]);
        }
      } catch (error) {
        console.error("Error loading post:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (postId) {
      loadPost();
    }
  }, [postId]);

  // Učitaj sve postojeće tagove iz blog postova
  useEffect(() => {
    async function loadExistingTags() {
      try {
        const response = await fetch("/api/blog", {
          cache: 'no-store',
        });
        if (response.ok) {
          const posts: BlogPost[] = await response.json();
          // Ekstraktuj sve tagove iz svih postova (zadrži originalni case)
          const allTags = posts.flatMap((post) => {
            if (Array.isArray(post.tags)) {
              return post.tags;
            }
            return post.tags ? [post.tags] : [];
          });
          // Ukloni duplikate (case-insensitive) ali zadrži originalni case prvog pojavljivanja
          const tagMap = new Map<string, string>();
          allTags.forEach((tag) => {
            const lowerTag = tag.toLowerCase();
            if (!tagMap.has(lowerTag)) {
              tagMap.set(lowerTag, tag);
            }
          });
          const uniqueTags = Array.from(tagMap.values()).sort();
          setExistingTags(uniqueTags);
        }
      } catch (error) {
        console.error("Error loading existing tags:", error);
      }
    }
    loadExistingTags();
  }, []);

  // Zatvori dropdown kada se klikne izvan
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showTagSuggestions && !target.closest('.tag-autocomplete-container')) {
        setShowTagSuggestions(false);
      }
    };

    if (showTagSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showTagSuggestions]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validacija: barem jedna kategorija mora biti odabrana
    if (formData.category.length === 0) {
      alert("Odaberi barem jednu kategoriju");
      return;
    }
    
    // Validacija: barem jedan tag mora biti dodan
    if (formData.tags.length === 0) {
      alert("Dodaj barem jedan tag");
      return;
    }
    
    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("excerpt", formData.excerpt);
      submitData.append("content", formData.content);
      submitData.append("author", "Ivica Drusany");
      submitData.append("tags", JSON.stringify(formData.tags)); // Pošalji kao JSON array
      submitData.append("category", JSON.stringify(formData.category)); // Pošalji kao JSON array
      submitData.append("createdAt", formData.createdAt);

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      // Pošalji postojeće URL-ove koje treba zadržati (uvijek, čak i ako je prazan array)
      submitData.append("existingGallery", JSON.stringify(existingGalleryUrls));

      // Pošalji nove slike
      newGalleryFiles.forEach((file, index) => {
        submitData.append(`gallery_${index}`, file);
      });
      // Uvijek pošalji galleryCount, čak i ako je 0
      submitData.append("galleryCount", newGalleryFiles.length.toString());

      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/blog/${postId}`, {
        method: "PUT",
        body: submitData,
        headers: {
          "x-csrf-token": csrfToken || "",
        },
      });

      if (response.ok) {
        const result = await response.json();
        
        // Ako je ID promijenjen, redirectaj na novi edit URL
        if (result.idChanged && result.newId) {
          router.push(`/admin/blog/${result.newId}/edit`);
          router.refresh();
        } else {
          router.push("/admin");
          router.refresh();
        }
      } else {
        const error = await response.json();
        alert(`Greška: ${error.message || "Nešto je pošlo po zlu"}`);
      }
    } catch (error) {
      console.error("Error updating blog post:", error);
      alert("Greška pri slanju podataka");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gf-bg py-12 dark:bg-neutral-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-gf-text-primary dark:text-neutral-100">Učitavanje...</p>
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
          Uredi blog post
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
              Glavna slika {imagePreview && "(postojeća)"}
            </label>
            <div className="flex items-center gap-4">
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
              Galerija slika
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
              
              {(existingGalleryUrls.length > 0 || newGalleryPreviews.length > 0) && (
                <div className="grid grid-cols-4 gap-4">
                  {/* Postojeće slike (URL-ovi) */}
                  {existingGalleryUrls.map((url, index) => (
                    <div key={`existing-${index}`} className="relative">
                      <img
                        src={url}
                        alt={`Gallery ${index + 1}`}
                        className="h-24 w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingGalleryImage(index)}
                        className="absolute -right-2 -top-2 rounded-full bg-gf-risk p-1 text-white hover:bg-gf-risk/80"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {/* Nove slike (preview-ovi) */}
                  {newGalleryPreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative">
                      <img
                        src={preview}
                        alt={`New gallery ${index + 1}`}
                        className="h-24 w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewGalleryImage(index)}
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

          {/* Tagovi */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gf-text-primary dark:text-neutral-300">
              Tagovi *
            </label>
            <div className="space-y-3">
              {/* Input za dodavanje novog taga */}
              <div className="relative flex gap-2">
                <div className="relative flex-1 tag-autocomplete-container">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => {
                      setNewTag(e.target.value);
                      setShowTagSuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() => {
                      if (newTag.length > 0) {
                        setShowTagSuggestions(true);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newTag.trim()) {
                        e.preventDefault();
                        if (!formData.tags.includes(newTag.trim())) {
                          setFormData({
                            ...formData,
                            tags: [...formData.tags, newTag.trim()],
                          });
                        }
                        setNewTag("");
                        setShowTagSuggestions(false);
                      } else if (e.key === "Escape") {
                        setShowTagSuggestions(false);
                      }
                    }}
                    placeholder="Unesi tag i pritisni Enter"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                  
                  {/* Autocomplete dropdown */}
                  {showTagSuggestions && newTag.length > 0 && (
                    <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                      {existingTags
                        .filter((tag) => 
                          tag.toLowerCase().includes(newTag.toLowerCase()) &&
                          !formData.tags.map(t => t.toLowerCase()).includes(tag)
                        )
                        .slice(0, 10)
                        .map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              if (!formData.tags.includes(tag)) {
                                setFormData({
                                  ...formData,
                                  tags: [...formData.tags, tag],
                                });
                              }
                              setNewTag("");
                              setShowTagSuggestions(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gf-text-primary hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                          >
                            {tag}
                          </button>
                        ))}
                      {existingTags.filter((tag) => 
                        tag.toLowerCase().includes(newTag.toLowerCase()) &&
                        !formData.tags.map(t => t.toLowerCase()).includes(tag)
                      ).length === 0 && (
                        <div className="px-4 py-2 text-sm text-gf-text-secondary dark:text-neutral-400">
                          Nema predloženih tagova
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
                      setFormData({
                        ...formData,
                        tags: [...formData.tags, newTag.trim()],
                      });
                      setNewTag("");
                    }
                  }}
                  className="rounded-lg bg-gf-cta px-4 py-2 text-sm font-medium text-white hover:bg-gf-cta-hover"
                >
                  Dodaj
                </button>
              </div>
              
              {/* Prikaz tagova kao pills */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="group flex items-center gap-1 rounded-full bg-gf-safe/20 px-3 py-1 text-sm font-medium text-gf-safe dark:bg-gf-safe/30 dark:text-gf-safe"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            tags: formData.tags.filter((_, i) => i !== index),
                          });
                        }}
                        className="ml-1 rounded-full hover:bg-gf-safe/30 dark:hover:bg-gf-safe/40"
                        aria-label={`Ukloni ${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {formData.tags.length === 0 && (
              <p className="mt-2 text-xs text-gf-risk">Dodaj barem jedan tag</p>
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

