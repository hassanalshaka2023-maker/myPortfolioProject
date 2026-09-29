"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BriefcaseIcon, GraduationCapIcon, LaptopIcon, PlusIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { CrudDialog, CrudRow } from "@/components/dashboard/crud-dialog";
import { BilingualRow, Field, langProps } from "@/components/dashboard/field";
import { MarkdownEditor } from "@/components/dashboard/markdown-editor";
import { EmptyState } from "@/components/dashboard/page-header";
import { SortableList } from "@/components/dashboard/sortable-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "@/i18n/navigation";
import { formatDate } from "@/lib/utils";
import { EXPERIENCE_TYPES, experienceSchema, type ExperienceInput } from "@/lib/validations/content";
import { deleteExperience, reorderExperience, saveExperience } from "@/server/actions/content";

type Item = ExperienceInput & { id: string };

const ICONS = { WORK: BriefcaseIcon, FREELANCE: LaptopIcon, EDUCATION: GraduationCapIcon } as const;
const EMPTY: ExperienceInput = {
  type: "WORK",
  roleEn: "",
  roleAr: "",
  organizationEn: "",
  organizationAr: "",
  locationEn: "",
  locationAr: "",
  descriptionEn: "",
  descriptionAr: "",
  startDate: "",
  endDate: "",
};

export function ExperienceManager({ items }: { items: Item[] }) {
  const t = useTranslations("dashboard");
  const tt = useTranslations("experience.types");
  const locale = useLocale();
  const router = useRouter();
  const [editing, setEditing] = useState<Item | "new" | null>(null);
  const [toDelete, setToDelete] = useState<Item | null>(null);

  const form = useForm<ExperienceInput>({ resolver: zodResolver(experienceSchema), defaultValues: EMPTY });
  const errors = form.formState.errors;

  const open = (item: Item | "new") => {
    if (item === "new") form.reset(EMPTY);
    else {
      const { id: _id, ...values } = item;
      form.reset(values);
    }
    setEditing(item);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const res = await saveExperience(editing === "new" || !editing ? null : editing.id, values);
    if (!res.ok) {
      Object.entries(res.fieldErrors ?? {}).forEach(([k, m]) => form.setError(k as keyof ExperienceInput, { message: m }));
      if (!res.fieldErrors) toast.error(t("common.error"));
      return;
    }
    toast.success(t("experience.saved"));
    setEditing(null);
    router.refresh();
  });

  const text = (i: Item, key: "role" | "organization") => (locale === "ar" ? i[`${key}Ar`] || i[`${key}En`] : i[`${key}En`] || i[`${key}Ar`]);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => open("new")}>
          <PlusIcon />
          {t("experience.new")}
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={BriefcaseIcon} title={t("experience.empty")} description={t("experience.emptyDescription")} />
      ) : (
        <SortableList
          items={items}
          onReorder={async (ids) => {
            const res = await reorderExperience(ids);
            if (res.ok) toast.success(t("common.reordered"));
            else toast.error(t("common.error"));
          }}
          renderItem={(item, handle) => {
            const Icon = ICONS[item.type];
            return (
              <CrudRow handle={handle} onEdit={() => open(item)} onDelete={() => setToDelete(item)}>
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border bg-background text-brand-text">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{text(item, "role")}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {text(item, "organization")} · {tt(item.type)}
                  </span>
                </span>
                <span className="hidden shrink-0 font-mono text-xs text-muted-foreground md:block">
                  {item.startDate && formatDate(item.startDate, locale)} — {item.endDate ? formatDate(item.endDate, locale) : t("common.present")}
                </span>
              </CrudRow>
            );
          }}
        />
      )}

      <CrudDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing === "new" ? t("experience.new") : t("experience.edit")}
        isNew={editing === "new"}
        submitting={form.formState.isSubmitting}
        onSubmit={onSubmit}
        wide
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label={t("experience.fields.type")} htmlFor="type">
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {tt(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label={t("experience.fields.startDate")} htmlFor="startDate" error={errors.startDate?.message}>
            <Input id="startDate" type="date" aria-invalid={!!errors.startDate} {...form.register("startDate")} />
          </Field>
          <Field label={t("experience.fields.endDate")} htmlFor="endDate" hint={t("experience.fields.endDateHint")} error={errors.endDate?.message}>
            <Input id="endDate" type="date" aria-invalid={!!errors.endDate} {...form.register("endDate")} />
          </Field>
        </div>
        {(["role", "organization", "location"] as const).map((key) => (
          <BilingualRow key={key}>
            {(["en", "ar"] as const).map((lang) => {
              const name = `${key}${lang === "en" ? "En" : "Ar"}` as keyof ExperienceInput;
              return (
                <Field key={name} label={t(`experience.fields.${key}`)} lang={lang} htmlFor={name} error={errors[name]?.message} optional={key === "location"}>
                  <Input id={name} {...langProps(lang)} aria-invalid={!!errors[name]} {...form.register(name)} />
                </Field>
              );
            })}
          </BilingualRow>
        ))}
        {(["en", "ar"] as const).map((lang) => {
          const name = lang === "en" ? "descriptionEn" : "descriptionAr";
          return (
            <Field key={name} label={t("experience.fields.description")} lang={lang} htmlFor={name} optional>
              <Controller
                control={form.control}
                name={name}
                render={({ field }) => <MarkdownEditor id={name} lang={lang} rows={5} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />}
              />
            </Field>
          );
        })}
      </CrudDialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        description={t("common.confirmDelete", { name: toDelete ? text(toDelete, "role") : "" })}
        onConfirm={async () => {
          if (!toDelete) return;
          const res = await deleteExperience(toDelete.id);
          if (res.ok) {
            toast.success(t("experience.deleted"));
            router.refresh();
          } else toast.error(t("common.error"));
        }}
      />
    </>
  );
}
