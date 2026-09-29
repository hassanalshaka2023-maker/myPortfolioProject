import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default async function DashboardLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  // The proxy already guards /dashboard; this is defense in depth for direct renders.
  const session = await auth();
  if (!session?.user) redirect({ href: "/login", locale: locale as Locale });

  const unread = await db.message.count({ where: { read: false } });

  return (
    <div className="lg:flex">
      <DashboardSidebar email={session!.user.email ?? ""} unread={unread} />
      <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
