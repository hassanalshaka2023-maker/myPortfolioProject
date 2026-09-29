import { z } from "zod";
import { optionalText, optionalUrl, requiredText } from "./common";

export const settingsSchema = z.object({
  nameEn: requiredText(80),
  nameAr: requiredText(80),
  roleEn: requiredText(80),
  roleAr: requiredText(80),
  taglineEn: requiredText(160),
  taglineAr: requiredText(160),
  introEn: requiredText(500),
  introAr: requiredText(500),
  aboutEn: optionalText(10_000),
  aboutAr: optionalText(10_000),

  email: z.union([z.literal(""), z.string().trim().email("invalidEmail")]),
  phone: optionalText(40),
  locationEn: optionalText(120),
  locationAr: optionalText(120),
  avatarUrl: optionalUrl,
  cvUrl: optionalUrl,

  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  xUrl: optionalUrl,
  telegramUrl: optionalUrl,
  whatsappUrl: optionalUrl,

  yearsOfExperience: z.number().int().min(0).max(60),
  openToWork: z.boolean(),

  showAbout: z.boolean(),
  showSkills: z.boolean(),
  showProjects: z.boolean(),
  showRoadmap: z.boolean(),
  showExperience: z.boolean(),
  showServices: z.boolean(),
  showContact: z.boolean(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

export const SECTION_TOGGLES = ["showAbout", "showSkills", "showProjects", "showRoadmap", "showExperience", "showServices", "showContact"] as const;
