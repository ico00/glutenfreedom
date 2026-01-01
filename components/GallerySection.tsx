"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { ImagePlaceholder } from "./ImagePlaceholder";

interface GallerySectionProps {
  images: string[];
}

export function GallerySection({ images }: GallerySectionProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

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
              onClick={() => setLightboxImage(imageUrl)}
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
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Zatvori"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <Image
              src={lightboxImage}
              alt="Lightbox"
              width={1920}
              height={1080}
              className="max-h-[90vh] w-auto max-w-[90vw] object-contain"
              unoptimized
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}

