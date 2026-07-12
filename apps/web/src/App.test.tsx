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
    expect(
      screen.getByRole("link", { name: "View repository" }),
    ).toHaveAttribute("href", "https://github.com/kmehltretter82/scottlab");
  });

  it("reveals Delta and keeps the token distinct from the bottom state", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Look inside" }));

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
      screen.getByRole("button", { name: "Add information" }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("supports the complete observation flow from the keyboard", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.tab();
    expect(screen.getByRole("button", { name: "Look inside" })).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(
      screen.getByRole("button", { name: "Add information" }),
    ).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("button", { name: "Add false token" })).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(
      screen.getByRole("heading", {
        name: "The state now contains the token false.",
      }),
    ).toHaveFocus();
    expect(
      screen.getByRole("figure", {
        name: "State containing the always-present Delta token and the false token",
      }),
    ).toBeVisible();
  });

  it.each(["true", "false"])(
    "builds the validated %s state",
    async (tokenLabel) => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole("button", { name: "Look inside" }));
      await user.click(screen.getByRole("button", { name: "Add information" }));
      await user.click(
        screen.getByRole("button", { name: `Add ${tokenLabel} token` }),
      );

      expect(
        screen.getByRole("figure", {
          name: `State containing the always-present Delta token and the ${tokenLabel} token`,
        }),
      ).toBeVisible();
      expect(
        screen.getByLabelText(`${tokenLabel} token, ${tokenLabel}`),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", {
          name: `The state now contains the token ${tokenLabel}.`,
        }),
      ).toBeVisible();
    },
  );
});
