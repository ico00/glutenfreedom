"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { ImagePlaceholder } from "./ImagePlaceholder";

interface GallerySectionProps {
  images: string[];
}

export function GallerySection({ images }: GallerySectionProps) {
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);

  const currentImage = lightboxImageIndex !== null ? images[lightboxImageIndex] : null;

  const goToPrevious = useCallback(() => {
    if (lightboxImageIndex !== null && lightboxImageIndex > 0) {
      setLightboxImageIndex(lightboxImageIndex - 1);
    }
  }, [lightboxImageIndex]);

  const goToNext = useCallback(() => {
    if (lightboxImageIndex !== null && lightboxImageIndex < images.length - 1) {
      setLightboxImageIndex(lightboxImageIndex + 1);
    }
  }, [lightboxImageIndex, images.length]);

  const closeLightbox = useCallback(() => {
    setLightboxImageIndex(null);
  }, []);

  // Navigacija tipkovnicom
  useEffect(() => {
    if (lightboxImageIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeLightbox();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxImageIndex, goToPrevious, goToNext, closeLightbox]);

  // Scroll navigacija (wheel event)
  useEffect(() => {
    if (lightboxImageIndex === null) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        // Scroll down = next
        goToNext();
      } else {
        // Scroll up = previous
        goToPrevious();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [lightboxImageIndex, goToPrevious, goToNext]);

  return (
    <>
      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold text-gf-text-primary dark:text-neutral-100">
          Galerija
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className="group relative w-full cursor-pointer overflow-hidden rounded-lg transition-transform hover:scale-[1.02]"
              onClick={() => setLightboxImageIndex(index)}
            >
              <div className="relative aspect-video w-full">
                <ImagePlaceholder
                  imageUrl={imageUrl}
                  alt={`Galerija slika ${index + 1}`}
                  emoji="📷"
                  gradient="from-gf-cta/40 via-gf-safe/30 to-gf-cta/40"
                />
              </div>
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {currentImage && lightboxImageIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Zatvori"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Strelica lijevo */}
          {lightboxImageIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
              aria-label="Prethodna slika"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}

          {/* Strelica desno */}
          {lightboxImageIndex < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
              aria-label="Sljedeća slika"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}

          <div className="relative max-h-[90vh] max-w-[90vw]">
            <Image
              src={currentImage}
              alt={`Galerija slika ${lightboxImageIndex + 1}`}
              width={1920}
              height={1080}
              className="max-h-[90vh] w-auto max-w-[90vw] object-contain"
              unoptimized
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Indikator trenutne slike */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white">
              {lightboxImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}

