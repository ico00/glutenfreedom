"use client";

import ReactMarkdown from "react-markdown";
import { useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  return (
    <>
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <ReactMarkdown
          components={{
            p({ node, children, ...props }: any) {
              // Provjeri da li paragraf sadrži sliku
              // react-markdown struktura: node.children je array
              const hasImage = node.children?.some((child: any) => 
                child?.type === 'element' && child?.tagName === 'img'
              );
              
              if (hasImage) {
                // Ako paragraf sadrži sliku, renderiraj children bez <p> wrappera
                // Slike će biti renderirane kao block elementi (<div>) koji ne mogu biti u <p>
                return <div className="mb-6">{children}</div>;
              }
              
              return (
                <p className="mb-6 leading-relaxed text-base text-gf-text-primary dark:text-neutral-300" {...props}>
                  {children}
                </p>
              );
            },
            strong({ node, children, ...props }: any) {
              return (
                <strong className="font-semibold text-gf-text-primary dark:text-neutral-100" {...props}>
                  {children}
                </strong>
              );
            },
            em({ node, children, ...props }: any) {
              return (
                <em className="italic" {...props}>
                  {children}
                </em>
              );
            },
            h1({ node, children, ...props }: any) {
              return (
                <h1 className="text-3xl font-bold mb-4 mt-8 text-gf-text-primary dark:text-neutral-100" {...props}>
                  {children}
                </h1>
              );
            },
            h2({ node, children, ...props }: any) {
              return (
                <h2 className="text-2xl font-bold mb-3 mt-6 text-gf-text-primary dark:text-neutral-100" {...props}>
                  {children}
                </h2>
              );
            },
            h3({ node, children, ...props }: any) {
              return (
                <h3 className="text-xl font-bold mb-2 mt-4 text-gf-text-primary dark:text-neutral-100" {...props}>
                  {children}
                </h3>
              );
            },
            img({ node, ...props }: any) {
              const src = props.src || "";
              const alt = props.alt || "";
              const title = props.title || "";
              
              // Provjeri align iz title atributa (format: "align:left") ili direktno iz props
              let align = props.align || "full";
              if (title && title.startsWith("align:")) {
                align = title.replace("align:", "");
              } else if (props.className?.match(/align-(left|right|center|full)/)) {
                align = props.className.match(/align-(left|right|center|full)/)?.[1] || "full";
              }
              
              // Različiti stilovi ovisno o poziciji
              const getContainerClasses = () => {
                switch (align) {
                  case "left":
                    return "my-4 float-left mr-4 mb-4 max-w-[50%] sm:max-w-[40%]";
                  case "right":
                    return "my-4 float-right ml-4 mb-4 max-w-[50%] sm:max-w-[40%]";
                  case "center":
                    return "my-8 mx-auto block max-w-2xl";
                  case "full":
                  default:
                    return "my-8 w-full";
                }
              };
              
              const getImageClasses = () => {
                switch (align) {
                  case "left":
                  case "right":
                    return "h-auto w-full object-contain";
                  case "center":
                    return "h-auto w-full object-contain";
                  case "full":
                  default:
                    return "h-auto w-full object-contain";
                }
              };
              
              return (
                <div className={`${getContainerClasses()} clear-both`}>
                  <div
                    className="relative cursor-pointer overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-[1.02]"
                    onClick={() => setLightboxImage(src)}
                  >
                    <Image
                      src={src}
                      alt={alt}
                      width={1200}
                      height={800}
                      className={getImageClasses()}
                      unoptimized
                    />
                  </div>
                  {alt && (
                    <p className={`mt-2 text-sm text-gf-text-secondary dark:text-neutral-400 ${
                      align === "center" || align === "full" ? "text-center" : "text-left"
                    }`}>
                      {alt}
                    </p>
                  )}
                </div>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
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
