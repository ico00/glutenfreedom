"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface HtmlRendererProps {
  content: string;
}

export function HtmlRenderer({ content }: HtmlRendererProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dodaj click handler za slike nakon renderiranja
    if (contentRef.current) {
      const images = contentRef.current.querySelectorAll("img");
      images.forEach((img) => {
        img.style.cursor = "pointer";
        img.onclick = () => {
          setLightboxImage(img.src);
        };
      });
    }
  }, [content]);

  return (
    <>
      <div 
        ref={contentRef}
        className="prose prose-lg max-w-none dark:prose-invert [&_strong]:font-bold [&_em]:italic [&_a]:text-gf-cta [&_a:hover]:underline [&_img]:rounded-lg [&_img]:my-6 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-10 [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-9 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-6 [&_h4]:mb-3 [&_p]:mb-4 [&_p]:text-base [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-4 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-4 [&_li]:mb-2 [&_li]:text-base [&_li]:leading-relaxed"
        style={{ 
          fontSize: '1rem', 
          lineHeight: '1.75',
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      
      {/* Lightbox za slike */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh] p-4">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-white p-2 text-black hover:bg-gray-200 transition-colors"
              aria-label="Zatvori"
            >
              <X size={24} />
            </button>
            <Image
              src={lightboxImage}
              alt="Povećana slika"
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </>
  );
}

