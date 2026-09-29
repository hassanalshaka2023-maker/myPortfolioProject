import NextAuth from "next-auth";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

// /dashboard, /ar/dashboard/...  → captures the optional locale prefix
const DASHBOARD = /^\/(?:(ar|en)\/)?dashboard(?:\/|$)/;
const LOGIN = /^\/(?:(ar|en)\/)?login\/?$/;

const prefix = (locale?: string) => (locale && locale !== routing.defaultLocale ? `/${locale}` : "");

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const signedIn = !!req.auth?.user;

  const dashboard = pathname.match(DASHBOARD);
  if (dashboard && !signedIn) {
    const url = new URL(`${prefix(dashboard[1])}/login`, req.nextUrl);
    url.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(url);
  }

  const login = pathname.match(LOGIN);
  if (login && signedIn) {
    return NextResponse.redirect(new URL(`${prefix(login[1])}/dashboard`, req.nextUrl));
  }

  return intl(req);
});

export const config = {
  // Skip API routes, Next internals and any path with a file extension (sitemap.xml, images, …)
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
