import "server-only";
import { auth } from "@/auth";

/** Throws unless the request comes from the signed-in admin. Call at the top of every dashboard action. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}
