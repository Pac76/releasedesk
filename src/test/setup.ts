import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

vi.mock("@/lib/i18n/server", () => ({
  getLocale: vi.fn(async () => "en"),
}));

afterEach(() => {
  cleanup();
});

