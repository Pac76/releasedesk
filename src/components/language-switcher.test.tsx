import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  setLocaleAction: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: mocks.usePathname,
  useSearchParams: mocks.useSearchParams,
}));
vi.mock("@/app/locale/actions", () => ({
  setLocaleAction: mocks.setLocaleAction,
}));

import { LanguageSwitcher } from "@/components/language-switcher";

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ["/projects", "status=review", "/projects?status=review"],
    ["/login", "next=%2Fprojects", "/login?next=%2Fprojects"],
  ])(
    "submits pathname and search parameters for %s",
    (pathname, query, expectedPath) => {
      mocks.usePathname.mockReturnValue(pathname);
      mocks.useSearchParams.mockReturnValue(new URLSearchParams(query));

      render(<LanguageSwitcher />);

      expect(screen.getByDisplayValue(expectedPath)).toHaveAttribute(
        "name",
        "current_path",
      );
    },
  );

  it("submits only the pathname when there is no query string", () => {
    mocks.usePathname.mockReturnValue("/");
    mocks.useSearchParams.mockReturnValue(new URLSearchParams());

    render(<LanguageSwitcher />);

    expect(screen.getByDisplayValue("/")).toHaveAttribute(
      "name",
      "current_path",
    );
  });
});
