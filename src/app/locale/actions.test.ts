// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookieSet: vi.fn(),
  cookies: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { setLocaleAction } from "@/app/locale/actions";

describe("locale selection action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookies.mockResolvedValue({ set: mocks.cookieSet });
  });

  it("persists an allowlisted locale and returns to the current path", async () => {
    const data = new FormData();
    data.set("locale", "es");
    data.set("current_path", "/projects");

    await setLocaleAction(data);

    expect(mocks.cookieSet).toHaveBeenCalledWith(
      "releasedesk_locale",
      "es",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      }),
    );
    expect(mocks.redirect).toHaveBeenCalledWith("/projects");
  });

  it.each([
    "/projects?status=review",
    "/login?next=%2Fprojects",
  ])("preserves a safe query-bearing return path: %s", async (currentPath) => {
    const data = new FormData();
    data.set("locale", "es");
    data.set("current_path", currentPath);

    await setLocaleAction(data);

    expect(mocks.redirect).toHaveBeenCalledWith(currentPath);
  });

  it("falls back to English and rejects an external redirect target", async () => {
    const data = new FormData();
    data.set("locale", "fr");
    data.set("current_path", "//attacker.example");

    await setLocaleAction(data);

    expect(mocks.cookieSet).toHaveBeenCalledWith(
      "releasedesk_locale",
      "en",
      expect.any(Object),
    );
    expect(mocks.redirect).toHaveBeenCalledWith("/");
  });
});
