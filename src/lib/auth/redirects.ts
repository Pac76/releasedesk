const PRODUCTION_ORIGIN = "https://releasedesk-three.vercel.app";
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;
const ENCODED_PATH_SEPARATOR_PATTERN = /%(?:2f|5c)/i;

export function sanitizeNextPath(
  candidate: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (
    !candidate ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    CONTROL_CHARACTER_PATTERN.test(candidate) ||
    ENCODED_PATH_SEPARATOR_PATTERN.test(candidate)
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(candidate, "https://releasedesk.local");
    if (
      parsed.origin !== "https://releasedesk.local" ||
      parsed.pathname.startsWith("//") ||
      parsed.pathname.includes("\\")
    ) {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

type HeaderReader = Pick<Headers, "get">;

function readFirstHeaderValue(value: string | null): string | undefined {
  return value?.split(",", 1)[0]?.trim() || undefined;
}

export function getTrustedSiteOrigin(headers: HeaderReader): string {
  const forwardedHost = readFirstHeaderValue(headers.get("x-forwarded-host"));
  const host = forwardedHost ?? readFirstHeaderValue(headers.get("host"));

  if (host === "releasedesk-three.vercel.app") {
    return PRODUCTION_ORIGIN;
  }

  if (host && /^(?:localhost|127\.0\.0\.1)(?::\d{1,5})?$/.test(host)) {
    try {
      return new URL(`http://${host}`).origin;
    } catch {
      return PRODUCTION_ORIGIN;
    }
  }

  return PRODUCTION_ORIGIN;
}

export function isProtectedPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}
