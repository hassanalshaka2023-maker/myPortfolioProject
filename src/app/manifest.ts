import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hassan Alsheikha — Full-Stack Developer",
    short_name: "Hassan",
    description: "Portfolio of Hassan Alsheikha, Full-Stack & Backend developer.",
    start_url: "/",
    display: "standalone",
    background_color: "#0e0d12",
    theme_color: "#0e0d12",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
  };
}
