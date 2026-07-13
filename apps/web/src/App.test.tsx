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

async function reachConflict(
  user: ReturnType<typeof userEvent.setup>,
  firstToken = "true",
): Promise<void> {
  await beginLesson(user);
  await user.click(screen.getByRole("button", { name: "Look inside" }));
  await user.click(screen.getByRole("button", { name: "Meet the tokens" }));
  await user.click(
    screen.getByRole("button", { name: `Add ${firstToken} token` }),
  );
  const oppositeToken = firstToken === "true" ? "false" : "true";
  await user.click(
    screen.getByRole("button", {
      name: `Try adding ${oppositeToken} token`,
    }),
  );
}

async function reachChallenge(
  user: ReturnType<typeof userEvent.setup>,
  firstToken = "true",
): Promise<void> {
  await reachConflict(user, firstToken);
  await user.click(
    screen.getByRole("button", { name: "Try a short challenge" }),
  );
}

async function reachInformationOrder(
  user: ReturnType<typeof userEvent.setup>,
  firstToken = "true",
): Promise<void> {
  await reachChallenge(user, firstToken);
  const targetToken = firstToken === "true" ? "false" : "true";
  await user.click(
    screen.getByRole("button", { name: `Add ${targetToken} token` }),
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
    expect(screen.getByText(/symbol is read “bottom”/)).toBeVisible();
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
    expect(screen.getByText(/least informative state/)).toBeVisible();
    expect(screen.queryByText("Begin here")).not.toBeInTheDocument();
    const model = screen.getByRole("complementary", {
      name: "Designed model",
    });
    expect(within(model).getByText("one ordinary Boolean value")).toBeVisible();
    expect(within(model).queryByText("Tokens chosen")).not.toBeInTheDocument();
    expect(
      screen.getByRole("figure", {
        name: "Bottom state: no observations yet",
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

  it("opens bottom as an empty collection of observations", async () => {
    const user = userEvent.setup();
    render(<App />);
    await beginLesson(user);

    await user.click(screen.getByRole("button", { name: "Look inside" }));

    expect(
      screen.getByRole("figure", {
        name: "Bottom state containing no observations",
      }),
    ).toBeVisible();
    expect(
      screen.getByLabelText("Empty collection: no observations in this state"),
    ).toBeVisible();
    expect(screen.getByText("∅")).toBeVisible();
    expect(screen.queryByText("Δ")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "This state contains no observations.",
      }),
    ).toBeVisible();
    expect(
      screen.getByText(/Here that collection is empty/),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Meet the tokens" }),
    ).toHaveAttribute("aria-expanded", "true");
    const model = screen.getByRole("complementary", {
      name: "Designed model",
    });
    expect(within(model).queryByText("Tokens chosen")).not.toBeInTheDocument();
    expect(within(model).queryByText("Rule declared")).not.toBeInTheDocument();
  });

  it("reveals the model rule and its derived states progressively", async () => {
    const user = userEvent.setup();
    render(<App />);
    await beginLesson(user);

    await user.click(screen.getByRole("button", { name: "Look inside" }));
    await user.click(screen.getByRole("button", { name: "Meet the tokens" }));
    await user.click(screen.getByRole("button", { name: "Add true token" }));

    const model = screen.getByRole("complementary", {
      name: "Designed model",
    });
    expect(within(model).getByText("Tokens chosen")).toBeVisible();
    expect(within(model).getByText("{false, true}")).toBeVisible();
    expect(within(model).getByText("Rule declared")).toBeVisible();
    expect(
      within(model).getByText("{false, true} is incompatible"),
    ).toBeVisible();
    expect(within(model).queryByText("States derived")).not.toBeInTheDocument();
    const oppositeQuestion =
      "Test the model's declared rule: can both observations belong to one Boolean state?";
    const ruleTest = screen.getByRole("group", { name: oppositeQuestion });
    expect(
      within(ruleTest).getByText(oppositeQuestion, { selector: "p" }),
    ).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Try adding false token" }),
    );

    expect(within(model).getByText("States derived")).toBeVisible();
    expect(
      within(model).getByText(/∅.*\{false\}.*\{true\}/),
    ).toBeVisible();
    expect(
      screen.getByText(/ScottLab did not infer this from the token names/),
    ).toBeVisible();
  });

  it("turns the experiment into the computed information order", async () => {
    const user = userEvent.setup();
    render(<App />);
    await reachInformationOrder(user);

    expect(
      screen.getByRole("heading", {
        name: "Good — that was correct.",
      }),
    ).toHaveFocus();
    expect(
      screen.getByRole("heading", {
        name: "Three states, ordered by information.",
      }),
    ).toBeVisible();
    expect(
      screen.getByText(/Moving upward means gaining information/),
    ).toBeVisible();

    const order = screen.getByRole("region", {
      name: "Information order of the three Boolean states",
    });
    const bottomNode = within(order).getByRole("button", {
      name: "Inspect state ⊥, shown as ∅: no observations",
    });
    const falseNode = within(order).getByRole("button", {
      name: "Inspect state {false}: the Boolean answer is false",
    });
    const trueNode = within(order).getByRole("button", {
      name: "Inspect state {true}: the Boolean answer is true",
    });

    expect(bottomNode).toHaveAttribute("aria-pressed", "false");
    expect(falseNode).toHaveAttribute("aria-pressed", "true");
    expect(trueNode).toHaveAttribute("aria-pressed", "false");
    expect(within(order).queryByText("Δ")).not.toBeInTheDocument();

    await user.click(within(order).getByText("Read the diagram as text"));
    expect(
      within(order).getByText("⊥ (∅) is directly below {false}."),
    ).toBeVisible();
    expect(
      within(order).getByText("⊥ (∅) is directly below {true}."),
    ).toBeVisible();
  });

  it("raises the level and reveals Scott's explicit Delta convention", async () => {
    const user = userEvent.setup();
    render(<App />);
    await reachInformationOrder(user);

    expect(screen.queryByText("Δ")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Use the explicit convention" }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Now reveal the complete information system.",
      }),
    ).toHaveFocus();
    expect(document.title).toBe("ScottLab · The formal Boolean system");
    expect(
      screen.getByRole("heading", { name: "Δ is a token. ⊥ is a state." }),
    ).toBeVisible();
    expect(
      screen.getByLabelText("Delta, the always-present token"),
    ).toBeVisible();
    expect(
      screen.getByLabelText("least state: ⊥ = {Δ}"),
    ).toBeVisible();
    expect(screen.getByText("A = (T, Δ, Con, ⊢)")).toBeVisible();
    expect(screen.getByText("T = {Δ, false, true}")).toBeVisible();
    expect(screen.getByText("{false, true} ∉ Con")).toBeVisible();
    expect(
      screen.getByText("X ⊢ a ⇔ a = Δ or a ∈ X"),
    ).toBeVisible();
    expect(screen.getByText("∅ ⊢ Δ")).toBeVisible();
    expect(
      screen.getByText(
        /The empty set is consistent—not contradictory.*Closure adds Δ/,
      ),
    ).toBeVisible();

    const stateTable = screen.getByRole("table");
    expect(within(stateTable).getByText("∅")).toBeVisible();
    expect(within(stateTable).getByText("{Δ}")).toBeVisible();
    expect(within(stateTable).getByText("{Δ, false}")).toBeVisible();
    expect(within(stateTable).getByText("{Δ, true}")).toBeVisible();

    await user.click(
      screen.getByRole("button", {
        name: "Back to the introductory diagram",
      }),
    );
    expect(
      screen.getByRole("region", {
        name: "Information order of the three Boolean states",
      }),
    ).toBeVisible();
    expect(screen.queryByText("Δ")).not.toBeInTheDocument();
  });

  it("translates the explicit formal view without duplicating its model", async () => {
    const user = userEvent.setup();
    render(<App />);
    await reachInformationOrder(user);
    await user.click(
      screen.getByRole("button", { name: "Use the explicit convention" }),
    );

    await user.click(screen.getByRole("button", { name: "Choose Deutsch" }));

    expect(document.documentElement.lang).toBe("de-DE");
    expect(
      screen.getByRole("heading", {
        name: "Nun legen wir das vollständige Informationssystem offen.",
      }),
    ).toBeVisible();
    expect(
      screen.getByLabelText("Delta, das stets vorhandene Token"),
    ).toBeVisible();
    expect(screen.getByText("T = {Δ, false, true}")).toBeVisible();
    expect(
      screen.getByText(/Die leere Menge ist verträglich.*Abschluss fügt Δ/),
    ).toBeVisible();
    expect(screen.getAllByRole("row")).toHaveLength(4);
  });

  it("supports inspecting the order with arrow keys", async () => {
    const user = userEvent.setup();
    render(<App />);
    await reachInformationOrder(user);

    const order = screen.getByRole("region", {
      name: "Information order of the three Boolean states",
    });
    const bottomNode = within(order).getByRole("button", {
      name: "Inspect state ⊥, shown as ∅: no observations",
    });
    const falseNode = within(order).getByRole("button", {
      name: "Inspect state {false}: the Boolean answer is false",
    });
    const trueNode = within(order).getByRole("button", {
      name: "Inspect state {true}: the Boolean answer is true",
    });

    await user.click(bottomNode);
    expect(bottomNode).toHaveAttribute("aria-pressed", "true");
    expect(
      within(order).getByText(/At ⊥, the visible collection is ∅/),
    ).toBeVisible();

    await user.keyboard("{ArrowUp}");
    expect(falseNode).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(falseNode).toHaveAttribute("aria-pressed", "true");
    expect(
      within(order).getByText(
        /The state \{false\} contains one observation/,
      ),
    ).toBeVisible();

    await user.keyboard("{ArrowRight}");
    expect(trueNode).toHaveFocus();
    await user.keyboard(" ");
    expect(trueNode).toHaveAttribute("aria-pressed", "true");

    await user.keyboard("{ArrowDown}");
    expect(bottomNode).toHaveFocus();
  });

  it("translates the challenge and its information-order reward", async () => {
    const user = userEvent.setup();
    render(<App />);
    await reachConflict(user);

    await user.click(screen.getByRole("button", { name: "Choose Deutsch" }));

    await user.click(
      screen.getByRole("button", { name: "Eine kurze Aufgabe lösen" }),
    );
    expect(
      screen.getByRole("heading", {
        name: "Deine Aufgabe: Sorge dafür, dass das Licht sicher ausgeschaltet ist.",
      }),
    ).toBeVisible();
    expect(
      screen.getByText(
        "Zuvor hast du {true} gebaut. Diese Aufgabe knüpft an diese Wahl an: Beginne wieder bei ⊥ und baue den anderen möglichen Zustand {false}.",
      ),
    ).toBeVisible();
    expect(
      screen.getByRole("complementary", {
        name: "Formales Ziel: {false}",
      }),
    ).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "false-Token hinzufügen" }),
    );

    expect(
      screen.getByRole("heading", { name: "Gut – das war richtig." }),
    ).toHaveFocus();
    expect(
      screen.getByRole("heading", {
        name: "Drei Zustände, nach Information geordnet.",
      }),
    ).toBeVisible();
    const order = screen.getByRole("region", {
      name: "Informationsordnung der drei booleschen Zustände",
    });
    expect(
      within(order).getByRole("button", {
        name: "Zustand untersuchen: {false}: Die boolesche Antwort ist false",
      }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(within(order).getByText("Ausgewählter Zustand")).toBeVisible();
  });

  it.each([
    { firstToken: "true", targetToken: "false", targetMeaning: "off" },
    { firstToken: "false", targetToken: "true", targetMeaning: "on" },
  ])(
    "challenges the learner to build $targetToken after $firstToken",
    async ({ firstToken, targetToken, targetMeaning }) => {
      const user = userEvent.setup();
      render(<App />);
      await reachChallenge(user, firstToken);

      expect(
        screen.getByRole("heading", {
          name: `Your turn: make the light definitely ${targetMeaning}.`,
        }),
      ).toHaveFocus();
      expect(
        screen.getByText(
          `Earlier, you built {${firstToken}}. This challenge uses that choice: start again at ⊥ and build the other possible state, {${targetToken}}.`,
        ),
      ).toBeVisible();
      expect(
        screen.getByRole("figure", {
          name: "Bottom state containing no observations",
        }),
      ).toBeVisible();
      expect(
        screen.getByRole("complementary", {
          name: `Formal target: {${targetToken}}`,
        }),
      ).toBeVisible();
      const model = screen.getByRole("complementary", {
        name: "Designed model",
      });
      expect(within(model).getByText("States derived")).toBeVisible();
      expect(screen.queryByText("Δ")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("region", {
          name: "Information order of the three Boolean states",
        }),
      ).not.toBeInTheDocument();

      await user.click(
        screen.getByRole("button", { name: `Add ${targetToken} token` }),
      );

      expect(
        screen.getByRole("heading", {
          name: "Good — that was correct.",
        }),
      ).toHaveFocus();
      expect(
        screen.getByRole("heading", {
          name: "Three states, ordered by information.",
        }),
      ).toBeVisible();
      const order = screen.getByRole("region", {
        name: "Information order of the three Boolean states",
      });
      expect(
        within(order).getByRole("button", {
          name: `Inspect state {${targetToken}}: the Boolean answer is ${targetToken}`,
        }),
      ).toHaveAttribute("aria-pressed", "true");
      expect(
        screen.getByText(
          new RegExp(
            `added the ${targetToken} token and built \\{${targetToken}\\}`,
          ),
        ),
      ).toBeVisible();
      expect(
        screen.queryByRole("button", { name: "Try a short challenge" }),
      ).not.toBeInTheDocument();
    },
  );

  it("shows an incorrect branch honestly and supports a keyboard retry", async () => {
    const user = userEvent.setup();
    render(<App />);
    await reachConflict(user);

    const startChallengeButton = screen.getByRole("button", {
      name: "Try a short challenge",
    });
    startChallengeButton.focus();
    await user.keyboard("{Enter}");

    const wrongToken = screen.getByRole("button", { name: "Add true token" });
    wrongToken.focus();
    await user.keyboard("{Enter}");

    expect(
      screen.getByRole("heading", { name: "That builds {true}." }),
    ).toHaveFocus();
    expect(
      screen.getByRole("figure", { name: "State containing the true token" }),
    ).toBeVisible();
    expect(screen.getByText(/challenge asks for off/)).toBeVisible();

    const retry = screen.getByRole("button", {
      name: "Return to ⊥ and try again",
    });
    retry.focus();
    await user.keyboard("{Enter}");

    expect(
      screen.getByRole("figure", {
        name: "Bottom state containing no observations",
      }),
    ).toBeVisible();
    const correctToken = screen.getByRole("button", {
      name: "Add false token",
    });
    correctToken.focus();
    await user.keyboard("{Enter}");

    expect(
      screen.getByRole("heading", {
        name: "Good — that was correct.",
      }),
    ).toHaveFocus();
  });

  it("explains the Boolean tokens before asking for a choice", async () => {
    const user = userEvent.setup();
    render(<App />);
    await beginLesson(user);

    await user.click(screen.getByRole("button", { name: "Look inside" }));
    await user.click(screen.getByRole("button", { name: "Meet the tokens" }));

    expect(
      screen.getByRole("heading", {
        name: "A token is one piece of information.",
      }),
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
      screen.getByText(/Das Symbol ⊥ spricht man hier „Bottom“ aus/),
    ).toBeVisible();
    expect(
      screen.getByRole("complementary", { name: "Entworfenes Modell" }),
    ).toHaveTextContent("einen gewöhnlichen booleschen Wert");

    await user.click(screen.getByRole("button", { name: "Hineinschauen" }));
    expect(
      screen.getByRole("heading", {
        name: "Dieser Zustand enthält keine Beobachtungen.",
      }),
    ).toBeVisible();
    expect(
      screen.getByLabelText(
        "Leere Menge: keine Beobachtungen in diesem Zustand",
      ),
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
      screen.getByRole("button", { name: "Meet the tokens" }),
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
        name: "State containing the false token",
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
      await user.click(screen.getByRole("button", { name: "Meet the tokens" }));
      await user.click(
        screen.getByRole("button", { name: `Add ${tokenLabel} token` }),
      );

      const stateFigure = screen.getByRole("figure", {
        name: `State containing the ${tokenLabel} token`,
      });
      expect(stateFigure).toBeVisible();
      expect(
        within(stateFigure).getByLabelText(`${tokenLabel} token`),
      ).toBeInTheDocument();
      expect(within(stateFigure).getAllByText(tokenLabel)).toHaveLength(1);
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
        name: `State containing the ${tokenLabel} token`,
      });
      expect(unchangedState).toBeVisible();
      expect(
        within(unchangedState).queryByLabelText(
          `${oppositeLabel} token`,
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
        within(model).getByText(/∅\s+\{false\}\s+\{true\}/),
      ).toBeVisible();
      const rejectedToken = screen.getByLabelText(
        `Rejected ${oppositeLabel} token`,
      );
      expect(rejectedToken).toBeVisible();
      expect(unchangedState).not.toContainElement(rejectedToken);
      expect(rejectedToken.closest(".lesson-guidance")).not.toBeNull();

      await user.click(
        screen.getByRole("button", { name: "Try a short challenge" }),
      );
      await user.click(
        screen.getByRole("button", {
          name: `Add ${oppositeLabel} token`,
        }),
      );
      const order = screen.getByRole("region", {
        name: "Information order of the three Boolean states",
      });
      expect(
        within(order).getByRole("button", {
          name: `Inspect state {${oppositeLabel}}: the Boolean answer is ${oppositeLabel}`,
        }),
      ).toHaveAttribute("aria-pressed", "true");
    },
  );
});
