import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { App } from "./App";

async function openOrigins(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  await user.click(
    screen.getByRole("button", { name: "Where does this idea come from?" }),
  );
}

async function reachConflict(
  user: ReturnType<typeof userEvent.setup>,
  firstToken = "true",
): Promise<void> {
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

async function reachFormalisation(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  await reachInformationOrder(user);
  await user.click(
    screen.getByRole("button", { name: "Use the explicit convention" }),
  );
}

async function reachFormalisationSummary(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  await reachFormalisation(user);
  for (let page = 1; page < 4; page += 1) {
    await user.click(screen.getByRole("button", { name: "Next" }));
  }
}

async function reachEntailmentLesson(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  await reachFormalisationSummary(user);
  await user.click(
    screen.getByRole("button", { name: "Continue to entailment" }),
  );
}

async function reachStatesLesson(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  await reachEntailmentLesson(user);
  await user.click(
    screen.getByRole("button", {
      name: "Add the administrator premise",
    }),
  );
  await user.click(
    screen.getByRole("button", { name: "Show the complete closure" }),
  );
  await user.click(screen.getByRole("button", { name: "Choose may view" }));
  await user.click(
    screen.getByRole("button", { name: "Continue to states" }),
  );
}

async function reachMapsLesson(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  await reachStatesLesson(user);
  await user.click(
    screen.getByRole("button", {
      name: "Complete this selection with closure",
    }),
  );
  await user.click(
    screen.getByRole("button", { name: "Repair it yourself" }),
  );
  await user.click(
    screen.getByRole("button", { name: "Add may edit token" }),
  );
  await user.click(
    screen.getByRole("button", { name: "Continue to continuous maps" }),
  );
}

describe("ScottLab introduction and bottom-first lesson", () => {
  it("introduces Dana Scott and the purpose of information systems", async () => {
    const user = userEvent.setup();
    render(<App />);
    await openOrigins(user);

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
    expect(
      screen.getByRole("button", { name: "Back to the lesson" }),
    ).toBeVisible();
    expect(screen.queryByRole("figure")).not.toBeInTheDocument();
  });

  it("lands hands-on at bottom with the origins one step away", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "We do not know the Boolean value yet.",
      }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Look inside" })).toBeVisible();

    await openOrigins(user);
    expect(
      screen.getByRole("heading", {
        name: "Why Dana Scott introduced information systems",
      }),
    ).toHaveFocus();

    await user.click(
      screen.getByRole("button", { name: "Back to the lesson" }),
    );
    expect(
      screen.getByRole("heading", {
        name: "We do not know the Boolean value yet.",
      }),
    ).toHaveFocus();
  });

  it("uses the brand and footer as explicit lesson navigation", async () => {
    const user = userEvent.setup();
    render(<App />);

    const lessonLocation = screen.getByRole("navigation", {
      name: "Lesson location",
    });
    expect(
      within(lessonLocation).getByRole("button", {
        name: "Restart Flat Booleans",
      }),
    ).toBeVisible();
    expect(lessonLocation).toHaveTextContent(
      "Current step: First observation",
    );

    await openOrigins(user);
    expect(lessonLocation).toHaveTextContent("Current step: Introduction");
    await user.click(
      screen.getByRole("button", { name: "Return to the ScottLab start" }),
    );
    expect(
      screen.getByRole("heading", {
        name: "We do not know the Boolean value yet.",
      }),
    ).toHaveFocus();

    await openOrigins(user);
    await user.click(
      within(lessonLocation).getByRole("button", {
        name: "Restart Flat Booleans",
      }),
    );
    expect(
      screen.getByRole("heading", {
        name: "We do not know the Boolean value yet.",
      }),
    ).toHaveFocus();
  });

  it("bridges from Scott's general idea to a Boolean example", async () => {
    const user = userEvent.setup();
    render(<App />);
    await openOrigins(user);

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

  it("begins the lesson with bottom before introducing tokens", () => {
    render(<App />);
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
        name: "Δ is a token. ⊥ is a state.",
      }),
    ).toHaveFocus();
    expect(document.title).toBe("ScottLab · The formal Boolean system");
    expect(screen.getByText("Part 1 of 4")).toBeVisible();
    expect(
      screen.getByLabelText("Delta, the always-present token"),
    ).toBeVisible();
    expect(
      screen.getByLabelText("least state: ⊥ = {Δ}"),
    ).toBeVisible();
    expect(screen.queryByText("A = (T, Δ, Con, ⊢)")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(
      screen.getByRole("heading", { name: "The four ingredients" }),
    ).toHaveFocus();
    expect(screen.getByText("Part 2 of 4")).toBeVisible();
    expect(screen.getByText("A = (T, Δ, Con, ⊢)")).toBeVisible();
    expect(screen.getByText("T = {Δ, false, true}")).toBeVisible();
    expect(screen.getByText("{false, true} ∉ Con")).toBeVisible();
    expect(
      screen.getByText("X ⊢ a ⇔ a = Δ or a ∈ X"),
    ).toBeVisible();
    expect(screen.queryByText("∅ ⊢ Δ")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(
      screen.getByRole("heading", { name: "Why Δ appears at bottom" }),
    ).toHaveFocus();
    expect(screen.getByText("Part 3 of 4")).toBeVisible();
    expect(screen.getByText("∅ ⊢ Δ")).toBeVisible();
    expect(
      screen.getByText(
        /The empty set is consistent—not contradictory.*Closure adds Δ/,
      ),
    ).toBeVisible();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(
      screen.getByRole("heading", {
        name: "The same three states, written explicitly",
      }),
    ).toHaveFocus();
    expect(screen.getByText("Part 4 of 4")).toBeVisible();

    const stateTable = screen.getByRole("table");
    expect(within(stateTable).getByText("∅")).toBeVisible();
    expect(within(stateTable).getByText("{Δ}")).toBeVisible();
    expect(within(stateTable).getByText("{Δ, false}")).toBeVisible();
    expect(within(stateTable).getByText("{Δ, true}")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(
      screen.getByRole("heading", { name: "Why Δ appears at bottom" }),
    ).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Previous" }));
    await user.click(screen.getByRole("button", { name: "Previous" }));
    await user.click(
      screen.getByRole("button", { name: "Back to the introductory diagram" }),
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
        name: "Δ ist ein Token. ⊥ ist ein Zustand.",
      }),
    ).toBeVisible();
    expect(
      screen.getByLabelText("Delta, das stets vorhandene Token"),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Weiter" }));
    expect(
      screen.getByRole("heading", { name: "Die vier Bestandteile" }),
    ).toHaveFocus();
    expect(screen.getByText("T = {Δ, false, true}")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Weiter" }));
    expect(
      screen.getByText(/Die leere Menge ist verträglich.*Abschluss fügt Δ/),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Weiter" }));
    expect(screen.getAllByRole("row")).toHaveLength(4);
  });

  it("opens the same Boolean system in a synchronized read-only sandbox", async () => {
    const user = userEvent.setup();
    render(<App />);
    await reachFormalisationSummary(user);

    await user.click(
      screen.getByRole("button", { name: "Open the read-only sandbox" }),
    );

    expect(window.location.hash).toBe("#/sandbox/flat-boolean");
    expect(document.title).toBe("ScottLab · Flat Booleans sandbox preview");
    expect(
      screen.getByRole("heading", {
        name: "Explore the same system without the lesson rails.",
      }),
    ).toHaveFocus();
    expect(
      screen.getByRole("group", {
        name: "Flat Booleans read-only sandbox workspace",
      }),
    ).toBeVisible();

    const diagram = screen.getByRole("region", {
      name: "Formal information order of the flat-Boolean states",
    });
    const falseNode = within(diagram).getByRole("button", {
      name: "Inspect state {Δ, false}: the Boolean answer is false",
    });
    const trueNode = within(diagram).getByRole("button", {
      name: "Inspect state {Δ, true}: the Boolean answer is true",
    });
    expect(falseNode).toHaveAttribute("aria-pressed", "true");

    const bottomNode = within(diagram).getByRole("button", {
      name: "Inspect state ⊥ = {Δ}: no specific Boolean answer",
    });
    bottomNode.focus();
    await user.keyboard("{ArrowUp}");
    expect(falseNode).toHaveFocus();

    const tray = screen.getByRole("region", { name: "Experiment tray" });
    const definition = screen.getByRole("region", {
      name: "Definition panel",
    });
    const explanation = screen.getByRole("region", {
      name: "Explanation panel",
    });
    expect(within(definition).getByText("Locked")).toBeVisible();
    expect(
      within(definition).getByText(/Editing arrives in a later milestone/),
    ).toBeVisible();

    await user.click(
      within(tray).getByRole("button", { name: "Select state {Δ, true}" }),
    );

    expect(trueNode).toHaveAttribute("aria-pressed", "true");
    expect(falseNode).toHaveAttribute("aria-pressed", "false");
    expect(within(tray).getByLabelText("true token")).toBeVisible();
    expect(within(definition).getByText("{Δ, true}")).toBeVisible();
    expect(
      within(explanation).getByText(/adds the true observation to Δ/),
    ).toBeVisible();
    expect(
      within(explanation).getByText(
        "The selected observation entails itself: true.",
      ),
    ).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Explanation" }),
    );
    expect(explanation).toHaveFocus();

    await user.click(
      screen.getByRole("button", { name: "Back to the focused lesson" }),
    );
    expect(window.location.hash).toBe("#/lesson");
    expect(
      screen.getByRole("heading", {
        name: "The same three states, written explicitly",
      }),
    ).toHaveFocus();
  });

  it("supports a safe direct link to the sandbox and a lesson restart", async () => {
    window.history.replaceState(null, "", "#/sandbox/flat-boolean");
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "Explore the same system without the lesson rails.",
      }),
    ).toHaveFocus();
    const diagram = screen.getByRole("region", {
      name: "Formal information order of the flat-Boolean states",
    });
    expect(
      within(diagram).getByRole("button", {
        name: "Inspect state ⊥ = {Δ}: no specific Boolean answer",
      }),
    ).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Restart lesson" }));

    expect(window.location.hash).toBe("#/lesson");
    expect(
      screen.getByRole("heading", {
        name: "We do not know the Boolean value yet.",
      }),
    ).toBeVisible();
  });

  it("canonicalizes malformed hashes during browser navigation", () => {
    render(<App />);

    window.history.replaceState(null, "", "#/sandbox/not-supported");
    window.dispatchEvent(new HashChangeEvent("hashchange"));

    expect(window.location.hash).toBe("#/lesson");
    expect(
      screen.getByRole("heading", {
        name: "We do not know the Boolean value yet.",
      }),
    ).toBeVisible();
  });

  it("iterates two endomaps to their least fixed points and answers take 3", async () => {
    window.history.replaceState(null, "", "#/lesson/fixed-points");
    const user = userEvent.setup();
    render(<App />);

    expect(document.title).toBe("ScottLab · Least fixed points");
    expect(
      screen.getByRole("heading", {
        name: "Recursion is repeated application from ⊥.",
      }),
    ).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Start at ⊥ and iterate" }),
    );
    expect(screen.getByText("Application 0 of 4")).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Everything starts at ⊥." }),
    ).toBeVisible();

    const applyButton = screen.getByRole("button", { name: /Apply the map/ });
    await user.click(applyButton);
    expect(
      screen.getByRole("heading", { name: "The state learns {≥1}." }),
    ).toBeVisible();
    await user.click(applyButton);
    await user.click(applyButton);
    await user.click(applyButton);

    expect(screen.getByText("Application 4 of 4")).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: "Nothing new: the iteration has stabilized.",
      }),
    ).toBeVisible();
    expect(screen.getByText("nothing — the state repeats")).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Continue to streams" }),
    );
    expect(
      screen.getByText(/Phase 2 · Streams: ones = 1 : ones/),
    ).toBeVisible();

    const applyStream = screen.getByRole("button", { name: /Apply the map/ });
    for (let application = 0; application < 4; application += 1) {
      await user.click(applyStream);
    }
    expect(
      screen.getByRole("heading", {
        name: "Nothing new: the iteration has stabilized.",
      }),
    ).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Try the take 3 challenge" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Choose the starts with 11 token" }),
    );
    expect(screen.getByText("Not quite.")).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Choose the starts with 111 token" }),
    );
    expect(
      screen.getByText("Right — three tokens of information suffice."),
    ).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Finish the lesson" }),
    );
    expect(
      screen.getByRole("heading", {
        name: "You computed two least fixed points.",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Not every map climbs." }),
    ).toBeVisible();
    expect(screen.getByText("not(⊥) = ⊥")).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Back to continuous maps" }),
    );
    expect(window.location.hash).toBe("#/lesson/maps");
  });

  it("solves the take-away game by iterated retrograde analysis", async () => {
    window.history.replaceState(null, "", "#/lesson/games");
    const user = userEvent.setup();
    render(<App />);

    expect(document.title).toBe("ScottLab · Winning is entailment");
    expect(
      screen.getByRole("heading", { name: "Winning is entailment." }),
    ).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Start the analysis at ⊥" }),
    );
    expect(
      screen.getByRole("heading", { name: "At ⊥, no position is labeled." }),
    ).toBeVisible();

    const applyButton = screen.getByRole("button", {
      name: /Apply the analysis/,
    });
    await user.click(applyButton);
    expect(
      screen.getByRole("heading", { name: "The analysis proves {L0}." }),
    ).toBeVisible();
    await user.click(applyButton);
    expect(
      screen.getByRole("heading", {
        name: "The analysis proves {W1, W2}.",
      }),
    ).toBeVisible();
    await user.click(applyButton);
    await user.click(applyButton);
    await user.click(applyButton);

    expect(
      screen.getByRole("heading", {
        name: "Every provable label is proved.",
      }),
    ).toBeVisible();
    expect(
      screen.getByText(/what the fixed point does not contain/),
    ).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Play the winning move" }),
    );
    await user.click(screen.getByRole("button", { name: "Take 2 stones" }));
    expect(
      screen.getByText("That hands your opponent a win."),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Take 1 stone" }));
    expect(screen.getByText("Right — leave 3 stones.")).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Finish the lesson" }),
    );
    expect(
      screen.getByRole("heading", {
        name: "You solved a game with a least fixed point.",
      }),
    ).toBeVisible();
    expect(
      screen.getByText("The same mathematics, elsewhere"),
    ).toBeVisible();
    expect(
      screen.getByText("Coherent information systems (Minlog, TCF)"),
    ).toBeVisible();
    expect(
      screen.getByText("Coherence spaces and linear logic"),
    ).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Back to fixed points" }),
    );
    expect(window.location.hash).toBe("#/lesson/fixed-points");
  });

  it("opens a shared sandbox selection and keeps the share URL current", async () => {
    window.history.replaceState(null, "", "#/sandbox/flat-boolean/delta.true");
    const user = userEvent.setup();
    render(<App />);

    const tray = screen.getByRole("region", { name: "Experiment tray" });
    expect(
      within(tray).getByRole("button", { name: "Select state {Δ, true}" }),
    ).toHaveAttribute("aria-pressed", "true");

    await user.click(
      within(tray).getByRole("button", { name: "Select state {Δ, false}" }),
    );
    expect(window.location.hash).toBe("#/sandbox/flat-boolean/delta.false");

    await user.click(
      within(tray).getByRole("button", { name: "Select state ⊥ = {Δ}" }),
    );
    expect(window.location.hash).toBe("#/sandbox/flat-boolean");
  });

  it("canonicalizes a shared selection that is not a real state", () => {
    window.history.replaceState(
      null,
      "",
      "#/sandbox/flat-boolean/true.false",
    );
    render(<App />);

    expect(window.location.hash).toBe("#/sandbox/flat-boolean");
    const tray = screen.getByRole("region", { name: "Experiment tray" });
    expect(
      within(tray).getByRole("button", { name: "Select state ⊥ = {Δ}" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("browses the gallery, quizzes a verdict, and imports a system", async () => {
    window.history.replaceState(null, "", "#/gallery");
    const user = userEvent.setup();
    render(<App />);

    expect(document.title).toBe("ScottLab · Example gallery");
    expect(
      screen.getByRole("heading", {
        name: "Every example system, side by side.",
      }),
    ).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Open Coquand system" }),
    );
    expect(window.location.hash).toBe("#/gallery/coquand");
    expect(
      screen.getByText("7 states, ordered by inclusion."),
    ).toBeVisible();
    expect(screen.getByText("{l, r} ⊢ ε")).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Select state {Δ, l}" }),
    );
    expect(screen.getByText("{Δ, l} ⊑ {Δ, ε, l}")).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Draw a selection" }),
    );
    expect(screen.getByText("Selection")).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Back to the gallery" }),
    );
    expect(window.location.hash).toBe("#/gallery");

    const importField = screen.getByLabelText("System JSON");
    await user.click(importField);
    await user.paste(
      JSON.stringify({
        schemaVersion: "1",
        kind: "information-system",
        convention: "scott-1982-distinguished-token",
        id: "tiny-import",
        title: "Tiny import",
        description: "A one-observation import.",
        approximation: { kind: "exact" },
        tokens: [
          {
            id: "delta",
            label: "Always-present token",
            symbol: "Δ",
            description: "The distinguished token present in every state.",
          },
          {
            id: "ping",
            label: "ping",
            description: "The single observation.",
          },
        ],
        delta: "delta",
        minimalInconsistentSets: [],
        entailmentRules: [],
      }),
    );
    await user.click(
      screen.getByRole("button", { name: "Validate and import" }),
    );

    expect(window.location.hash).toBe("#/gallery/tiny-import");
    expect(
      screen.getByRole("heading", { name: "Tiny import" }),
    ).toBeVisible();
    expect(
      screen.getByText("2 states, ordered by inclusion."),
    ).toBeVisible();
    expect(
      window.localStorage.getItem("scottlab.gallery.imported.v1"),
    ).toContain("tiny-import");
  });

  it("reaches the current lesson's system in the gallery from the footer", async () => {
    window.history.replaceState(null, "", "#/lesson/states");
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole("button", {
        name: "Explore this system in the gallery",
      }),
    );
    expect(window.location.hash).toBe("#/gallery/editing-policy");
    expect(
      screen.getByRole("heading", { name: "Editing policy" }),
    ).toBeVisible();
    expect(screen.getByText("{administrator} ⊢ may edit")).toBeVisible();
  });

  it("rejects a semantically invalid gallery import with a witness", async () => {
    window.history.replaceState(null, "", "#/gallery");
    const user = userEvent.setup();
    render(<App />);

    const importField = screen.getByLabelText("System JSON");
    await user.click(importField);
    await user.paste(
      JSON.stringify({
        schemaVersion: "1",
        kind: "information-system",
        convention: "scott-1982-distinguished-token",
        id: "broken-import",
        title: "Broken import",
        description: "Entailment breaks consistency.",
        approximation: { kind: "exact" },
        tokens: [
          {
            id: "a",
            label: "a",
            description: "First observation.",
          },
          {
            id: "b",
            label: "b",
            description: "Second observation.",
          },
          {
            id: "delta",
            label: "Always-present token",
            symbol: "Δ",
            description: "The distinguished token present in every state.",
          },
        ],
        delta: "delta",
        minimalInconsistentSets: [["a", "b"]],
        entailmentRules: [
          { id: "a-entails-b", premises: ["a"], conclusion: "b" },
        ],
      }),
    );
    await user.click(
      screen.getByRole("button", { name: "Validate and import" }),
    );

    expect(window.location.hash).toBe("#/gallery");
    expect(
      screen.getByText(/violates the information-system laws/),
    ).toBeVisible();
    expect(
      window.localStorage.getItem("scottlab.gallery.imported.v1") ?? "",
    ).not.toContain("broken-import");
  });

  it("derives a concept-table import whose states are the intents", async () => {
    window.history.replaceState(null, "", "#/gallery");
    const user = userEvent.setup();
    render(<App />);

    const fcaField = screen.getByLabelText("Cross-table CSV");
    await user.click(fcaField);
    await user.paste(
      ["object,wings,flies", "sparrow,x,x", "penguin,x,", "cat,,"].join("\n"),
    );
    await user.click(
      screen.getByRole("button", { name: "Derive and import" }),
    );

    expect(
      screen.getByRole("heading", { name: "Imported concept table" }),
    ).toBeVisible();
    // Intents of the table: {}, {wings}, {wings, flies} — plus Δ everywhere.
    expect(
      screen.getByText("3 states, ordered by inclusion."),
    ).toBeVisible();
  });

  it("restores lesson progress after a reload", async () => {
    const user = userEvent.setup();
    const rendered = render(<App />);
    await reachInformationOrder(user);
    expect(
      screen.getByRole("heading", { name: "Good — that was correct." }),
    ).toBeVisible();

    rendered.unmount();
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Good — that was correct." }),
    ).toBeVisible();
    const order = screen.getByRole("region", {
      name: "Information order of the three Boolean states",
    });
    expect(
      within(order).getByRole("button", {
        name: "Inspect state {false}: the Boolean answer is false",
      }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("ignores malformed stored progress and starts at bottom", () => {
    window.localStorage.setItem(
      "scottlab.progress.v1",
      '{"version":1,"lesson":{"step":"nonsense"}}',
    );
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "We do not know the Boolean value yet.",
      }),
    ).toBeVisible();
  });

  it("navigates between stations through the lesson trail", async () => {
    const user = userEvent.setup();
    render(<App />);

    const trail = screen.getByRole("navigation", { name: "Lesson trail" });
    expect(
      within(trail).getByRole("button", { name: "Lesson 1: Bottom" }),
    ).toHaveAttribute("aria-current", "step");

    await user.click(
      within(trail).getByRole("button", { name: "Lesson 4: States" }),
    );
    expect(window.location.hash).toBe("#/lesson/states");
    expect(
      within(trail).getByRole("button", { name: "Lesson 4: States" }),
    ).toHaveAttribute("aria-current", "step");

    await user.click(
      within(trail).getByRole("button", { name: "Lesson 2: Formalisation" }),
    );
    expect(window.location.hash).toBe("#/lesson");
    expect(document.title).toBe("ScottLab · The formal Boolean system");
    expect(
      within(trail).getByRole("button", { name: "Lesson 2: Formalisation" }),
    ).toHaveAttribute("aria-current", "step");
  });

  it("translates the complete sandbox without losing its selection", async () => {
    window.history.replaceState(null, "", "#/sandbox/flat-boolean");
    const user = userEvent.setup();
    render(<App />);
    const tray = screen.getByRole("region", { name: "Experiment tray" });
    await user.click(
      within(tray).getByRole("button", { name: "Select state {Δ, true}" }),
    );

    await user.click(screen.getByRole("button", { name: "Choose Deutsch" }));

    expect(document.title).toBe(
      "ScottLab · Schreibgeschützte Boolean-Sandbox",
    );
    expect(
      screen.getByRole("heading", {
        name: "Dasselbe System nun ohne den vorgegebenen Lernpfad erkunden.",
      }),
    ).toBeVisible();
    const germanTray = screen.getByRole("region", {
      name: "Experimentierablage",
    });
    expect(
      within(germanTray).getByRole("button", {
        name: "Zustand {Δ, true} auswählen",
      }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByText(/fügt die Beobachtung true zu Δ hinzu/),
    ).toBeVisible();
  });

  it("steps through a nontrivial entailment chain and solves its challenge", async () => {
    const user = userEvent.setup();
    render(<App />);
    await reachEntailmentLesson(user);

    expect(window.location.hash).toBe("#/lesson/entailment");
    expect(document.title).toBe("ScottLab · Entailment in action");
    expect(
      screen.getByRole("heading", {
        name: "Watch one observation teach the state more.",
      }),
    ).toHaveFocus();
    expect(
      screen.getByRole("group", {
        name: "Interactive access-permissions entailment lesson",
      }),
    ).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("{Δ}");
    expect(
      screen.queryByRole("list", { name: "Closure trace" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Rule-driven definition" }),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Add the administrator premise",
      }),
    );

    expect(screen.getByText("Trace frame 1 of 6")).toBeVisible();
    const ruleChain = screen.getByRole("list", { name: "Closure trace" });
    expect(within(ruleChain).getAllByText("Rule pending")).toHaveLength(1);
    expect(within(ruleChain).getAllByText("not yet in state")).toHaveLength(1);
    expect(
      screen.getByRole("heading", {
        name: "The premise {administrator} is available.",
      }),
    ).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(
      "{administrator, Δ}",
    );

    const traceControls = screen.getByRole("group", {
      name: "Closure trace controls",
    });
    const nextFrame = within(traceControls).getByRole("button", {
      name: "Next frame →",
    });
    await user.click(nextFrame);
    expect(
      screen.getByRole("heading", {
        name: "Apply “Administrators may edit”.",
      }),
    ).toBeVisible();
    expect(
      within(
        screen.getByRole("region", {
          name: "Apply “Administrators may edit”.",
        }),
      ).getAllByText("{administrator} ⊢ may edit"),
    ).toHaveLength(2);

    await user.click(nextFrame);
    expect(
      screen.getByRole("heading", {
        name: "The state learns may edit.",
      }),
    ).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(
      "{administrator, Δ, may edit}",
    );
    expect(within(ruleChain).getAllByText("Rule applied")).toHaveLength(1);
    expect(within(ruleChain).getAllByText("conclusion in state")).toHaveLength(1);

    await user.click(nextFrame);
    expect(
      screen.getByRole("heading", {
        name: "The premise {may edit} is available.",
      }),
    ).toBeVisible();
    await user.click(nextFrame);
    expect(
      screen.getByRole("heading", {
        name: "Apply “Editors may view”.",
      }),
    ).toBeVisible();
    await user.click(nextFrame);
    expect(
      screen.getByRole("heading", {
        name: "The state learns may view.",
      }),
    ).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(
      "{administrator, Δ, may edit, may view}",
    );
    await user.click(nextFrame);

    expect(
      screen.getByRole("heading", { name: "Closure has stabilized." }),
    ).toBeVisible();
    expect(
      screen.queryByRole("list", { name: "Closure trace" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Which token needed both declared rules?",
      }),
    ).toBeVisible();
    await user.click(
      screen.getByText("Open the formal definition and full derivation"),
    );
    const definition = screen.getByRole("region", {
      name: "Rule-driven definition",
    });
    expect(
      within(definition).getByText("{administrator} ⊢ may edit"),
    ).toBeVisible();
    expect(
      within(definition).getByText("{may edit} ⊢ may view"),
    ).toBeVisible();
    expect(
      screen.getByText(
        "Step 1: observe administrator. Reflexivity adds it to the closure, producing {administrator, Δ}.",
      ),
    ).toBeVisible();
    expect(
      screen.getByText(
        "Step 2: {administrator} enables “Administrators may edit”, which entails may edit.",
      ),
    ).toBeVisible();

    const nonFlat = screen.getByRole("region", {
      name: "Entailment reshapes the whole order.",
    });
    expect(within(nonFlat).getByText("{l, r} ⊢ ε")).toBeVisible();
    expect(
      within(nonFlat).getByText(/\{Δ\}\s+\{Δ, ε\}\s+\{Δ, l\}/),
    ).toBeVisible();
    expect(
      within(nonFlat).getByText(/chains of length greater than one/),
    ).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Choose administrator" }),
    );
    expect(
      screen.getByText("That token has a different role in the trace."),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Choose may view" }));
    expect(
      screen.getByText("Exactly — that is the two-step consequence."),
    ).toBeVisible();
    expect(
      screen.getByText(/may view needs the administrator-to-edit rule/),
    ).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Replay from the premise" }),
    );
    expect(screen.getByText("Trace frame 1 of 6")).toBeVisible();
    expect(
      screen.queryByRole("heading", {
        name: "Which token needed both declared rules?",
      }),
    ).not.toBeInTheDocument();
  });

  it("direct-links and returns between the entailment lesson and sandbox", async () => {
    window.history.replaceState(null, "", "#/lesson/entailment");
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "Watch one observation teach the state more.",
      }),
    ).toHaveFocus();
    await user.click(
      screen.getByRole("button", {
        name: "Add the administrator premise",
      }),
    );
    await user.click(
      screen.getByRole("button", { name: "Next frame →" }),
    );
    expect(screen.getByText("Trace frame 2 of 6")).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Review the Boolean sandbox" }),
    );
    expect(window.location.hash).toBe("#/sandbox/flat-boolean");

    await user.click(
      screen.getByRole("button", { name: "Back to the focused lesson" }),
    );
    expect(window.location.hash).toBe("#/lesson/entailment");
    expect(
      screen.getByRole("heading", {
        name: "Watch one observation teach the state more.",
      }),
    ).toHaveFocus();
    expect(screen.getByText("Trace frame 2 of 6")).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: "Apply “Administrators may edit”.",
      }),
    ).toBeVisible();
  });

  it("moves focus through trace controls and supports previous and skip", async () => {
    window.history.replaceState(null, "", "#/lesson/entailment");
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole("button", {
        name: "Add the administrator premise",
      }),
    );
    const next = screen.getByRole("button", { name: "Next frame →" });
    expect(next).toHaveFocus();
    expect(
      screen
        .getByRole("heading", {
          name: "The premise {administrator} is available.",
        })
        .parentElement,
    ).toHaveAttribute("aria-live", "polite");

    await user.click(next);
    await user.click(
      screen.getByRole("button", { name: "← Previous frame" }),
    );
    expect(screen.getByText("Trace frame 1 of 6")).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Show the complete closure" }),
    );
    expect(
      screen.getByRole("heading", {
        name: "Which token needed both declared rules?",
      }),
    ).toHaveFocus();
  });

  it("returns a direct entailment link to a valid formalisation", async () => {
    window.history.replaceState(null, "", "#/lesson/entailment");
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole("button", { name: "Back to formalisation" }),
    );

    expect(window.location.hash).toBe("#/lesson");
    expect(
      screen.getByRole("heading", {
        name: "The same three states, written explicitly",
      }),
    ).toHaveFocus();
    expect(screen.getByRole("table")).toBeVisible();
  });

  it("repairs an unclosed selection in the states lesson", async () => {
    const user = userEvent.setup();
    render(<App />);
    await reachStatesLesson(user);

    expect(window.location.hash).toBe("#/lesson/states");
    expect(document.title).toBe("ScottLab · What makes a state?");
    expect(
      screen.getByRole("heading", {
        name: "A selection is not automatically a state.",
      }),
    ).toHaveFocus();
    expect(
      screen.getByRole("group", {
        name: "Interactive editing-policy states lesson",
      }),
    ).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Consistent, but not yet a state.",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Missing entailed tokens: {may edit}",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Complete this selection with closure",
      }),
    );
    expect(
      screen.getByRole("heading", { name: "This selection is a state." }),
    ).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent(
      "{administrator, Δ, may edit}",
    );
    expect(
      screen.getByRole("button", { name: "Remove administrator token" }),
    ).toBeDisabled();

    await user.click(
      screen.getByRole("button", { name: "Repair it yourself" }),
    );
    expect(
      screen.getByRole("heading", {
        name: "Repair the selection without using automatic closure.",
      }),
    ).toHaveFocus();

    await user.click(
      screen.getByRole("button", { name: "Add read only token" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Concrete conflict witness: {administrator, read only}",
    );

    await user.click(
      screen.getByRole("button", { name: "Remove read only token" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Add may edit token" }),
    );
    expect(
      screen.getByRole("heading", {
        name: "You built a consistent, closed state.",
      }),
    ).toBeVisible();
    // Completing the challenge from the token picker must not steal the
    // keyboard focus from the button the learner just operated.
    expect(
      screen.getByRole("button", { name: "Remove may edit token" }),
    ).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent(
      "This selection is a state.",
    );
  });

  it("handles a valid but off-target state and preserves states progress", async () => {
    window.history.replaceState(null, "", "#/lesson/states");
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole("button", {
        name: "Complete this selection with closure",
      }),
    );
    await user.click(
      screen.getByRole("button", { name: "Repair it yourself" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Remove administrator token" }),
    );
    expect(
      screen.getByText(/That is a state, but it removes the administrator premise/),
    ).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(
      "That is a state, but it removes the administrator premise.",
    );

    await user.click(screen.getByRole("button", { name: "Back to entailment" }));
    expect(window.location.hash).toBe("#/lesson/entailment");
    await user.click(
      screen.getByRole("button", { name: "Continue to states" }),
    );
    expect(window.location.hash).toBe("#/lesson/states");
    expect(
      screen.getByRole("button", { name: "Add administrator token" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("explains a missing distinguished token in the structured state trace", async () => {
    window.history.replaceState(null, "", "#/lesson/states");
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole("button", { name: "Remove administrator token" }),
    );
    await user.click(
      screen.getByRole("button", {
        name: "Remove Delta, the always-present token",
      }),
    );
    expect(screen.getByText("No tokens selected")).toBeVisible();
    await user.click(screen.getByText("Read the core analysis as text"));
    expect(
      screen.getByText(
        "The distinguished-token law adds Δ, producing {Δ}.",
      ),
    ).toBeVisible();
  });

  it("translates a states witness without resetting the selection", async () => {
    window.history.replaceState(null, "", "#/lesson/states");
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole("button", { name: "Add read only token" }),
    );
    await user.click(screen.getByRole("button", { name: "Choose Deutsch" }));

    expect(document.title).toBe("ScottLab · Was macht einen Zustand aus?");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Konkreter Konfliktbeleg: {Administrator, nur lesen}",
    );
    expect(
      screen.getByRole("button", { name: "Nur-lesen-Token entfernen" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("computes Boolean negation stepwise and preserves the completed map lesson", async () => {
    const user = userEvent.setup();
    render(<App />);
    await reachMapsLesson(user);

    expect(window.location.hash).toBe("#/lesson/maps");
    expect(document.title).toBe("ScottLab · Continuous maps in action");
    expect(
      screen.getByRole("heading", {
        name: "Refine the input; watch the output learn.",
      }),
    ).toHaveFocus();
    expect(
      screen.getByRole("group", {
        name: "Interactive Boolean-negation continuous-maps lesson",
      }),
    ).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Bottom maps to bottom.",
    );
    expect(screen.getByText("not({Δ}) = {Δ}")).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: /Refine the input to true/ }),
    );
    expect(screen.getByText("Guided mapping frame 1 of 3")).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(
      "The input contains true.",
    );

    await user.click(screen.getByRole("button", { name: /Next frame/ }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Activate “true input maps to false output”.",
    );
    await user.click(screen.getByRole("button", { name: /Next frame/ }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "The target closes to {Δ, false}.",
    );

    await user.click(
      screen.getByRole("button", { name: /Begin the challenge/ }),
    );
    expect(
      screen.getByRole("heading", {
        name: "Which input makes the output true?",
      }),
    ).toHaveFocus();

    await user.click(
      screen.getByRole("button", {
        name: "Choose true token as the input observation",
      }),
    );
    await user.click(
      screen.getByRole("button", { name: "Show this map result" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "That input produces the other Boolean branch.",
    );
    expect(
      screen.getByRole("button", { name: /Finish the challenge/ }),
    ).toBeDisabled();

    await user.click(
      screen.getByRole("button", {
        name: "Choose false token as the input observation",
      }),
    );
    await user.click(
      screen.getByRole("button", { name: "Show this map result" }),
    );
    expect(screen.getByText("Correct finite support")).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: /Finish the challenge/ }),
    );

    expect(
      screen.getByText(
        "You computed Boolean negation from finite support.",
      ),
    ).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent(
      "{Δ, false} activates one declared generator",
    );
    await user.click(
      screen.getByText("Read the complete mapping derivation as text"),
    );
    expect(
      screen.getByText(/source support \{false\} activates/),
    ).toBeVisible();

    const functionSpace = screen.getByRole("group", {
      name: "Information order of the eleven continuous maps from Booleans to Booleans",
    });
    expect(
      within(functionSpace).getAllByRole("button", { name: /Inspect map/ }),
    ).toHaveLength(11);
    expect(screen.getByText("your negation map")).toBeVisible();
    expect(screen.getByText("f({Δ, false}) = {Δ, true}")).toBeVisible();
    expect(
      screen.getByText(/four maximal maps are the four total Boolean/),
    ).toBeVisible();

    await user.click(
      within(functionSpace).getByRole("button", { name: "Inspect map f0" }),
    );
    expect(screen.getByText("f({Δ, true}) = {Δ}")).toBeVisible();
    expect(screen.queryByText("your negation map")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Back to states" }));
    expect(window.location.hash).toBe("#/lesson/states");
    await user.click(
      screen.getByRole("button", { name: "Continue to continuous maps" }),
    );
    expect(window.location.hash).toBe("#/lesson/maps");
    expect(screen.getByRole("status")).toHaveTextContent(
      "You computed Boolean negation from finite support.",
    );
  });

  it("opens the maps hash directly and translates an in-progress trace", async () => {
    window.history.replaceState(null, "", "#/lesson/maps");
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "Refine the input; watch the output learn.",
      }),
    ).toHaveFocus();
    await user.click(
      screen.getByRole("button", { name: /Refine the input to true/ }),
    );
    await user.click(screen.getByRole("button", { name: /Next frame/ }));
    await user.click(screen.getByRole("button", { name: "Choose Deutsch" }));

    expect(document.title).toBe(
      "ScottLab · Stetige Abbildungen in Aktion",
    );
    expect(
      screen.getByText("Geführtes Abbildungsbild 2 von 3"),
    ).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(
      "„True-Eingabe wird auf False-Ausgabe abgebildet“ aktivieren.",
    );
  });

  it("translates an in-progress entailment trace without resetting it", async () => {
    window.history.replaceState(null, "", "#/lesson/entailment");
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", {
        name: "Add the administrator premise",
      }),
    );
    await user.click(
      screen.getByRole("button", { name: "Choose Deutsch" }),
    );

    expect(document.title).toBe("ScottLab · Folgerung in Aktion");
    expect(screen.getByText("Spurbild 1 von 6")).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: "Die Prämisse {Administrator} ist vorhanden.",
      }),
    ).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(
      "{Administrator, Δ}",
    );
    const germanRuleChain = screen.getByRole("list", {
      name: "Abschlussspur",
    });
    expect(
      within(germanRuleChain).getAllByText("Regel ausstehend"),
    ).toHaveLength(1);
    expect(
      within(germanRuleChain).getAllByText("noch nicht im Zustand"),
    ).toHaveLength(1);
    expect(
      screen.queryByText(
        "Formale Definition und vollständige Herleitung öffnen",
      ),
    ).not.toBeInTheDocument();
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
    expect(document.title).toBe("ScottLab · Beim Bottom beginnen");
    expect(window.localStorage.getItem("scottlab-language")).toBe("de-DE");
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

    await user.click(
      screen.getByRole("button", { name: "Woher stammt diese Idee?" }),
    );

    expect(document.title).toBe("ScottLab · Warum Informationssysteme?");
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
    // The persisted progress restores the reopened state as well.
    expect(
      screen.getByRole("heading", {
        name: "Dieser Zustand enthält keine Beobachtungen.",
      }),
    ).toBeVisible();
  });

  it("supports the inconsistency attempt entirely from the keyboard", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.tab();
    expect(
      screen.getByRole("button", { name: "Return to the ScottLab start" }),
    ).toHaveFocus();

    await user.tab();
    expect(
      screen.getByRole("button", { name: "Lesson 1: Bottom" }),
    ).toHaveFocus();
    for (let station = 1; station < 8; station += 1) {
      await user.tab();
    }
    expect(
      screen.getByRole("button", {
        name: "Sandbox preview: Flat Booleans",
      }),
    ).toHaveFocus();
    await user.tab();
    expect(
      screen.getByRole("button", {
        name: "Gallery: All example systems",
      }),
    ).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: "Choose English" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Choose Deutsch" })).toHaveFocus();

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
