"use client";

import { Restaurant } from "@/types";

interface GoogleMapProps {
  restaurant: Restaurant;
  width?: string;
  height?: string;
  className?: string;
}

export function GoogleMap({
  restaurant,
  width = "100%",
  height = "200px",
  className = "",
}: GoogleMapProps) {
  // Generiraj Google Maps embed URL (bez API key-a)
  const getMapUrl = (): string => {
    // Ako restoran ima koordinate, koristi ih
    if (restaurant.location?.lat && restaurant.location?.lng) {
      return `https://maps.google.com/maps?q=${restaurant.location.lat},${restaurant.location.lng}&hl=hr&z=15&output=embed`;
    }

    // Inače koristi adresu
    const address = Array.isArray(restaurant.address)
      ? restaurant.address[0] // Koristi prvu adresu ako ima više
      : restaurant.address;

    // Enkodiraj adresu za URL
    const encodedAddress = encodeURIComponent(address);
    return `https://maps.google.com/maps?q=${encodedAddress}&hl=hr&z=15&output=embed`;
  };

  // Generiraj Google Maps link za otvaranje u novom prozoru
  const getMapLink = (): string => {
    if (restaurant.location?.lat && restaurant.location?.lng) {
      return `https://www.google.com/maps?q=${restaurant.location.lat},${restaurant.location.lng}`;
    }

    const address = Array.isArray(restaurant.address)
      ? restaurant.address[0]
      : restaurant.address;

    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  };

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`} style={{ width, height }}>
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={getMapUrl()}
        title={`Mapa za ${restaurant.name}`}
      />
      {/* Link za otvaranje u novom prozoru - samo u donjem desnom kutu */}
      <a
        href={getMapLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 z-10 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gf-text-primary shadow-lg transition-colors hover:bg-gf-cta hover:text-white dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-gf-cta"
        aria-label={`Otvori ${restaurant.name} na Google Maps`}
      >
        Otvori na Google Maps
      </a>
    </div>
  );
}

