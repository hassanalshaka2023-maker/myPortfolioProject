import "server-only";
import { revalidatePath, updateTag } from "next/cache";
import { PUBLIC_TAG } from "@/server/queries";

/** Call after any dashboard mutation that affects the public site. Server Actions only. */
export function revalidatePublic() {
  updateTag(PUBLIC_TAG); // cached queries — next request waits for fresh data
  revalidatePath("/[locale]", "layout"); // prerendered pages (home, project pages, both locales)
}
