import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { App } from "./App";

async function beginLesson(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  await user.click(
    screen.getByRole("button", { name: "Explore a first example" }),
  );
  await user.click(
    screen.getByRole("button", { name: "Begin the Boolean model at ⊥" }),
  );
}

describe("ScottLab introduction and bottom-first lesson", () => {
  it("introduces Dana Scott and the purpose of information systems", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "Why Dana Scott introduced information systems",
      }),
    ).toBeVisible();
    expect(screen.getByText(/partial and recursive computation/)).toBeVisible();
    expect(
      screen.getByText(/simpler, constructive way to build and understand/),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Dana Scott at CMU/ }),
    ).toHaveAttribute("href", "https://www.cs.cmu.edu/~scott/");
    expect(
      screen.getByRole("link", {
        name: /Domains for Denotational Semantics \(1982\)/,
      }),
    ).toHaveAttribute("href", "https://doi.org/10.1007/BFb0012801");
    expect(
      screen.getByRole("button", { name: "Explore a first example" }),
    ).toBeVisible();
    expect(screen.queryByRole("figure")).not.toBeInTheDocument();
  });

  it("bridges from Scott's general idea to a Boolean example", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole("button", { name: "Explore a first example" }),
    );

    expect(
      screen.getByRole("heading", { name: "Let’s make the idea concrete." }),
    ).toHaveFocus();
    expect(
      screen.getByText(/Let’s look at the simplest useful example/),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Is the light switched on?" }),
    ).toBeVisible();
    expect(screen.getByText(/is called a Boolean/)).toBeVisible();
    expect(
      screen.getByText(/It is not a third Boolean value/),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Begin the Boolean model at ⊥" }),
    ).toBeVisible();
    expect(screen.queryByRole("figure")).not.toBeInTheDocument();
  });

  it("begins the lesson with bottom before introducing tokens", async () => {
    const user = userEvent.setup();
    render(<App />);
    await beginLesson(user);

    expect(
      screen.getByRole("heading", {
        name: "We do not know the Boolean value yet.",
      }),
    ).toBeVisible();
    expect(
      screen.getByText(/A state is all the compatible information/),
    ).toBeVisible();
    const model = screen.getByRole("complementary", {
      name: "Designed model",
    });
    expect(within(model).getByText("one ordinary Boolean value")).toBeVisible();
    expect(within(model).queryByText("Tokens chosen")).not.toBeInTheDocument();
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
    await beginLesson(user);

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
      screen.getByText(/A state collects the tokens that fit/),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Add information" }),
    ).toHaveAttribute("aria-expanded", "true");
    const model = screen.getByRole("complementary", {
      name: "Designed model",
    });
    expect(within(model).getByText("Tokens chosen")).toBeVisible();
    expect(within(model).getByText("{Δ, false, true}")).toBeVisible();
    expect(within(model).queryByText("Rule declared")).not.toBeInTheDocument();
  });

  it("reveals the model rule and its derived states progressively", async () => {
    const user = userEvent.setup();
    render(<App />);
    await beginLesson(user);

    await user.click(screen.getByRole("button", { name: "Look inside" }));
    await user.click(screen.getByRole("button", { name: "Add information" }));
    await user.click(screen.getByRole("button", { name: "Add true token" }));

    const model = screen.getByRole("complementary", {
      name: "Designed model",
    });
    expect(within(model).getByText("Rule declared")).toBeVisible();
    expect(
      within(model).getByText("{false, true} is incompatible"),
    ).toBeVisible();
    expect(within(model).queryByText("States derived")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Try adding false token" }),
    );

    expect(within(model).getByText("States derived")).toBeVisible();
    expect(
      within(model).getByText(/\{Δ\}.*\{Δ, false\}.*\{Δ, true\}/),
    ).toBeVisible();
    expect(
      screen.getByText(/ScottLab did not infer this from the token names/),
    ).toBeVisible();
  });

  it("explains the Boolean tokens before asking for a choice", async () => {
    const user = userEvent.setup();
    render(<App />);
    await beginLesson(user);

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
    expect(document.title).toBe("ScottLab · Warum Informationssysteme?");
    expect(window.localStorage.getItem("scottlab-language")).toBe("de-DE");
    expect(
      screen.getByRole("heading", {
        name: "Warum Dana Scott Informationssysteme einführte",
      }),
    ).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Ein erstes Beispiel ansehen" }),
    );

    expect(document.title).toBe("ScottLab · Ein erstes Boolean-Modell");
    expect(
      screen.getByRole("heading", { name: "Wie sieht das nun konkret aus?" }),
    ).toBeVisible();
    expect(
      screen.getByText(/Wir wollen uns dazu ein möglichst einfaches Beispiel/),
    ).toBeVisible();

    await user.click(
      screen.getByRole("button", {
        name: "Das Boolean-Modell bei ⊥ beginnen",
      }),
    );

    expect(document.title).toBe("ScottLab · Beim Bottom beginnen");
    expect(
      screen.getByRole("heading", {
        name: "Wir kennen den booleschen Wert noch nicht.",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("complementary", { name: "Entworfenes Modell" }),
    ).toHaveTextContent("einen gewöhnlichen booleschen Wert");

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
        name: "Warum Dana Scott Informationssysteme einführte",
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
    expect(
      screen.getByRole("button", { name: "Explore a first example" }),
    ).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(
      screen.getByRole("heading", { name: "Let’s make the idea concrete." }),
    ).toHaveFocus();
    await user.tab();
    expect(
      screen.getByRole("button", { name: "Begin the Boolean model at ⊥" }),
    ).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(
      screen.getByRole("heading", {
        name: "We do not know the Boolean value yet.",
      }),
    ).toHaveFocus();
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
      await beginLesson(user);

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
        screen.getByText(/ScottLab did not infer this from the token names/),
      ).toBeVisible();
      const model = screen.getByRole("complementary", {
        name: "Designed model",
      });
      expect(within(model).getByText("States derived")).toBeVisible();
      expect(
        within(model).getByText(/\{Δ\}\s+\{Δ, false\}\s+\{Δ, true\}/),
      ).toBeVisible();
      expect(
        screen.getByLabelText(`Rejected ${oppositeLabel} token`),
      ).toBeVisible();
    },
  );
});
