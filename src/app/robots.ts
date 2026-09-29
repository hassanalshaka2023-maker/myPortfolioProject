import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/ar/dashboard", "/login", "/ar/login", "/api/", "/styleguide", "/ar/styleguide"],
    },
    sitemap: siteUrl("/sitemap.xml"),
    host: siteUrl(),
  };
}
