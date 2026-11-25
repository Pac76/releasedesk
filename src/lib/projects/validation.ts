import { localize, type Locale } from "@/lib/i18n/locale";

export type ProjectFieldErrors = {
  description?: string;
  name?: string;
  targetDate?: string;
};

export type ProjectInput = {
  description: string | null;
  name: string;
  target_date: string | null;
};

export type ProjectValidationResult =
  | { data: ProjectInput; success: true }
  | { errors: ProjectFieldErrors; success: false };

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function characterLength(value: string): number {
  return Array.from(value).length;
}

export function isValidUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function isValidIsoDate(value: string): boolean {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    year >= 1 &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function validateProjectInput(
  formData: FormData,
  locale: Locale = "en",
): ProjectValidationResult {
  const name = readText(formData, "name").trim();
  const rawDescription = readText(formData, "description").trim();
  const rawTargetDate = readText(formData, "target_date").trim();
  const errors: ProjectFieldErrors = {};

  if (characterLength(name) < 1 || characterLength(name) > 80) {
    errors.name = localize(locale, {
      en: "Name must be between 1 and 80 characters.",
      es: "El nombre debe tener entre 1 y 80 caracteres.",
    });
  }

  if (characterLength(rawDescription) > 500) {
    errors.description = localize(locale, {
      en: "Description can be up to 500 characters.",
      es: "La descripción puede tener hasta 500 caracteres.",
    });
  }

  if (rawTargetDate && !isValidIsoDate(rawTargetDate)) {
    errors.targetDate = localize(locale, {
      en: "Enter a valid date in YYYY-MM-DD format.",
      es: "Ingresá una fecha válida con formato AAAA-MM-DD.",
    });
  }

  if (Object.keys(errors).length > 0) {
    return { errors, success: false };
  }

  return {
    data: {
      description: rawDescription || null,
      name,
      target_date: rawTargetDate || null,
    },
    success: true,
  };
}
