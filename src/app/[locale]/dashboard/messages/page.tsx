import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/dashboard/page-header";
import type { Prisma } from "@/generated/prisma/client";
import type { Locale } from "@/i18n/routing";
import { db } from "@/lib/db";
import { Inbox } from "./inbox";

const PAGE_SIZE = 20;

export default async function MessagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; filter?: string; page?: string; open?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale: locale as Locale, namespace: "dashboard.messages" });

  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 100) ?? "";
  const filter = sp.filter === "unread" || sp.filter === "read" ? sp.filter : "all";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const where: Prisma.MessageWhereInput = {
    ...(filter === "unread" ? { read: false } : filter === "read" ? { read: true } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { subject: { contains: q, mode: "insensitive" } },
            { body: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, messages, unread, opened] = await Promise.all([
    db.message.count({ where }),
    db.message.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.message.count({ where: { read: false } }),
    sp.open ? db.message.findUnique({ where: { id: sp.open } }) : null,
  ]);

  const serialize = (m: (typeof messages)[number]) => ({ ...m, createdAt: m.createdAt.toISOString() });

  return (
    <>
      <PageHeader title={t("title")} description={`${t("description")} · ${t("unreadCount", { count: unread })}`} />
      <Inbox
        messages={messages.map(serialize)}
        opened={opened ? serialize(opened) : null}
        total={total}
        page={page}
        pages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        query={q}
        filter={filter}
        isEmpty={total === 0 && !q && filter === "all"}
      />
    </>
  );
}
