import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { EmbedWidget } from "./EmbedWidget";

afterEach(() => {
  window.history.replaceState(null, "", window.location.pathname);
});

describe("EmbedWidget", () => {
  it("defaults to the flat Booleans in English", () => {
    render(<EmbedWidget />);

    expect(
      screen.getByRole("heading", { name: "Flat Booleans" }),
    ).toBeVisible();
    const states = screen.getAllByRole("button", { name: /Select state/ });
    expect(states).toHaveLength(3);
  });

  it("shows a requested system in the requested language", async () => {
    window.history.replaceState(null, "", "?system=coquand&lang=de");
    const user = userEvent.setup();
    render(<EmbedWidget />);

    expect(
      screen.getByRole("heading", { name: "Coquand-System" }),
    ).toBeVisible();
    const states = screen.getAllByRole("button", { name: /Zustand .* wählen/ });
    expect(states).toHaveLength(7);

    await user.click(
      screen.getByRole("button", { name: "Zustand {Δ, ε, l, r} wählen" }),
    );
    const detail = screen.getByRole("status");
    expect(within(detail).getByText("{Δ, ε, l, r}")).toBeVisible();
    expect(
      within(detail).getByText(
        "Die Auswahl ist verträglich und unter Folgerung abgeschlossen.",
      ),
    ).toBeVisible();
  });

  it("falls back to the flat Booleans for an unknown system", () => {
    window.history.replaceState(null, "", "?system=not-a-system");
    render(<EmbedWidget />);

    expect(
      screen.getByRole("heading", { name: "Flat Booleans" }),
    ).toBeVisible();
  });
});
