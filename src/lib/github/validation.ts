import { localize, type Locale } from "@/lib/i18n/locale";

const OWNER_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/;
const REPOSITORY_PATTERN = /^[a-z0-9._-]{1,100}$/;

export type RepositoryValidationResult =
  | { success: true; value: string }
  | { success: false; error: string };

export function validateRepositoryFullName(
  input: FormDataEntryValue | null | undefined,
  locale: Locale = "en",
): RepositoryValidationResult {
  if (typeof input !== "string") {
    return {
      success: false,
      error: localize(locale, {
        en: "Enter a repository as owner/repository.",
        es: "Ingresá un repositorio como organización/proyecto.",
      }),
    };
  }

  const value = input.trim().toLowerCase();
  const parts = value.split("/");
  if (
    parts.length !== 2 ||
    !OWNER_PATTERN.test(parts[0] ?? "") ||
    !REPOSITORY_PATTERN.test(parts[1] ?? "") ||
    parts[1] === "." ||
    parts[1] === ".." ||
    parts[1]?.endsWith(".git")
  ) {
    return {
      success: false,
      error: localize(locale, {
        en: "Use the public owner/repository format, without a URL or .git suffix.",
        es: "Usá el formato público organización/proyecto, sin URL ni .git.",
      }),
    };
  }

  return { success: true, value };
}
