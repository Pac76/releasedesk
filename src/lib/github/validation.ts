const OWNER_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/;
const REPOSITORY_PATTERN = /^[a-z0-9._-]{1,100}$/;

export type RepositoryValidationResult =
  | { success: true; value: string }
  | { success: false; error: string };

export function validateRepositoryFullName(
  input: FormDataEntryValue | null | undefined,
): RepositoryValidationResult {
  if (typeof input !== "string") {
    return { success: false, error: "Ingresá un repositorio como organización/proyecto." };
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
    return { success: false, error: "Usá el formato público organización/proyecto, sin URL ni .git." };
  }

  return { success: true, value };
}
