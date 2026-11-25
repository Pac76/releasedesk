import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/login/actions", () => ({
  signInAction: vi.fn(),
  signUpAction: vi.fn(),
}));

import HomePage from "@/app/page";
import LoginPage from "@/app/login/page";

describe("ReleaseDesk public experience", () => {
  it("explains the product with a semantic primary journey", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { level: 1, name: /llegá a cada entrega/i })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /navegación principal/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /crear mi espacio/i })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("progressbar", { name: /82 por ciento completado/i })).toHaveAttribute("aria-valuenow", "82");
  });

  it("presents all four release stages in order", () => {
    render(<HomePage />);

    const stageList = screen.getByRole("list", { name: /etapas de una entrega/i });
    const items = within(stageList).getAllByRole("listitem");

    expect(items).toHaveLength(4);
    expect(items.map((item) => within(item).getByRole("heading", { level: 3 }).textContent)).toEqual([
      "Backlog",
      "En curso",
      "Revisión",
      "Listo",
    ]);
  });

  it("explains when the Supabase connection is still pending", async () => {
    render(await LoginPage({}));

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /tu próxima entrega empieza con una señal clara/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/conexión pendiente/i)).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});

