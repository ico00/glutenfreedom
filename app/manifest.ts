import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gluten Freedom",
    short_name: "Gluten Freedom",
    description: "Web aplikacija i informativna platforma vezana uz celijakiju, gluten free recepte, savjete, restorane i proizvode bez glutena.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#8B4513",
    icons: [
      {
        src: "/images/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

