"use client";

import { Loader2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/** Dialog shell for add/edit forms: scrollable body, sticky footer with Cancel / Save. */
export function CrudDialog({
  open,
  onOpenChange,
  title,
  onSubmit,
  submitting,
  isNew,
  wide,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  isNew: boolean;
  wide?: boolean;
  children: React.ReactNode;
}) {
  const t = useTranslations("dashboard.common");
  return (
    <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <DialogContent className={cn("flex max-h-[90dvh] flex-col gap-0 p-0", wide ? "max-w-3xl" : "max-w-lg")}>
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="grid gap-5 overflow-y-auto px-6 py-5">{children}</div>
          <DialogFooter className="border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2Icon className="animate-spin" />}
              {submitting ? t("saving") : isNew ? t("create") : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** A row in the sortable CRUD lists: handle · content · edit/delete. */
export function CrudRow({ handle, children, onEdit, onDelete }: { handle: React.ReactNode; children: React.ReactNode; onEdit: () => void; onDelete: () => void }) {
  const t = useTranslations("dashboard.common");
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card/60 p-2.5 pe-3 transition-colors hover:bg-card">
      {handle}
      <button type="button" onClick={onEdit} className="flex min-w-0 flex-1 items-center gap-3 text-start">
        {children}
      </button>
      <Button variant="ghost" size="sm" onClick={onEdit}>
        {t("edit")}
      </Button>
      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={onDelete}>
        {t("delete")}
      </Button>
    </div>
  );
}
