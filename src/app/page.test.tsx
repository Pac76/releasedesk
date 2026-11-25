import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/login/actions", () => ({
  signInAction: vi.fn(),
  signUpAction: vi.fn(),
}));

import HomePage from "@/app/page";
import LoginPage from "@/app/login/page";

describe("ReleaseDesk public experience", () => {
  it("explains the product with a semantic primary journey", async () => {
    render(await HomePage());

    expect(screen.getByRole("heading", { level: 1, name: /github signals/i })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /primary navigation/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create my workspace/i })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("list", { name: /repository signals/i })).toBeInTheDocument();
    expect(screen.getByText("acme/checkout")).toBeInTheDocument();
  });

  it("presents all four release stages in order", async () => {
    render(await HomePage());

    const stageList = screen.getByRole("list", { name: /release stages/i });
    const items = within(stageList).getAllByRole("listitem");

    expect(items).toHaveLength(4);
    expect(items.map((item) => within(item).getByRole("heading", { level: 3 }).textContent)).toEqual([
      "Backlog",
      "In progress",
      "Review",
      "Ready",
    ]);
  });

  it("explains when the Supabase connection is still pending", async () => {
    render(await LoginPage({}));

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /your next release starts with a clear signal/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/connection required/i)).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});

