"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2Icon, Loader2Icon, SendIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ContactInput } from "@/lib/validations/contact";
import { sendContactMessage } from "@/server/actions/contact";

/**
 * Lightweight client-side mirror of `contactSchema` — keeps Zod (~400 KB) out of the public bundle.
 * The server action still validates with the real Zod schema.
 */
const resolver: Resolver<ContactInput> = async (values) => {
  const errors: Partial<Record<keyof ContactInput, { type: string; message: string }>> = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const message = values.message.trim();
  if (name.length < 2 || name.length > 100) errors.name = { type: "invalid", message: "name" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) errors.email = { type: "invalid", message: "email" };
  if (message.length < 10 || message.length > 5000) errors.message = { type: "invalid", message: "message" };
  return Object.keys(errors).length ? { values: {}, errors } : { values, errors: {} };
};

export function ContactForm() {
  const t = useTranslations("contact");
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver,
    defaultValues: { name: "", email: "", subject: "", message: "", company: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await sendContactMessage(values);
    if (result.ok) {
      reset();
      setSent(true);
      toast.success(t("form.success"));
      return;
    }
    if (result.error === "validation" && result.fieldErrors) {
      for (const [field, key] of Object.entries(result.fieldErrors)) setError(field as keyof ContactInput, { message: key });
      return;
    }
    toast.error(result.error === "rateLimited" ? t("form.rateLimited") : t("form.error"));
  });

  const fieldError = (field: "name" | "email" | "message") =>
    errors[field] ? (
      <p id={`${field}-error`} className="text-xs text-destructive" role="alert">
        {t(`validation.${field}`)}
      </p>
    ) : null;

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[26rem] flex-col items-center justify-center gap-5 text-center"
            role="status"
          >
            <span className="grid size-16 place-items-center rounded-full bg-success/10 text-success">
              <CheckCircle2Icon className="size-8" />
            </span>
            <p className="max-w-sm text-lg">{t("form.success")}</p>
            <Button variant="outline" onClick={() => setSent(false)}>
              {t("form.submit")}
            </Button>
          </motion.div>
        ) : (
          <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("form.name")}</Label>
              <Input
                id="name"
                autoComplete="name"
                placeholder={t("form.namePlaceholder")}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                {...register("name")}
              />
              {fieldError("name")}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t("form.email")}</Label>
              <Input
                id="email"
                type="email"
                dir="ltr"
                autoComplete="email"
                placeholder={t("form.emailPlaceholder")}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className="rtl:text-right"
                {...register("email")}
              />
              {fieldError("email")}
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="subject">{t("form.subject")}</Label>
              <Input id="subject" placeholder={t("form.subjectPlaceholder")} {...register("subject")} />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="message">{t("form.message")}</Label>
              <Textarea
                id="message"
                rows={6}
                placeholder={t("form.messagePlaceholder")}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
                className="min-h-40"
                {...register("message")}
              />
              {fieldError("message")}
            </div>
            {/* honeypot */}
            <div aria-hidden className="absolute -start-[9999px] size-px overflow-hidden">
              <label htmlFor="company">Company</label>
              <input id="company" tabIndex={-1} autoComplete="off" {...register("company")} />
            </div>
            <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:col-span-2 sm:w-fit">
              {isSubmitting ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  {t("form.sending")}
                </>
              ) : (
                <>
                  {t("form.submit")}
                  <SendIcon className="transition-transform duration-300 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
                </>
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
