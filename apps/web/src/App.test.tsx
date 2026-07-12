import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { App } from "./App";

describe("bottom-first lesson screen", () => {
  it("begins with bottom before introducing tokens", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "We do not know the Boolean value yet.",
      }),
    ).toBeVisible();
    expect(
      screen.getByText(/A state is all the compatible information/),
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
        name: "A token is one piece of information.",
      }),
    ).toBeVisible();
    expect(
      screen.getByText(/A state collects the tokens that can fit together/),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Add information" }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("explains the Boolean tokens before asking for a choice", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Look inside" }));
    await user.click(screen.getByRole("button", { name: "Add information" }));

    expect(
      screen.getByRole("heading", { name: "Choose one token." }),
    ).toBeVisible();
    expect(
      within(screen.getByRole("button", { name: "Add true token" })).getByText(
        "The observation that the Boolean value is true.",
      ),
    ).toBeVisible();
    expect(
      within(
        screen.getByRole("button", { name: "Add false token" }),
      ).getByText("The observation that the Boolean value is false."),
    ).toBeVisible();
  });

  it("switches the complete lesson to German and remembers the choice", async () => {
    const user = userEvent.setup();
    const rendered = render(<App />);

    expect(screen.getByText("🇬🇧")).toBeVisible();
    expect(screen.getByText("🇩🇪")).toBeVisible();
    expect(screen.getByRole("button", { name: "Choose English" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(screen.getByRole("button", { name: "Choose Deutsch" }));

    expect(document.documentElement).toHaveAttribute("lang", "de-DE");
    expect(document.title).toBe("ScottLab · Beim Bottom beginnen");
    expect(window.localStorage.getItem("scottlab-language")).toBe("de-DE");
    expect(
      screen.getByRole("heading", {
        name: "Wir kennen den booleschen Wert noch nicht.",
      }),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Hineinschauen" }));
    expect(
      screen.getByRole("heading", {
        name: "Ein Token ist ein Stück Information.",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Repository ansehen" }),
    ).toBeVisible();

    rendered.unmount();
    render(<App />);

    expect(
      screen.getByRole("button", { name: "Deutsch wählen" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("heading", {
        name: "Wir kennen den booleschen Wert noch nicht.",
      }),
    ).toBeVisible();
  });

  it("supports the inconsistency attempt entirely from the keyboard", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.tab();
    expect(screen.getByRole("button", { name: "Choose English" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Choose Deutsch" })).toHaveFocus();
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
        name: "Now the Boolean value is known as false.",
      }),
    ).toHaveFocus();
    expect(
      screen.getByRole("figure", {
        name: "State containing the always-present Delta token and the false token",
      }),
    ).toBeVisible();

    await user.tab();
    expect(
      screen.getByRole("button", { name: "Try adding true token" }),
    ).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(
      screen.getByRole("heading", {
        name: "One Boolean value cannot be both true and false.",
      }),
    ).toHaveFocus();
    expect(screen.getByLabelText("Rejected true token")).toBeVisible();
    expect(
      screen.getByLabelText("Conflict witness: false and true"),
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
          name: `Now the Boolean value is known as ${tokenLabel}.`,
        }),
      ).toBeVisible();

      const oppositeLabel = tokenLabel === "true" ? "false" : "true";
      await user.click(
        screen.getByRole("button", {
          name: `Try adding ${oppositeLabel} token`,
        }),
      );

      const unchangedState = screen.getByRole("figure", {
        name: `State containing the always-present Delta token and the ${tokenLabel} token`,
      });
      expect(unchangedState).toBeVisible();
      expect(
        within(unchangedState).queryByLabelText(
          `${oppositeLabel} token, ${oppositeLabel}`,
        ),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("heading", {
          name: "One Boolean value cannot be both true and false.",
        }),
      ).toBeVisible();
      expect(
        screen.getByText(/This system declares the .* tokens incompatible/),
      ).toBeVisible();
      expect(screen.getByText(/This system declares the/)).toHaveTextContent(
        "the only states are {Δ}, {Δ, true}, and {Δ, false}.",
      );
      expect(
        screen.getByLabelText(`Rejected ${oppositeLabel} token`),
      ).toBeVisible();
    },
  );
});
