/**
 * Bilingual DB fields are stored as `<key>En` / `<key>Ar`.
 * `localized(project, "title", locale)` returns the right one, falling back to the other language when empty.
 */
type Bilingual<K extends string> = { [P in `${K}En` | `${K}Ar`]?: string | null };

export function localized<K extends string>(obj: Bilingual<K>, key: K, locale: string): string {
  const en = obj[`${key}En` as `${K}En`];
  const ar = obj[`${key}Ar` as `${K}Ar`];
  return (locale === "ar" ? ar || en : en || ar) ?? "";
}

export function localizedOrNull<K extends string>(obj: Bilingual<K>, key: K, locale: string): string | null {
  return localized(obj, key, locale) || null;
}
