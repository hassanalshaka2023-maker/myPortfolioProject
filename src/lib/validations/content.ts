import { z } from "zod";
import { optionalDate, optionalText, requiredDate, requiredText } from "./common";

export const SKILL_CATEGORIES = ["BACKEND", "FRONTEND", "MOBILE", "DEVOPS", "DATABASES", "TOOLS"] as const;
export const EXPERIENCE_TYPES = ["WORK", "FREELANCE", "EDUCATION"] as const;

export const skillSchema = z.object({
  name: requiredText(60),
  category: z.enum(SKILL_CATEGORIES),
  icon: z.union([z.literal(""), z.string().trim().max(60, "tooLong").regex(/^[a-z0-9]+$/, "invalid")]),
});
export type SkillInput = z.infer<typeof skillSchema>;

export const experienceSchema = z
  .object({
    type: z.enum(EXPERIENCE_TYPES),
    roleEn: requiredText(160),
    roleAr: requiredText(160),
    organizationEn: requiredText(160),
    organizationAr: requiredText(160),
    locationEn: optionalText(120),
    locationAr: optionalText(120),
    descriptionEn: optionalText(5000),
    descriptionAr: optionalText(5000),
    startDate: requiredDate,
    endDate: optionalDate,
  })
  .refine((v) => !v.endDate || v.startDate <= v.endDate, { path: ["endDate"], message: "dateOrder" });
export type ExperienceInput = z.infer<typeof experienceSchema>;

export const serviceSchema = z.object({
  titleEn: requiredText(120),
  titleAr: requiredText(120),
  descriptionEn: requiredText(600),
  descriptionAr: requiredText(600),
  icon: z.string().min(1, "required"),
  published: z.boolean(),
});
export type ServiceInput = z.infer<typeof serviceSchema>;
