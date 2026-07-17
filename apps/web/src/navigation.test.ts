import { afterEach, describe, expect, it } from "vitest";

import {
  entailmentLessonRoute,
  fixedPointsLessonRoute,
  flatBooleanSandboxRoute,
  galleryRoute,
  gamesLessonRoute,
  formatHashRoute,
  lessonRoute,
  mapsLessonRoute,
  parseHashRoute,
  statesLessonRoute,
  subscribeToHashRouteChanges,
  type AppRoute,
} from "./navigation";

afterEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("parseHashRoute", () => {
  it("parses each supported route", () => {
    expect(parseHashRoute("#/lesson")).toEqual(lessonRoute);
    expect(parseHashRoute("#/lesson/entailment")).toEqual(
      entailmentLessonRoute,
    );
    expect(parseHashRoute("#/lesson/states")).toEqual(statesLessonRoute);
    expect(parseHashRoute("#/lesson/maps")).toEqual(mapsLessonRoute);
    expect(parseHashRoute("#/lesson/fixed-points")).toEqual(
      fixedPointsLessonRoute,
    );
    expect(parseHashRoute("#/lesson/games")).toEqual(gamesLessonRoute);
    expect(parseHashRoute("#/sandbox/flat-boolean")).toEqual(
      flatBooleanSandboxRoute,
    );
    expect(parseHashRoute("#/sandbox/flat-boolean/delta.true")).toEqual({
      kind: "sandbox",
      systemId: "flat-boolean",
      selection: ["delta", "true"],
    });
    expect(parseHashRoute("#/gallery")).toEqual(galleryRoute);
    expect(parseHashRoute("#/gallery/take-away-game")).toEqual({
      kind: "gallery",
      systemId: "take-away-game",
    });
  });

  it.each([
    "",
    "#",
    "lesson",
    "#/Lesson",
    "#/lesson/",
    "#/lesson/Entailment",
    "#/lesson/entailment/",
    "#/lesson/states/",
    "#/lesson/maps/",
    "#/lesson/fixed-points/",
    "#/lesson/Fixed-Points",
    "#/lesson/games/",
    "#/sandbox",
    "#/sandbox/flat-boolean/",
    "#/sandbox/flat-boolean/Delta.True",
    "#/sandbox/flat-boolean?editing=true",
    "#/sandbox/%66lat-boolean",
    "#/sandbox/another-system",
  ])("falls back safely for an unknown or malformed hash: %s", (hash) => {
    expect(parseHashRoute(hash)).toEqual(lessonRoute);
  });
});

describe("formatHashRoute", () => {
  it("formats routes canonically and deterministically", () => {
    expect(formatHashRoute(lessonRoute)).toBe("#/lesson");
    expect(formatHashRoute(lessonRoute)).toBe("#/lesson");
    expect(formatHashRoute(entailmentLessonRoute)).toBe(
      "#/lesson/entailment",
    );
    expect(formatHashRoute(statesLessonRoute)).toBe("#/lesson/states");
    expect(formatHashRoute(mapsLessonRoute)).toBe("#/lesson/maps");
    expect(formatHashRoute(fixedPointsLessonRoute)).toBe(
      "#/lesson/fixed-points",
    );
    expect(formatHashRoute(gamesLessonRoute)).toBe("#/lesson/games");
    expect(formatHashRoute(flatBooleanSandboxRoute)).toBe(
      "#/sandbox/flat-boolean",
    );
    expect(formatHashRoute(flatBooleanSandboxRoute)).toBe(
      "#/sandbox/flat-boolean",
    );
    expect(
      formatHashRoute({
        kind: "sandbox",
        systemId: "flat-boolean",
        selection: ["true", "delta"],
      }),
    ).toBe("#/sandbox/flat-boolean/delta.true");
    expect(formatHashRoute(galleryRoute)).toBe("#/gallery");
    expect(
      formatHashRoute({ kind: "gallery", systemId: "coquand" }),
    ).toBe("#/gallery/coquand");
  });

  it.each<AppRoute>([
    lessonRoute,
    entailmentLessonRoute,
    statesLessonRoute,
    mapsLessonRoute,
    fixedPointsLessonRoute,
    gamesLessonRoute,
    flatBooleanSandboxRoute,
    galleryRoute,
    { kind: "sandbox", systemId: "flat-boolean", selection: ["delta", "true"] },
    { kind: "gallery", systemId: "stream-prefixes" },
  ])(
    "round-trips $kind",
    (route) => {
      expect(parseHashRoute(formatHashRoute(route))).toEqual(route);
    },
  );
});

describe("subscribeToHashRouteChanges", () => {
  it("reports hash navigation and can be unsubscribed", () => {
    const observedRoutes: AppRoute[] = [];
    const unsubscribe = subscribeToHashRouteChanges((route) => {
      observedRoutes.push(route);
    });

    window.history.replaceState(null, "", "#/sandbox/flat-boolean");
    window.dispatchEvent(new HashChangeEvent("hashchange"));

    expect(observedRoutes).toEqual([flatBooleanSandboxRoute]);

    unsubscribe();
    window.history.replaceState(null, "", "#/lesson");
    window.dispatchEvent(new HashChangeEvent("hashchange"));

    expect(observedRoutes).toEqual([flatBooleanSandboxRoute]);
  });

  it("applies the safe fallback when navigation has an unknown hash", () => {
    const observedRoutes: AppRoute[] = [];
    const unsubscribe = subscribeToHashRouteChanges((route) => {
      observedRoutes.push(route);
    });

    window.history.replaceState(null, "", "#/sandbox/not-supported");
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    unsubscribe();

    expect(observedRoutes).toEqual([lessonRoute]);
  });
});
