import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { App } from "./App";

describe("bottom-first lesson screen", () => {
  it("begins with bottom before introducing tokens", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "No specific information yet" }),
    ).toBeVisible();
    expect(
      screen.getByRole("figure", {
        name: "Bottom state: no specific information yet",
      }),
    ).toBeVisible();
    expect(screen.queryByText("Always-present token")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Look inside" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("reveals Delta with the keyboard and keeps token and state distinct", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.tab();
    const inspectButton = screen.getByRole("button", { name: "Look inside" });
    expect(inspectButton).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(
      screen.getByRole("figure", {
        name: "Bottom state containing the always-present Delta token",
      }),
    ).toBeVisible();
    expect(
      screen.getByLabelText("Always-present token, Δ"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "There is always one token inside.",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Close the state" }),
    ).toHaveAttribute("aria-expanded", "true");
  });
});
