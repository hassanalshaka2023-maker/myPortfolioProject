"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, SparklesIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { CrudDialog, CrudRow } from "@/components/dashboard/crud-dialog";
import { BilingualRow, Field, langProps } from "@/components/dashboard/field";
import { EmptyState } from "@/components/dashboard/page-header";
import { SortableList } from "@/components/dashboard/sortable-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/navigation";
import { SERVICE_ICONS, serviceIcon } from "@/lib/service-icons";
import { cn } from "@/lib/utils";
import { serviceSchema, type ServiceInput } from "@/lib/validations/content";
import { deleteService, reorderServices, saveService } from "@/server/actions/content";

type Service = ServiceInput & { id: string };
const EMPTY: ServiceInput = { titleEn: "", titleAr: "", descriptionEn: "", descriptionAr: "", icon: "sparkles", published: true };

export function ServicesManager({ services }: { services: Service[] }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();
  const [editing, setEditing] = useState<Service | "new" | null>(null);
  const [toDelete, setToDelete] = useState<Service | null>(null);

  const form = useForm<ServiceInput>({ resolver: zodResolver(serviceSchema), defaultValues: EMPTY });
  const errors = form.formState.errors;
  const title = (s: Service) => (locale === "ar" ? s.titleAr || s.titleEn : s.titleEn || s.titleAr);

  const open = (s: Service | "new") => {
    if (s === "new") form.reset(EMPTY);
    else {
      const { id: _id, ...values } = s;
      form.reset(values);
    }
    setEditing(s);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const res = await saveService(editing === "new" || !editing ? null : editing.id, values);
    if (!res.ok) {
      Object.entries(res.fieldErrors ?? {}).forEach(([k, m]) => form.setError(k as keyof ServiceInput, { message: m }));
      if (!res.fieldErrors) toast.error(t("common.error"));
      return;
    }
    toast.success(t("services.saved"));
    setEditing(null);
    router.refresh();
  });

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => open("new")}>
          <PlusIcon />
          {t("services.new")}
        </Button>
      </div>

      {services.length === 0 ? (
        <EmptyState icon={SparklesIcon} title={t("services.empty")} description={t("services.emptyDescription")} />
      ) : (
        <SortableList
          items={services}
          onReorder={async (ids) => {
            const res = await reorderServices(ids);
            if (res.ok) toast.success(t("common.reordered"));
            else toast.error(t("common.error"));
          }}
          renderItem={(s, handle) => {
            const Icon = serviceIcon(s.icon);
            return (
              <CrudRow handle={handle} onEdit={() => open(s)} onDelete={() => setToDelete(s)}>
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border bg-background text-brand-text">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{title(s)}</span>
                  <span className="block truncate text-xs text-muted-foreground">{locale === "ar" ? s.descriptionAr : s.descriptionEn}</span>
                </span>
                {!s.published && <Badge variant="outline">{t("common.draft")}</Badge>}
              </CrudRow>
            );
          }}
        />
      )}

      <CrudDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing === "new" ? t("services.new") : t("services.edit")}
        isNew={editing === "new"}
        submitting={form.formState.isSubmitting}
        onSubmit={onSubmit}
        wide
      >
        <Field label={t("services.fields.icon")}>
          <Controller
            control={form.control}
            name="icon"
            render={({ field }) => (
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("services.fields.icon")}>
                {Object.entries(SERVICE_ICONS).map(([key, Icon]) => (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={field.value === key}
                    aria-label={key}
                    title={key}
                    onClick={() => field.onChange(key)}
                    className={cn(
                      "grid size-10 place-items-center rounded-lg border text-muted-foreground transition-colors hover:text-foreground",
                      field.value === key && "border-brand bg-brand/10 text-brand-text",
                    )}
                  >
                    <Icon className="size-4" />
                  </button>
                ))}
              </div>
            )}
          />
        </Field>
        {(["title", "description"] as const).map((key) => (
          <BilingualRow key={key}>
            {(["en", "ar"] as const).map((lang) => {
              const name = `${key}${lang === "en" ? "En" : "Ar"}` as "titleEn" | "titleAr" | "descriptionEn" | "descriptionAr";
              return (
                <Field key={name} label={t(`services.fields.${key}`)} lang={lang} htmlFor={name} error={errors[name]?.message}>
                  {key === "title" ? (
                    <Input id={name} {...langProps(lang)} aria-invalid={!!errors[name]} {...form.register(name)} />
                  ) : (
                    <Textarea id={name} rows={3} className="min-h-20" {...langProps(lang)} aria-invalid={!!errors[name]} {...form.register(name)} />
                  )}
                </Field>
              );
            })}
          </BilingualRow>
        ))}
        <Controller
          control={form.control}
          name="published"
          render={({ field }) => (
            <label className="flex items-center justify-between gap-4 rounded-lg border p-3">
              <span className="text-sm font-medium">{t("services.fields.published")}</span>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </label>
          )}
        />
      </CrudDialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        description={t("common.confirmDelete", { name: toDelete ? title(toDelete) : "" })}
        onConfirm={async () => {
          if (!toDelete) return;
          const res = await deleteService(toDelete.id);
          if (res.ok) {
            toast.success(t("services.deleted"));
            router.refresh();
          } else toast.error(t("common.error"));
        }}
      />
    </>
  );
}
