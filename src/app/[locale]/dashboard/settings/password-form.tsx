"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRoundIcon, Loader2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Field } from "@/components/dashboard/field";
import { FormSection } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations/auth";
import { changePassword } from "@/server/actions/auth";

export function PasswordForm() {
  const t = useTranslations("dashboard");
  const form = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema), defaultValues: { current: "", next: "", confirm: "" } });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    const res = await changePassword(values);
    if (!res.ok) {
      Object.entries(res.fieldErrors ?? {}).forEach(([k, m]) => form.setError(k as keyof ChangePasswordInput, { message: m }));
      if (!res.fieldErrors) toast.error(t("common.error"));
      return;
    }
    toast.success(t("settings.password.changed"));
    form.reset();
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <FormSection title={t("settings.sections.security")} hint={t("settings.password.title")}>
        <div className="grid gap-5 md:grid-cols-3">
          {(["current", "next", "confirm"] as const).map((name) => (
            <Field key={name} label={t(`settings.password.${name}`)} htmlFor={`pw-${name}`} error={errors[name]?.message}>
              <Input
                id={`pw-${name}`}
                type="password"
                dir="ltr"
                autoComplete={name === "current" ? "current-password" : "new-password"}
                aria-invalid={!!errors[name]}
                {...form.register(name)}
              />
            </Field>
          ))}
        </div>
        <Button type="submit" variant="outline" disabled={isSubmitting} className="w-fit">
          {isSubmitting ? <Loader2Icon className="animate-spin" /> : <KeyRoundIcon />}
          {t("settings.password.submit")}
        </Button>
      </FormSection>
    </form>
  );
}
