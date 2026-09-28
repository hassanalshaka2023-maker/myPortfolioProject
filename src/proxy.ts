import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 "proxy" (formerly middleware). Auth protection for /dashboard is added in phase 4.
export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals and any path with a file extension (sitemap.xml, images, …)
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
