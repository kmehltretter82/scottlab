export type AppRoute =
  | { readonly kind: "lesson" }
  | { readonly kind: "entailment" }
  | { readonly kind: "states" }
  | { readonly kind: "maps" }
  | { readonly kind: "fixedPoints" }
  | { readonly kind: "games" }
  | {
      readonly kind: "sandbox";
      readonly systemId: "flat-boolean";
      /** An optional shared state selection, as sorted token ids. */
      readonly selection?: readonly string[];
    }
  | {
      readonly kind: "gallery";
      /** A gallery system id; undefined shows the gallery index. */
      readonly systemId?: string;
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

export const fixedPointsLessonRoute = {
  kind: "fixedPoints",
} as const satisfies AppRoute;

export const gamesLessonRoute = {
  kind: "games",
} as const satisfies AppRoute;

export const flatBooleanSandboxRoute = {
  kind: "sandbox",
  systemId: "flat-boolean",
} as const satisfies AppRoute;

export const galleryRoute = { kind: "gallery" } as const satisfies AppRoute;

export function gallerySystemRoute(systemId: string): AppRoute {
  return { kind: "gallery", systemId };
}

const lessonHash = "#/lesson";
const entailmentLessonHash = "#/lesson/entailment";
const statesLessonHash = "#/lesson/states";
const mapsLessonHash = "#/lesson/maps";
const fixedPointsLessonHash = "#/lesson/fixed-points";
const gamesLessonHash = "#/lesson/games";
const flatBooleanSandboxHash = "#/sandbox/flat-boolean";
const galleryHash = "#/gallery";

const identifierPattern = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

function parseSelectionSegment(
  segment: string,
): readonly string[] | undefined {
  const tokenIds = segment.split(".");
  if (
    tokenIds.length === 0 ||
    !tokenIds.every((tokenId) => identifierPattern.test(tokenId))
  ) {
    return undefined;
  }
  return tokenIds;
}

/** Parse only routes ScottLab currently supports. */
export function parseHashRoute(hash: string): AppRoute {
  if (hash === flatBooleanSandboxHash) {
    return flatBooleanSandboxRoute;
  }
  if (hash.startsWith(`${flatBooleanSandboxHash}/`)) {
    const selection = parseSelectionSegment(
      hash.slice(flatBooleanSandboxHash.length + 1),
    );
    if (selection !== undefined) {
      return { kind: "sandbox", systemId: "flat-boolean", selection };
    }
  }
  if (hash === galleryHash) {
    return galleryRoute;
  }
  if (hash.startsWith(`${galleryHash}/`)) {
    const systemId = hash.slice(galleryHash.length + 1);
    return identifierPattern.test(systemId)
      ? { kind: "gallery", systemId }
      : galleryRoute;
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
  if (hash === fixedPointsLessonHash) {
    return fixedPointsLessonRoute;
  }
  if (hash === gamesLessonHash) {
    return gamesLessonRoute;
  }

  return lessonRoute;
}

/** Produce the canonical hash for a known ScottLab route. */
export function formatHashRoute(route: AppRoute): string {
  if (route.kind === "sandbox") {
    return route.selection === undefined || route.selection.length === 0
      ? flatBooleanSandboxHash
      : `${flatBooleanSandboxHash}/${[...route.selection].sort().join(".")}`;
  }
  if (route.kind === "gallery") {
    return route.systemId === undefined
      ? galleryHash
      : `${galleryHash}/${route.systemId}`;
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
  if (route.kind === "fixedPoints") {
    return fixedPointsLessonHash;
  }
  if (route.kind === "games") {
    return gamesLessonHash;
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
