"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Field } from "@/components/dashboard/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/i18n/navigation";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { login } from "@/server/actions/auth";

export function LoginForm({ callbackUrl }: { callbackUrl: string | null }) {
  const t = useTranslations("dashboard.login");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const res = await login(values);
    if (!res.ok) {
      setError(res.error === "rateLimited" ? t("rateLimited") : t("invalidCredentials"));
      return;
    }
    // callbackUrl already contains the locale prefix, so bypass the locale-aware router for it.
    if (callbackUrl) window.location.assign(callbackUrl);
    else {
      router.replace("/dashboard");
      router.refresh();
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="mt-7 grid gap-5">
      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
      <Field label={t("email")} htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="username" dir="ltr" autoFocus aria-invalid={!!errors.email} {...register("email")} />
      </Field>
      <Field label={t("password")} htmlFor="password" error={errors.password?.message}>
        <div className="relative">
          <Input
            id="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            dir="ltr"
            aria-invalid={!!errors.password}
            className="pe-11"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? tCommon("hidePassword") : tCommon("showPassword")}
            className="absolute end-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:text-foreground"
          >
            {show ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
          </button>
        </div>
      </Field>
      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 w-full">
        {isSubmitting && <Loader2Icon className="animate-spin" />}
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
