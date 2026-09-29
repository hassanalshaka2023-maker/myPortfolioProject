import { z } from "zod";
import { optionalDate, optionalText, optionalUrl, requiredText } from "./common";

export const PROJECT_STATUSES = ["COMPLETED", "IN_PROGRESS", "PLANNED"] as const;
export const PROJECT_CATEGORIES = ["FULL_STACK", "BACKEND", "FRONTEND", "MOBILE", "OTHER"] as const;

export const projectSchema = z
  .object({
    titleEn: requiredText(160),
    titleAr: requiredText(160),
    slug: z.union([z.literal(""), z.string().trim().max(120, "tooLong").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "invalidSlug")]),
    summaryEn: requiredText(400),
    summaryAr: requiredText(400),
    contentEn: optionalText(50_000),
    contentAr: optionalText(50_000),
    roleEn: optionalText(300),
    roleAr: optionalText(300),
    problemEn: optionalText(4000),
    problemAr: optionalText(4000),
    solutionEn: optionalText(4000),
    solutionAr: optionalText(4000),
    resultEn: optionalText(4000),
    resultAr: optionalText(4000),
    coverImage: optionalUrl,
    gallery: z.array(z.string().url("invalidUrl")).max(20, "tooLong"),
    techStack: z.array(z.string().trim().min(1).max(40, "tooLong")).max(30, "tooLong"),
    category: z.enum(PROJECT_CATEGORIES),
    status: z.enum(PROJECT_STATUSES),
    startDate: optionalDate,
    endDate: optionalDate,
    liveUrl: optionalUrl,
    githubUrl: optionalUrl,
    clientName: optionalText(120),
    featured: z.boolean(),
    published: z.boolean(),
  })
  .refine((v) => !v.startDate || !v.endDate || v.startDate <= v.endDate, { path: ["endDate"], message: "dateOrder" });

export type ProjectInput = z.infer<typeof projectSchema>;

export const emptyProject: ProjectInput = {
  titleEn: "",
  titleAr: "",
  slug: "",
  summaryEn: "",
  summaryAr: "",
  contentEn: "",
  contentAr: "",
  roleEn: "",
  roleAr: "",
  problemEn: "",
  problemAr: "",
  solutionEn: "",
  solutionAr: "",
  resultEn: "",
  resultAr: "",
  coverImage: "",
  gallery: [],
  techStack: [],
  category: "FULL_STACK",
  status: "COMPLETED",
  startDate: "",
  endDate: "",
  liveUrl: "",
  githubUrl: "",
  clientName: "",
  featured: false,
  published: true,
};
