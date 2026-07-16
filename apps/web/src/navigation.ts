export type AppRoute =
  | { readonly kind: "lesson" }
  | { readonly kind: "entailment" }
  | { readonly kind: "states" }
  | { readonly kind: "maps" }
  | {
      readonly kind: "sandbox";
      readonly systemId: "flat-boolean";
    };

export const lessonRoute = { kind: "lesson" } as const satisfies AppRoute;

export const entailmentLessonRoute = {
  kind: "entailment",
} as const satisfies AppRoute;

export const statesLessonRoute = {
  kind: "states",
} as const satisfies AppRoute;

export const mapsLessonRoute = {
  kind: "maps",
} as const satisfies AppRoute;

export const flatBooleanSandboxRoute = {
  kind: "sandbox",
  systemId: "flat-boolean",
} as const satisfies AppRoute;

const lessonHash = "#/lesson";
const entailmentLessonHash = "#/lesson/entailment";
const statesLessonHash = "#/lesson/states";
const mapsLessonHash = "#/lesson/maps";
const flatBooleanSandboxHash = "#/sandbox/flat-boolean";

/** Parse only routes ScottLab currently supports. */
export function parseHashRoute(hash: string): AppRoute {
  if (hash === flatBooleanSandboxHash) {
    return flatBooleanSandboxRoute;
  }
  if (hash === entailmentLessonHash) {
    return entailmentLessonRoute;
  }
  if (hash === statesLessonHash) {
    return statesLessonRoute;
  }
  if (hash === mapsLessonHash) {
    return mapsLessonRoute;
  }

  return lessonRoute;
}

/** Produce the canonical hash for a known ScottLab route. */
export function formatHashRoute(route: AppRoute): string {
  if (route.kind === "sandbox") {
    return flatBooleanSandboxHash;
  }
  if (route.kind === "entailment") {
    return entailmentLessonHash;
  }
  if (route.kind === "states") {
    return statesLessonHash;
  }
  if (route.kind === "maps") {
    return mapsLessonHash;
  }

  return lessonHash;
}

/**
 * Subscribe to browser back, forward, and other hash changes.
 *
 * Callers can initialize their state with
 * `parseHashRoute(window.location.hash)` before subscribing.
 */
export function subscribeToHashRouteChanges(
  listener: (route: AppRoute) => void,
  target: Window = window,
): () => void {
  const handleHashChange = (): void => {
    listener(parseHashRoute(target.location.hash));
  };

  target.addEventListener("hashchange", handleHashChange);
  return () => {
    target.removeEventListener("hashchange", handleHashChange);
  };
}
