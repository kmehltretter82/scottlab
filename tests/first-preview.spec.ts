import {
  expect,
  test,
  type Locator,
  type Page,
} from "@playwright/test";

const directRoutes = [
  {
    hash: "#/lesson",
    heading: "We do not know the Boolean value yet.",
    title: "ScottLab · Begin at bottom",
  },
  {
    hash: "#/lesson/entailment",
    heading: "Watch one observation teach the state more.",
    title: "ScottLab · Entailment in action",
  },
  {
    hash: "#/lesson/states",
    heading: "A selection is not automatically a state.",
    title: "ScottLab · What makes a state?",
  },
  {
    hash: "#/lesson/maps",
    heading: "Refine the input; watch the output learn.",
    title: "ScottLab · Continuous maps in action",
  },
  {
    hash: "#/lesson/fixed-points",
    heading: "Recursion is repeated application from ⊥.",
    title: "ScottLab · Least fixed points",
  },
  {
    hash: "#/lesson/games",
    heading: "Winning is entailment.",
    title: "ScottLab · Winning is entailment",
  },
  {
    hash: "#/gallery",
    heading: "Every example system, side by side.",
    title: "ScottLab · Example gallery",
  },
  {
    hash: "#/sandbox/flat-boolean",
    heading: "Explore the same system without the lesson rails.",
    title: "ScottLab · Flat Booleans sandbox preview",
  },
] as const;

async function tabTo(
  page: Page,
  target: Locator,
  tabKey: "Alt+Tab" | "Tab",
  maximumTabs = 60,
): Promise<void> {
  await expect(target).toBeVisible();

  for (let index = 0; index <= maximumTabs; index += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) {
      return;
    }
    await page.keyboard.press(tabKey);
  }

  throw new Error(`Could not reach the requested control with ${tabKey}.`);
}

async function pressButton(
  page: Page,
  accessibleName: string,
  tabKey: "Alt+Tab" | "Tab",
): Promise<void> {
  const button = page.getByRole("button", { name: accessibleName, exact: true });
  await tabTo(page, button, tabKey);
  await page.keyboard.press("Enter");
}

test.describe("shareable hash routes", () => {
  test("serves the production build from the Pages subpath", async ({
    page,
  }) => {
    const response = await page.goto("./");

    expect(response?.ok()).toBe(true);
    await expect(page).toHaveURL(/\/scottlab\/#\/lesson$/);
    await expect(page).toHaveTitle("ScottLab · Begin at bottom");

    const loadedAssets = await page
      .locator('script[src], link[rel="stylesheet"][href]')
      .evaluateAll((elements) =>
        elements.map((element) =>
          element instanceof HTMLScriptElement ? element.src : element.href,
        ),
      );
    expect(loadedAssets.length).toBeGreaterThan(0);
    expect(
      loadedAssets.every(
        (asset) => new URL(asset).pathname.startsWith("/scottlab/assets/"),
      ),
    ).toBe(true);
    await expect(page.locator('script[src*="/@vite/client"]')).toHaveCount(0);
  });

  for (const route of directRoutes) {
    test(`opens ${route.hash} directly`, async ({ page }) => {
      await page.goto(route.hash);

      await expect(page).toHaveURL(new RegExp(`${route.hash.replaceAll("/", "\\/")}$`));
      await expect(page).toHaveTitle(route.title);
      const heading = page.getByRole("heading", {
        level: 1,
        name: route.heading,
      });
      await expect(heading).toBeVisible();
      if (route.hash !== "#/lesson") {
        await expect(heading).toBeFocused();
      }
    });
  }

  test("canonicalizes an unsupported sandbox hash", async ({ page }) => {
    await page.goto("#/sandbox/not-supported");

    await expect(page).toHaveURL(/#\/lesson$/);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "We do not know the Boolean value yet.",
      }),
    ).toBeVisible();
  });
});

test("opens a shared sandbox selection and updates the share URL", async ({
  page,
}) => {
  await page.goto("#/sandbox/flat-boolean/delta.false");

  const tray = page.getByRole("region", { name: "Experiment tray" });
  await expect(
    tray.getByRole("button", { name: "Select state {Δ, false}" }),
  ).toHaveAttribute("aria-pressed", "true");

  await tray.getByRole("button", { name: "Select state {Δ, true}" }).click();
  await expect(page).toHaveURL(/#\/sandbox\/flat-boolean\/delta\.true$/);
});

test("restores lesson progress after a reload", async ({ page }) => {
  await page.goto("#/lesson");
  for (const action of ["Look inside", "Meet the tokens", "Add true token"]) {
    await page.getByRole("button", { name: action, exact: true }).click();
  }
  await expect(
    page.getByRole("heading", {
      name: "Now the Boolean value is known as true.",
    }),
  ).toBeVisible();

  await page.reload();

  await expect(
    page.getByRole("heading", {
      name: "Now the Boolean value is known as true.",
    }),
  ).toBeVisible();
});

test("completes the essential Boolean path using only the keyboard", async ({
  browserName,
  page,
}) => {
  await page.goto("#/lesson");
  const tabKey = browserName === "webkit" ? "Alt+Tab" : "Tab";

  await pressButton(page, "Look inside", tabKey);
  await pressButton(page, "Meet the tokens", tabKey);
  await pressButton(page, "Add true token", tabKey);
  await pressButton(page, "Try adding false token", tabKey);

  await expect(
    page.getByRole("heading", {
      name: "One Boolean value cannot be both true and false.",
    }),
  ).toBeFocused();

  await pressButton(page, "Try a short challenge", tabKey);
  await pressButton(page, "Add false token", tabKey);
  await pressButton(page, "Use the explicit convention", tabKey);
  await pressButton(page, "Next", tabKey);
  await pressButton(page, "Next", tabKey);
  await pressButton(page, "Next", tabKey);
  await pressButton(page, "Open the read-only sandbox", tabKey);

  await expect(page).toHaveURL(/#\/sandbox\/flat-boolean$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Explore the same system without the lesson rails.",
    }),
  ).toBeFocused();

  const diagram = page.getByRole("region", {
    name: "Formal information order of the flat-Boolean states",
  });
  const bottom = diagram.getByRole("button", {
    name: "Inspect state ⊥ = {Δ}: no specific Boolean answer",
  });
  const falseState = diagram.getByRole("button", {
    name: "Inspect state {Δ, false}: the Boolean answer is false",
  });

  await tabTo(page, bottom, tabKey);
  await page.keyboard.press("Enter");
  await expect(bottom).toHaveAttribute("aria-pressed", "true");

  await page.keyboard.press("ArrowUp");
  await expect(falseState).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(falseState).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("region", { name: "Explanation panel" }),
  ).toContainText("adds the false observation to Δ");
});

test("computes the Boolean-negation challenge using only the keyboard", async ({
  browserName,
  page,
}) => {
  await page.goto("#/lesson/maps");
  const tabKey = browserName === "webkit" ? "Alt+Tab" : "Tab";

  await pressButton(page, "Refine the input to true", tabKey);
  await expect(page.getByText("Guided mapping frame 1 of 3")).toBeVisible();

  const next = page.getByRole("button", { name: /Next frame/ });
  await expect(next).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText(
    "Activate “true input maps to false output”",
  );
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText(
    "The target closes to {Δ, false}",
  );
  await page.keyboard.press("Enter");

  const falseInput = page.getByRole("button", {
    name: "Choose false token as the input observation",
  });
  await tabTo(page, falseInput, tabKey);
  await page.keyboard.press("Enter");

  const showResult = page.getByRole("button", {
    name: "Show this map result",
  });
  await tabTo(page, showResult, tabKey);
  await page.keyboard.press("Enter");
  await expect(page.getByText("Correct finite support")).toBeVisible();

  const finish = page.getByRole("button", { name: /Finish the challenge/ });
  await expect(finish).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText(
    "You computed Boolean negation from finite support",
  );
});
