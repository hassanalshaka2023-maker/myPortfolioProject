"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { BilingualRow, Field, langProps } from "@/components/dashboard/field";
import { MarkdownEditor } from "@/components/dashboard/markdown-editor";
import { FormSection } from "@/components/dashboard/page-header";
import { FileUpload, ImageUpload } from "@/components/dashboard/uploads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/navigation";
import { SECTION_TOGGLES, settingsSchema, type SettingsInput } from "@/lib/validations/settings";
import { updateSettings } from "@/server/actions/settings";

type TextKey = "name" | "role" | "tagline" | "intro";

export function SettingsForm({ defaults }: { defaults: SettingsInput }) {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const form = useForm<SettingsInput>({ resolver: zodResolver(settingsSchema), defaultValues: defaults, mode: "onTouched" });
  const {
    register,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const onSubmit = form.handleSubmit(
    async (values) => {
      const res = await updateSettings(values);
      if (!res.ok) {
        Object.entries(res.fieldErrors ?? {}).forEach(([k, m]) => form.setError(k as keyof SettingsInput, { message: m }));
        toast.error(res.fieldErrors ? t("common.fixErrors") : t("common.error"));
        return;
      }
      toast.success(t("settings.saved"));
      form.reset(values);
      router.refresh();
    },
    () => toast.error(t("common.fixErrors")),
  );

  const err = (k: keyof SettingsInput) => errors[k]?.message as string | undefined;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      <FormSection title={t("settings.sections.profile")} hint={t("settings.sections.profileHint")}>
        {(["name", "role", "tagline", "intro"] as TextKey[]).map((key) => (
          <BilingualRow key={key}>
            {(["en", "ar"] as const).map((lang) => {
              const name = `${key}${lang === "en" ? "En" : "Ar"}` as keyof SettingsInput;
              return (
                <Field key={name} label={t(`settings.fields.${key}`)} lang={lang} htmlFor={name} error={err(name)}>
                  {key === "intro" ? (
                    <Textarea id={name} rows={3} className="min-h-20" {...langProps(lang)} aria-invalid={!!errors[name]} {...register(name)} />
                  ) : (
                    <Input id={name} {...langProps(lang)} aria-invalid={!!errors[name]} {...register(name)} />
                  )}
                </Field>
              );
            })}
          </BilingualRow>
        ))}
        {(["en", "ar"] as const).map((lang) => {
          const name = lang === "en" ? "aboutEn" : "aboutAr";
          return (
            <Field key={name} label={t("settings.fields.about")} lang={lang} htmlFor={name} error={err(name)} optional>
              <Controller
                control={control}
                name={name}
                render={({ field }) => <MarkdownEditor id={name} lang={lang} rows={6} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />}
              />
            </Field>
          );
        })}
      </FormSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <FormSection title={t("settings.sections.contact")}>
          <Field label={t("settings.fields.email")} htmlFor="email" error={err("email")} optional>
            <Input id="email" type="email" dir="ltr" aria-invalid={!!errors.email} {...register("email")} />
          </Field>
          <Field label={t("settings.fields.phone")} htmlFor="phone" error={err("phone")} optional>
            <Input id="phone" type="tel" dir="ltr" {...register("phone")} />
          </Field>
          <BilingualRow>
            <Field label={t("settings.fields.location")} lang="en" htmlFor="locationEn" optional>
              <Input id="locationEn" {...langProps("en")} {...register("locationEn")} />
            </Field>
            <Field label={t("settings.fields.location")} lang="ar" htmlFor="locationAr" optional>
              <Input id="locationAr" {...langProps("ar")} {...register("locationAr")} />
            </Field>
          </BilingualRow>
        </FormSection>

        <FormSection title={t("settings.sections.social")}>
          {(
            [
              ["githubUrl", "github", "https://github.com/…"],
              ["linkedinUrl", "linkedin", "https://linkedin.com/in/…"],
              ["xUrl", "x", "https://x.com/…"],
              ["telegramUrl", "telegram", "https://t.me/…"],
              ["whatsappUrl", "whatsapp", "https://wa.me/…"],
            ] as const
          ).map(([name, label, placeholder]) => (
            <Field key={name} label={t(`settings.fields.${label}`)} htmlFor={name} error={err(name)} optional>
              <Input id={name} type="url" dir="ltr" placeholder={placeholder} aria-invalid={!!errors[name]} {...register(name)} />
            </Field>
          ))}
        </FormSection>

        <FormSection title={t("settings.sections.media")}>
          <Field label={t("settings.fields.avatar")} htmlFor="avatarUrl" optional>
            <Controller
              control={control}
              name="avatarUrl"
              render={({ field }) => <ImageUpload id="avatarUrl" folder="avatar" value={field.value} onChange={field.onChange} aspect="aspect-square" className="w-40" />}
            />
          </Field>
          <Field label={t("settings.fields.cv")} htmlFor="cvUrl" optional>
            <Controller control={control} name="cvUrl" render={({ field }) => <FileUpload id="cvUrl" folder="cv" value={field.value} onChange={field.onChange} />} />
          </Field>
        </FormSection>

        <FormSection title={t("settings.sections.stats")}>
          <Field label={t("settings.fields.years")} htmlFor="yearsOfExperience" hint={t("settings.fields.yearsHint")} error={err("yearsOfExperience")}>
            <Input id="yearsOfExperience" type="number" min={0} max={60} className="w-32" {...register("yearsOfExperience", { valueAsNumber: true })} />
          </Field>
          <Controller
            control={control}
            name="openToWork"
            render={({ field }) => (
              <label className="flex items-start justify-between gap-4 rounded-lg border p-3">
                <span className="grid gap-0.5">
                  <span className="text-sm font-medium">{t("settings.fields.openToWork")}</span>
                  <span className="text-xs text-muted-foreground">{t("settings.fields.openToWorkHint")}</span>
                </span>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </label>
            )}
          />
        </FormSection>
      </div>

      <div id="visibility" className="scroll-mt-6">
        <FormSection title={t("settings.sections.visibility")} hint={t("settings.sections.visibilityHint")}>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {SECTION_TOGGLES.map((key) => (
              <Controller
                key={key}
                control={control}
                name={key}
                render={({ field }) => (
                  <label className="flex items-center justify-between gap-4 rounded-lg border p-3">
                    <span className="text-sm">{t(`settings.sectionsToggle.${key}`)}</span>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </label>
                )}
              />
            ))}
          </div>
        </FormSection>
      </div>

      {/* Sticky save bar */}
      <div className="glass sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-2xl p-3 ps-5 shadow-xl">
        <span className="text-sm text-muted-foreground">{isDirty ? "●" : t("common.saved")}</span>
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
          {isSubmitting ? t("common.saving") : t("common.save")}
        </Button>
      </div>
    </form>
  );
}
