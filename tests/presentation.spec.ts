import { expect, test, type Page } from "@playwright/test";

const negligibleMotionSeconds = 0.000_01;

function parseCssTimes(value: string): readonly number[] {
  return value.split(",").map((item) => {
    const time = item.trim();
    const numericTime = Number.parseFloat(time);
    return time.endsWith("ms") ? numericTime / 1_000 : numericTime;
  });
}

async function expectNoHorizontalPageOverflow(page: Page): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
}

async function expectPageFitsViewport(page: Page): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollHeight <= window.innerHeight + 1,
      ),
    )
    .toBe(true);
}

async function reachFormalisation(page: Page): Promise<void> {
  await page.goto("#/lesson");
  for (const action of [
    "Explore a first example",
    "Begin the Boolean model at ⊥",
    "Look inside",
    "Meet the tokens",
    "Add true token",
    "Try adding false token",
    "Try a short challenge",
    "Add false token",
    "Use the explicit convention",
  ]) {
    await page.getByRole("button", { name: action, exact: true }).click();
  }
}

test.describe("function-first lesson density", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("keeps each formalisation topic on one laptop-sized page", async ({
    page,
  }) => {
    await reachFormalisation(page);

    for (const heading of [
      "Δ is a token. ⊥ is a state.",
      "The four ingredients",
      "Why Δ appears at bottom",
      "The same three states, written explicitly",
    ]) {
      await expect(
        page.getByRole("heading", { level: 1, name: heading }),
      ).toBeFocused();
      await expect(
        page.getByRole("button", {
          name: "Return to the ScottLab start",
        }),
      ).toBeInViewport();
      const shellScrollLeft = await page
        .locator(".app-shell")
        .evaluate((shell) => shell.scrollLeft);
      expect(shellScrollLeft).toBe(0);
      await expectPageFitsViewport(page);
      if (heading !== "The same three states, written explicitly") {
        await page.getByRole("button", { name: "Next", exact: true }).click();
      }
    }

    const formalBodySize = await page
      .locator(".formal-projection-note")
      .evaluate((element) =>
        Number.parseFloat(window.getComputedStyle(element).fontSize),
      );
    expect(formalBodySize).toBeGreaterThanOrEqual(13.5);
  });

  test("opens entailment with one compact task instead of four panels", async ({
    page,
  }) => {
    await page.goto("#/lesson/entailment");

    await expect(page.locator(".entailment-stage")).toHaveCount(1);
    await expect(
      page.getByRole("list", { name: "Closure trace" }),
    ).toHaveCount(0);
    await expect(page.locator(".entailment-formal-details")).toHaveCount(0);
    const headingSize = await page
      .getByRole("heading", {
        level: 1,
        name: "Watch one observation teach the state more.",
      })
      .evaluate((element) =>
        Number.parseFloat(window.getComputedStyle(element).fontSize),
      );
    expect(headingSize).toBeLessThanOrEqual(36);
    await expectPageFitsViewport(page);
  });
});

test.describe("reduced-motion presentation", () => {
  test.use({ reducedMotion: "reduce" });

  test("keeps sandbox state changes usable without animation", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("#/sandbox/flat-boolean");

    expect(
      await page.evaluate(
        () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    ).toBe(true);

    await page
      .getByRole("region", { name: "Experiment tray" })
      .getByRole("button", { name: "Select state {Δ, true}" })
      .click();

    await expect(
      page.getByRole("region", { name: "Explanation panel" }),
    ).toContainText("adds the true observation to Δ");

    const affectedMotionStyles = await page
      .locator(
        ".sandbox-order-node, .sandbox-state-choices button, .sandbox-token-tray li",
      )
      .evaluateAll((elements) =>
        elements.map((element) => {
          const style = window.getComputedStyle(element);
          return {
            animationDelay: style.animationDelay,
            animationDuration: style.animationDuration,
            animationName: style.animationName,
            transitionDelay: style.transitionDelay,
            transitionDuration: style.transitionDuration,
          };
        }),
      );

    expect(affectedMotionStyles.length).toBeGreaterThan(0);
    for (const style of affectedMotionStyles) {
      expect(style.animationName.split(",").map((name) => name.trim())).toEqual([
        "none",
      ]);
      for (const timeList of [
        style.animationDelay,
        style.animationDuration,
        style.transitionDelay,
        style.transitionDuration,
      ]) {
        for (const seconds of parseCssTimes(timeList)) {
          expect(Math.abs(seconds)).toBeLessThanOrEqual(
            negligibleMotionSeconds,
          );
        }
      }
    }

    expect(
      await page.evaluate(
        () =>
          document
            .getAnimations()
            .filter(({ playState }) =>
              ["pending", "running"].includes(playState),
            ).length,
      ),
    ).toBe(0);
  });

  test("keeps the continuous-map trace causal without motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("#/lesson/maps");
    await page
      .getByRole("button", { name: "Refine the input to true" })
      .click();

    await expect(page.getByRole("status")).toContainText(
      "The input contains true",
    );
    const affectedMotionStyles = await page
      .locator(
        ".continuous-map-copy, .continuous-map-arrow article, .continuous-map-narration",
      )
      .evaluateAll((elements) =>
        elements.map((element) => {
          const style = window.getComputedStyle(element);
          return {
            animationDelay: style.animationDelay,
            animationDuration: style.animationDuration,
            animationName: style.animationName,
            transitionDelay: style.transitionDelay,
            transitionDuration: style.transitionDuration,
          };
        }),
      );

    expect(affectedMotionStyles.length).toBeGreaterThan(0);
    for (const style of affectedMotionStyles) {
      expect(style.animationName.split(",").map((name) => name.trim())).toEqual([
        "none",
      ]);
      for (const timeList of [
        style.animationDelay,
        style.animationDuration,
        style.transitionDelay,
        style.transitionDuration,
      ]) {
        for (const seconds of parseCssTimes(timeList)) {
          expect(Math.abs(seconds)).toBeLessThanOrEqual(
            negligibleMotionSeconds,
          );
        }
      }
    }
    expect(
      await page.evaluate(
        () =>
          document
            .getAnimations()
            .filter(({ playState }) =>
              ["pending", "running"].includes(playState),
            ).length,
      ),
    ).toBe(0);
  });
});

test.describe("narrow-screen workspaces", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("keeps one synchronized sandbox selection across its mobile areas", async ({
    page,
  }) => {
    await page.goto("#/sandbox/flat-boolean");

    const areaNavigation = page.getByRole("navigation", {
      name: "Move between sandbox areas",
    });
    await expect(areaNavigation).toBeVisible();

    const tray = page.getByRole("region", { name: "Experiment tray" });
    const trueState = tray.getByRole("button", {
      name: "Select state {Δ, true}",
    });
    await trueState.click();
    await expect(trueState).toHaveAttribute("aria-pressed", "true");

    await expect(
      page.getByRole("region", { name: "Definition panel" }),
    ).toContainText("{Δ, true}");
    const explanation = page.getByRole("region", {
      name: "Explanation panel",
    });
    await expect(explanation).toContainText("adds the true observation to Δ");

    await areaNavigation.getByRole("button", { name: "Explanation" }).click();
    await expect(explanation).toBeFocused();
    await expectNoHorizontalPageOverflow(page);
  });

  test("keeps the states verdict and concrete witness usable on mobile", async ({
    page,
  }) => {
    await page.goto("#/lesson/states");

    const workspace = page.getByRole("group", {
      name: "Interactive editing-policy states lesson",
    });
    await expect(workspace).toBeVisible();
    await expect(workspace).toContainText("Consistent, but not yet a state.");

    await workspace
      .getByRole("button", { name: "Add read only token" })
      .click();
    await expect(workspace).toContainText("This selection is inconsistent.");
    await expect(workspace).toContainText(
      "Concrete conflict witness: {administrator, read only}",
    );
    await expectNoHorizontalPageOverflow(page);
  });

  test("keeps the two continuous-map copies synchronized on mobile", async ({
    page,
  }) => {
    await page.goto("#/lesson/maps");
    await page
      .getByRole("button", { name: "Refine the input to true" })
      .click();
    await page.getByRole("button", { name: /Next frame/ }).click();
    await page.getByRole("button", { name: /Next frame/ }).click();

    await expect(page.locator(".continuous-map-copy.is-input")).toContainText(
      "{Δ, true}",
    );
    await expect(page.locator(".continuous-map-copy.is-output")).toContainText(
      "{Δ, false}",
    );
    await expect(page.getByRole("status")).toContainText(
      "The target closes to {Δ, false}",
    );
    await expectNoHorizontalPageOverflow(page);
  });

  test("keeps all four formalisation pages within the mobile width", async ({
    page,
  }) => {
    await reachFormalisation(page);

    for (let formalPage = 1; formalPage <= 4; formalPage += 1) {
      await expectNoHorizontalPageOverflow(page);
      if (formalPage < 4) {
        await page.getByRole("button", { name: "Next", exact: true }).click();
      }
    }
  });
});
