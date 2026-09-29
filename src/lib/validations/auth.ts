import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("invalidEmail"),
  password: z.string().min(1, "required").max(200, "tooLong"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, "required"),
    next: z.string().min(12, "passwordShort").max(200, "tooLong"),
    confirm: z.string().min(1, "required"),
  })
  .refine((v) => v.next === v.confirm, { path: ["confirm"], message: "passwordMismatch" });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
