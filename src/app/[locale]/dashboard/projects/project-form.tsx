"use client";

import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLinkIcon, Loader2Icon, SaveIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { BilingualRow, Field, langProps } from "@/components/dashboard/field";
import { MarkdownEditor } from "@/components/dashboard/markdown-editor";
import { FormSection } from "@/components/dashboard/page-header";
import { TagInput } from "@/components/dashboard/tag-input";
import { GalleryUpload, ImageUpload } from "@/components/dashboard/uploads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Link, useRouter } from "@/i18n/navigation";
import { slugify } from "@/lib/utils";
import { PROJECT_CATEGORIES, PROJECT_STATUSES, projectSchema, type ProjectInput } from "@/lib/validations/project";
import { createProject, updateProject } from "@/server/actions/projects";

export function ProjectForm({ id, defaults, techSuggestions, publicSlug }: { id?: string; defaults: ProjectInput; techSuggestions: string[]; publicSlug?: string }) {
  const t = useTranslations("dashboard");
  const tp = useTranslations("projects");
  const router = useRouter();

  const form = useForm<ProjectInput>({ resolver: zodResolver(projectSchema), defaultValues: defaults, mode: "onTouched" });
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const onSubmit = handleSubmit(
    async (values) => {
      const res = id ? await updateProject(id, values) : await createProject(values);
      if (!res.ok) {
        if (res.fieldErrors) {
          for (const [field, key] of Object.entries(res.fieldErrors)) setError(field as keyof ProjectInput, { message: key });
          toast.error(t("common.fixErrors"));
        } else toast.error(res.error === "notFound" ? t("common.notFound") : t("common.error"));
        return;
      }
      toast.success(id ? t("projects.updated") : t("projects.created"));
      form.reset(values);
      if (!id) router.replace(`/dashboard/projects/${res.data.id}`);
      router.refresh();
    },
    () => toast.error(t("common.fixErrors")),
  );

  const f = (key: keyof ProjectInput) => ({ htmlFor: key, error: errors[key]?.message as string | undefined });
  const titleEn = useWatch({ control, name: "titleEn" });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="grid min-w-0 gap-6">
        <FormSection title={t("projects.sections.basics")} hint={t("projects.sections.basicsHint")}>
          <BilingualRow>
            <Field label={t("projects.fields.title")} lang="en" {...f("titleEn")}>
              <Input id="titleEn" {...langProps("en")} aria-invalid={!!errors.titleEn} {...register("titleEn")} />
            </Field>
            <Field label={t("projects.fields.title")} lang="ar" {...f("titleAr")}>
              <Input id="titleAr" {...langProps("ar")} aria-invalid={!!errors.titleAr} {...register("titleAr")} />
            </Field>
          </BilingualRow>
          <BilingualRow>
            <Field label={t("projects.fields.summary")} lang="en" {...f("summaryEn")}>
              <Textarea id="summaryEn" rows={3} className="min-h-20" {...langProps("en")} aria-invalid={!!errors.summaryEn} {...register("summaryEn")} />
            </Field>
            <Field label={t("projects.fields.summary")} lang="ar" {...f("summaryAr")}>
              <Textarea id="summaryAr" rows={3} className="min-h-20" {...langProps("ar")} aria-invalid={!!errors.summaryAr} {...register("summaryAr")} />
            </Field>
          </BilingualRow>
          <Field label={t("projects.fields.slug")} hint={t("projects.fields.slugHint")} optional {...f("slug")}>
            <div className="flex items-center rounded-lg border border-input bg-foreground/[0.02] focus-within:border-brand/60 focus-within:ring-[3px] focus-within:ring-brand/20" dir="ltr">
              <span className="ps-3.5 font-mono text-xs text-muted-foreground">/projects/</span>
              <input
                id="slug"
                placeholder={slugify(titleEn || "").replace(/[^a-z0-9-]/g, "") || "my-project"}
                className="h-11 flex-1 bg-transparent px-1 font-mono text-sm outline-none placeholder:text-muted-foreground/50"
                aria-invalid={!!errors.slug}
                {...register("slug")}
              />
            </div>
          </Field>
        </FormSection>

        <FormSection title={t("projects.sections.caseStudy")} hint={t("projects.sections.caseStudyHint")}>
          {(["role", "problem", "solution", "result"] as const).map((key) => (
            <BilingualRow key={key}>
              {(["en", "ar"] as const).map((lang) => {
                const name = `${key}${lang === "en" ? "En" : "Ar"}` as keyof ProjectInput;
                return (
                  <Field key={name} label={t(`projects.fields.${key}`)} lang={lang} optional {...f(name)}>
                    {key === "role" ? (
                      <Input id={name} {...langProps(lang)} {...register(name)} />
                    ) : (
                      <Textarea id={name} rows={3} className="min-h-20" {...langProps(lang)} {...register(name)} />
                    )}
                  </Field>
                );
              })}
            </BilingualRow>
          ))}
        </FormSection>

        <FormSection title={t("projects.sections.content")} hint={t("projects.sections.contentHint")}>
          {(["en", "ar"] as const).map((lang) => {
            const name = lang === "en" ? "contentEn" : "contentAr";
            return (
              <Field key={name} label={t("projects.fields.content")} lang={lang} optional {...f(name)}>
                <Controller
                  control={control}
                  name={name}
                  render={({ field }) => <MarkdownEditor id={name} lang={lang} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />}
                />
              </Field>
            );
          })}
        </FormSection>

        <FormSection title={t("projects.sections.media")} hint={t("projects.sections.mediaHint")}>
          <Field label={t("projects.fields.cover")} optional {...f("coverImage")}>
            <Controller
              control={control}
              name="coverImage"
              render={({ field }) => <ImageUpload id="coverImage" folder="projects" value={field.value} onChange={field.onChange} className="max-w-md" />}
            />
          </Field>
          <Field label={t("projects.fields.gallery")} optional {...f("gallery")}>
            <Controller control={control} name="gallery" render={({ field }) => <GalleryUpload folder="projects" value={field.value} onChange={field.onChange} />} />
          </Field>
        </FormSection>
      </div>

      {/* ─── Sidebar ─── */}
      <aside className="grid content-start gap-6 lg:sticky lg:top-6 lg:self-start">
        <FormSection title={t("projects.sections.visibility")}>
          <Controller
            control={control}
            name="published"
            render={({ field }) => (
              <ToggleRow id="published" label={t("projects.fields.published")} hint={t("projects.fields.publishedHint")} checked={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="featured"
            render={({ field }) => (
              <ToggleRow id="featured" label={t("projects.fields.featured")} hint={t("projects.fields.featuredHint")} checked={field.value} onChange={field.onChange} />
            )}
          />
          <div className="flex flex-col gap-2 pt-1">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
              {isSubmitting ? t("common.saving") : id ? t("common.save") : t("common.create")}
            </Button>
            {publicSlug && (
              <Button variant="ghost" className="w-full" asChild>
                <Link href={`/projects/${publicSlug}`} target="_blank">
                  <ExternalLinkIcon />
                  {t("common.view")}
                </Link>
              </Button>
            )}
          </div>
        </FormSection>

        <FormSection title={t("projects.sections.details")}>
          <Field label={t("projects.fields.status")} {...f("status")}>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {tp(`status.${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label={t("projects.fields.category")} {...f("category")}>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {tp(`categories.${c}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label={t("projects.fields.techStack")} hint={t("projects.fields.techStackHint")} {...f("techStack")}>
            <Controller
              control={control}
              name="techStack"
              render={({ field }) => <TagInput id="techStack" value={field.value} onChange={field.onChange} suggestions={techSuggestions} />}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("projects.fields.startDate")} optional {...f("startDate")}>
              <Input id="startDate" type="date" {...register("startDate")} />
            </Field>
            <Field label={t("projects.fields.endDate")} optional {...f("endDate")}>
              <Input id="endDate" type="date" aria-invalid={!!errors.endDate} {...register("endDate")} />
            </Field>
          </div>
          <Field label={t("projects.fields.liveUrl")} optional {...f("liveUrl")}>
            <Input id="liveUrl" type="url" dir="ltr" placeholder="https://" aria-invalid={!!errors.liveUrl} {...register("liveUrl")} />
          </Field>
          <Field label={t("projects.fields.githubUrl")} optional {...f("githubUrl")}>
            <Input id="githubUrl" type="url" dir="ltr" placeholder="https://github.com/…" aria-invalid={!!errors.githubUrl} {...register("githubUrl")} />
          </Field>
          <Field label={t("projects.fields.clientName")} optional {...f("clientName")}>
            <Input id="clientName" {...register("clientName")} />
          </Field>
        </FormSection>
      </aside>
    </form>
  );
}

function ToggleRow({ id, label, hint, checked, onChange }: { id: string; label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="grid gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
