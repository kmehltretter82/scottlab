export const supportedLanguages = [
  { id: "en-GB", label: "English", flag: "🇬🇧" },
  { id: "de-DE", label: "Deutsch", flag: "🇩🇪" },
] as const;

export type Language = (typeof supportedLanguages)[number]["id"];

export const languageStorageKey = "scottlab-language";

export interface TokenText {
  readonly label: string;
  readonly accessibleName: string;
  readonly description: string;
}

export interface LessonMessages {
  readonly pageTitle: string;
  readonly pageDescription: string;
  readonly languageSelectorLabel: string;
  readonly selectLanguage: (name: string) => string;
  readonly lessonMarkerLabel: string;
  readonly lessonName: string;
  readonly eyebrow: string;
  readonly stateNoun: string;
  readonly stateDescriptions: {
    readonly bottomClosed: string;
    readonly bottomOpen: string;
    readonly informed: (token: string) => string;
  };
  readonly tokens: Readonly<Record<string, TokenText>>;
  readonly tokenRole: string;
  readonly tokensInState: string;
  readonly tokenSeparator: string;
  readonly headings: {
    readonly bottom: string;
    readonly inside: string;
    readonly choose: string;
    readonly informed: (token: string) => string;
    readonly conflict: string;
  };
  readonly explanations: {
    readonly bottom: string;
    readonly inside: string;
    readonly choose: string;
    readonly informed: (token: string, state: string) => string;
    readonly conflict: string;
  };
  readonly rejectedToken: (token: string) => string;
  readonly rejectedRole: string;
  readonly rejectedDetail: string;
  readonly conflictWitness: (tokens: string) => string;
  readonly conflictTitle: string;
  readonly chooseObservation: string;
  readonly addToken: (token: string) => string;
  readonly tokenChoiceRole: string;
  readonly oppositeQuestion: string;
  readonly tryAddingToken: (token: string) => string;
  readonly tryTokenRole: string;
  readonly actions: {
    readonly lookInside: string;
    readonly addInformation: string;
    readonly closeState: string;
    readonly back: string;
    readonly chooseAnother: string;
    readonly tryOtherPath: string;
    readonly startOver: string;
  };
  readonly footerSystem: string;
  readonly footerStage: string;
  readonly repositoryLink: string;
}

const english: LessonMessages = {
  pageTitle: "ScottLab · Begin at bottom",
  pageDescription:
    "Explore partial information through Scott information systems.",
  languageSelectorLabel: "Choose language",
  selectLanguage: (name) => `Choose ${name}`,
  lessonMarkerLabel: "Lesson 1: Bottom",
  lessonName: "Bottom",
  eyebrow: "Begin here",
  stateNoun: "state",
  stateDescriptions: {
    bottomClosed: "Bottom state: no specific information yet",
    bottomOpen: "Bottom state containing the always-present Delta token",
    informed: (token) =>
      `State containing the always-present Delta token and the ${token} token`,
  },
  tokens: {
    delta: {
      label: "Always-present token",
      accessibleName: "Always-present token",
      description: "The distinguished token present in every state.",
    },
    false: {
      label: "false",
      accessibleName: "false token",
      description: "The observation that the Boolean value is false.",
    },
    true: {
      label: "true",
      accessibleName: "true token",
      description: "The observation that the Boolean value is true.",
    },
  },
  tokenRole: "one piece of information",
  tokensInState: "Tokens in this state",
  tokenSeparator: " and ",
  headings: {
    bottom: "We do not know the Boolean value yet.",
    inside: "A token is one piece of information.",
    choose: "Choose one token.",
    informed: (token) => `Now the Boolean value is known as ${token}.`,
    conflict: "One Boolean value cannot be both true and false.",
  },
  explanations: {
    bottom:
      "We are describing one Boolean value: it can be true or false. A state is all the compatible information currently known about that value. The symbol ⊥ names the state with no specific answer yet.",
    inside:
      "A state collects the tokens that can fit together—everything known so far. This state contains only one token: Δ is always present, but does not say whether the value is true or false.",
    choose:
      "The true token means “the Boolean value is true.” The false token means “the Boolean value is false.” Choose one piece of information to add to the state.",
    informed: (token, state) =>
      `The ${token} token is one piece of information. The state ${state} collects everything known so far.`,
    conflict:
      "This system declares the true and false tokens incompatible. A state contains only compatible tokens, so the attempted token stays outside. Because Δ is always present, the only states are {Δ}, {Δ, true}, and {Δ, false}.",
  },
  rejectedToken: (token) => `Rejected ${token} token`,
  rejectedRole: "not added",
  rejectedDetail: "outside the state",
  conflictWitness: (tokens) => `Conflict witness: ${tokens}`,
  conflictTitle: "Declared incompatible",
  chooseObservation: "Choose one observation",
  addToken: (token) => `Add ${token} token`,
  tokenChoiceRole: "token",
  oppositeQuestion: "Can both observations belong to one Boolean state?",
  tryAddingToken: (token) => `Try adding ${token} token`,
  tryTokenRole: "try this token",
  actions: {
    lookInside: "Look inside",
    addInformation: "Add information",
    closeState: "Close the state",
    back: "Back",
    chooseAnother: "Choose another first token",
    tryOtherPath: "Try the other path",
    startOver: "Start over",
  },
  footerSystem: "Flat Booleans",
  footerStage: "First observation",
  repositoryLink: "View repository",
};

const german: LessonMessages = {
  pageTitle: "ScottLab · Beim Bottom beginnen",
  pageDescription:
    "Partielle Information mit Scotts Informationssystemen erkunden.",
  languageSelectorLabel: "Sprache wählen",
  selectLanguage: (name) => `${name} wählen`,
  lessonMarkerLabel: "Lektion 1: Bottom",
  lessonName: "Bottom",
  eyebrow: "Hier beginnen",
  stateNoun: "Zustand",
  stateDescriptions: {
    bottomClosed: "Bottom-Zustand: noch keine konkrete Information",
    bottomOpen: "Bottom-Zustand mit dem immer vorhandenen Delta-Token",
    informed: (token) =>
      `Zustand mit dem immer vorhandenen Delta-Token und dem ${token}-Token`,
  },
  tokens: {
    delta: {
      label: "Immer vorhandenes Token",
      accessibleName: "Immer vorhandenes Token",
      description: "Das ausgezeichnete Token, das in jedem Zustand vorkommt.",
    },
    false: {
      label: "false",
      accessibleName: "false-Token",
      description: "Die Beobachtung, dass der boolesche Wert false ist.",
    },
    true: {
      label: "true",
      accessibleName: "true-Token",
      description: "Die Beobachtung, dass der boolesche Wert true ist.",
    },
  },
  tokenRole: "ein Stück Information",
  tokensInState: "Token in diesem Zustand",
  tokenSeparator: " und ",
  headings: {
    bottom: "Wir kennen den booleschen Wert noch nicht.",
    inside: "Ein Token ist ein Stück Information.",
    choose: "Wähle ein Token.",
    informed: (token) => `Der boolesche Wert ist nun als ${token} bekannt.`,
    conflict: "Ein boolescher Wert kann nicht zugleich true und false sein.",
  },
  explanations: {
    bottom:
      "Wir beschreiben einen booleschen Wert: Er kann true oder false sein. Ein Zustand ist die gesamte miteinander verträgliche Information, die derzeit über diesen Wert bekannt ist. Das Symbol ⊥ bezeichnet den Zustand, in dem noch keine konkrete Antwort bekannt ist.",
    inside:
      "Ein Zustand sammelt die Token, die zusammenpassen – alles, was bisher bekannt ist. Dieser Zustand enthält nur ein Token: Δ ist immer vorhanden, sagt aber nicht, ob der Wert true oder false ist.",
    choose:
      "Das true-Token bedeutet: „Der boolesche Wert ist true.“ Das false-Token bedeutet: „Der boolesche Wert ist false.“ Wähle ein Stück Information aus, das zum Zustand hinzugefügt werden soll.",
    informed: (token, state) =>
      `Das ${token}-Token ist ein Stück Information. Der Zustand ${state} sammelt alles, was bisher bekannt ist.`,
    conflict:
      "Dieses System erklärt die Token true und false für unverträglich. Ein Zustand enthält nur miteinander verträgliche Token; deshalb bleibt das versuchte Token außerhalb. Da Δ immer vorhanden ist, gibt es nur die Zustände {Δ}, {Δ, true} und {Δ, false}.",
  },
  rejectedToken: (token) => `Abgelehntes ${token}-Token`,
  rejectedRole: "nicht hinzugefügt",
  rejectedDetail: "außerhalb des Zustands",
  conflictWitness: (tokens) => `Konfliktbeleg: ${tokens}`,
  conflictTitle: "Als unverträglich festgelegt",
  chooseObservation: "Eine Beobachtung wählen",
  addToken: (token) => `${token}-Token hinzufügen`,
  tokenChoiceRole: "Token",
  oppositeQuestion:
    "Können beide Beobachtungen zu einem booleschen Zustand gehören?",
  tryAddingToken: (token) => `Versuchen, das ${token}-Token hinzuzufügen`,
  tryTokenRole: "dieses Token testen",
  actions: {
    lookInside: "Hineinschauen",
    addInformation: "Information hinzufügen",
    closeState: "Zustand schließen",
    back: "Zurück",
    chooseAnother: "Anderes erstes Token wählen",
    tryOtherPath: "Den anderen Weg ausprobieren",
    startOver: "Neu beginnen",
  },
  footerSystem: "Flache boolesche Werte",
  footerStage: "Erste Beobachtung",
  repositoryLink: "Repository ansehen",
};

export const messages: Readonly<Record<Language, LessonMessages>> = {
  "en-GB": english,
  "de-DE": german,
};

export function isSupportedLanguage(value: string | null): value is Language {
  return supportedLanguages.some(({ id }) => id === value);
}
