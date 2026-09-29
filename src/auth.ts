import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";

let dummy: Promise<string> | undefined;
const dummyHash = () => (dummy ??= bcrypt.hash("timing-equalizer", 12));

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const user = await db.user.findUnique({ where: { email: parsed.data.email } });
        // Always run bcrypt so response time doesn't reveal whether the email exists.
        const hash = user?.passwordHash ?? (await dummyHash());
        const valid = await bcrypt.compare(parsed.data.password, hash);
        if (!user || !valid) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
});
