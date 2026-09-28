import { notFound } from "next/navigation";

// Catch-all so unknown paths render the localized not-found page (inside the [locale] layout).
export default function CatchAll() {
  notFound();
}
