"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLinkIcon, PlusIcon, WrenchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { CrudDialog, CrudRow } from "@/components/dashboard/crud-dialog";
import { Field } from "@/components/dashboard/field";
import { EmptyState } from "@/components/dashboard/page-header";
import { SortableList } from "@/components/dashboard/sortable-list";
import { TechIcon } from "@/components/site/tech-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "@/i18n/navigation";
import { SKILL_CATEGORIES, skillSchema, type SkillInput } from "@/lib/validations/content";
import { deleteSkill, reorderSkills, saveSkill } from "@/server/actions/content";

type Skill = { id: string; name: string; category: SkillInput["category"]; icon: string | null };

export function SkillsManager({ skills }: { skills: Skill[] }) {
  const t = useTranslations("dashboard");
  const tc = useTranslations("skills.categories");
  const router = useRouter();
  const [editing, setEditing] = useState<Skill | "new" | null>(null);
  const [toDelete, setToDelete] = useState<Skill | null>(null);

  const form = useForm<SkillInput>({ resolver: zodResolver(skillSchema), defaultValues: { name: "", category: "BACKEND", icon: "" } });
  const [icon, name] = useWatch({ control: form.control, name: ["icon", "name"] });

  const open = (skill: Skill | "new") => {
    form.reset(skill === "new" ? { name: "", category: "BACKEND", icon: "" } : { name: skill.name, category: skill.category, icon: skill.icon ?? "" });
    setEditing(skill);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const res = await saveSkill(editing === "new" || !editing ? null : editing.id, values);
    if (!res.ok) {
      Object.entries(res.fieldErrors ?? {}).forEach(([k, m]) => form.setError(k as keyof SkillInput, { message: m }));
      if (!res.fieldErrors) toast.error(t("common.error"));
      return;
    }
    toast.success(t("skills.saved"));
    setEditing(null);
    router.refresh();
  });

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => open("new")}>
          <PlusIcon />
          {t("skills.new")}
        </Button>
      </div>

      {skills.length === 0 ? (
        <EmptyState icon={WrenchIcon} title={t("skills.empty")} description={t("skills.emptyDescription")} />
      ) : (
        <SortableList
          items={skills}
          onReorder={async (ids) => {
            const res = await reorderSkills(ids);
            if (res.ok) toast.success(t("common.reordered"));
            else toast.error(t("common.error"));
          }}
          renderItem={(skill, handle) => (
            <CrudRow handle={handle} onEdit={() => open(skill)} onDelete={() => setToDelete(skill)}>
              <span className="grid size-9 shrink-0 place-items-center rounded-lg border bg-background">
                <TechIcon slug={skill.icon} name={skill.name} className="size-4" />
              </span>
              <span className="min-w-0 flex-1 truncate font-medium" dir="ltr">
                {skill.name}
              </span>
              <Badge variant="outline" className="hidden sm:inline-flex">
                {tc(skill.category)}
              </Badge>
            </CrudRow>
          )}
        />
      )}

      <CrudDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing === "new" ? t("skills.new") : t("skills.edit")}
        isNew={editing === "new"}
        submitting={form.formState.isSubmitting}
        onSubmit={onSubmit}
      >
        <Field label={t("skills.fields.name")} htmlFor="name" error={form.formState.errors.name?.message}>
          <Input id="name" dir="ltr" autoFocus {...form.register("name")} />
        </Field>
        <Field label={t("skills.fields.category")} htmlFor="category">
          <Controller
            control={form.control}
            name="category"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {tc(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label={t("skills.fields.icon")} htmlFor="icon" hint={t("skills.fields.iconHint")} error={form.formState.errors.icon?.message} optional>
          <div className="flex items-center gap-2">
            <span className="grid size-11 shrink-0 place-items-center rounded-lg border bg-background">
              <TechIcon slug={icon || null} name={name || "?"} className="size-5" />
            </span>
            <Input id="icon" dir="ltr" placeholder="nodedotjs" className="font-mono" {...form.register("icon")} />
            <Button variant="outline" size="icon" asChild>
              <a href={`https://simpleicons.org/?q=${encodeURIComponent(name)}`} target="_blank" rel="noopener noreferrer" aria-label={t("skills.fields.iconBrowse")}>
                <ExternalLinkIcon />
              </a>
            </Button>
          </div>
        </Field>
      </CrudDialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        description={t("common.confirmDelete", { name: toDelete?.name ?? "" })}
        onConfirm={async () => {
          if (!toDelete) return;
          const res = await deleteSkill(toDelete.id);
          if (res.ok) {
            toast.success(t("skills.deleted"));
            router.refresh();
          } else toast.error(t("common.error"));
        }}
      />
    </>
  );
}
