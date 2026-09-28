import { z } from "zod";

// Error messages are translation keys under `contact.validation` — resolved on the client.
export const contactSchema = z.object({
  name: z.string().trim().min(2, "name").max(100, "name"),
  email: z.string().trim().toLowerCase().email("email").max(200, "email"),
  subject: z.string().trim().max(150).optional().or(z.literal("")),
  message: z.string().trim().min(10, "message").max(5000, "message"),
  // Honeypot — real users never see or fill this field.
  company: z.string().max(0).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;
