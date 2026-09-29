import { z } from "zod";

/** Error messages are keys under `dashboard.validation` in messages/*.json. */
export type ValidationKey =
  | "required"
  | "tooLong"
  | "invalidUrl"
  | "invalidEmail"
  | "invalidSlug"
  | "invalidDate"
  | "dateOrder"
  | "passwordShort"
  | "passwordMismatch"
  | "invalid";

export const requiredText = (max: number) => z.string().trim().min(1, "required").max(max, "tooLong");
export const optionalText = (max: number) => z.string().trim().max(max, "tooLong");
export const optionalUrl = z.union([z.literal(""), z.string().trim().url("invalidUrl").max(500, "tooLong")]);
/** "" or YYYY-MM-DD (native date input value) */
export const optionalDate = z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "invalidDate")]);
export const requiredDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "invalidDate");

export const toDate = (v: string) => (v ? new Date(`${v}T00:00:00.000Z`) : null);
export const toDateInput = (d: Date | string | null | undefined) => (d ? new Date(d).toISOString().slice(0, 10) : "");
export const emptyToNull = (v: string | undefined | null) => (v && v.trim() ? v.trim() : null);

export const reorderSchema = z.array(z.string().min(1)).max(500);
