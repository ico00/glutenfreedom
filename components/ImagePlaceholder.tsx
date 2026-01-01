"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ImagePlaceholderProps {
  icon?: LucideIcon;
  gradient?: string;
  emoji?: string;
  imageUrl?: string;
  alt?: string;
}

const APP_ICON = "/favicon.ico"; // Fallback na ikonu aplikacije

export function ImagePlaceholder({ 
  icon: Icon, 
  gradient = "from-gf-safe/30 via-gf-cta/20 to-gf-safe/30",
  emoji,
  imageUrl,
  alt = "Image"
}: ImagePlaceholderProps) {
  const [imageError, setImageError] = useState(false);
  // Provjeri da li imageUrl postoji i nije prazan string
  const hasValidImageUrl = imageUrl && imageUrl.trim() !== "";
  const [showFallback, setShowFallback] = useState(!hasValidImageUrl);
  const [iconError, setIconError] = useState(false);

  // Ako postoji stvarna slika i nije došlo do greške, prikaži je
  if (hasValidImageUrl && !imageError && !showFallback) {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <motion.div
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="relative h-full w-full"
        >
          <Image
            src={imageUrl}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => {
              setImageError(true);
              setShowFallback(true);
            }}
            onLoad={() => {
              // Ako se slika uspješno učita, osiguraj da fallback nije prikazan
              setShowFallback(false);
            }}
          />
        </motion.div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.1)_100%)]" />
      </div>
    );
  }

  // Inače prikaži placeholder s ikonom aplikacije ili fallback-om
  return (
    <div className={`relative h-full w-full overflow-hidden bg-gradient-to-br ${gradient}`}>
      <motion.div
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        {/* Prvo pokušaj prikazati ikonu aplikacije ako nema emoji ili ikone */}
        {!emoji && !Icon && !iconError && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="relative h-24 w-24"
          >
            <Image
              src={APP_ICON}
              alt="Gluten Freedom"
              fill
              className="object-contain"
              onError={() => {
                setIconError(true);
              }}
            />
          </motion.div>
        )}
        {/* Ako postoji emoji, prikaži ga */}
        {emoji && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-6xl"
          >
            {emoji}
          </motion.span>
        )}
        {/* Ako postoji ikona, prikaži je (ako nema emoji) */}
        {Icon && !emoji && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <Icon className="h-16 w-16 text-white/80" />
          </motion.div>
        )}
        {/* Ako ni ikona aplikacije ne postoji, prikaži default emoji */}
        {!emoji && !Icon && iconError && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-6xl"
          >
            🌾
          </motion.span>
        )}
      </motion.div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.1)_100%)]" />
    </div>
  );
}

