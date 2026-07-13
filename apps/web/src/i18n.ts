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
  readonly introduction: {
    readonly pageTitle: string;
    readonly markerLabel: string;
    readonly markerName: string;
    readonly eyebrow: string;
    readonly title: string;
    readonly lead: string;
    readonly history: string;
    readonly purpose: string;
    readonly startAction: string;
    readonly sourcesLabel: string;
    readonly scottLink: string;
    readonly paperLink: string;
    readonly footerStage: string;
  };
  readonly exampleIntroduction: {
    readonly pageTitle: string;
    readonly markerLabel: string;
    readonly markerName: string;
    readonly title: string;
    readonly invitation: string;
    readonly questionLabel: string;
    readonly question: string;
    readonly trueMeaning: string;
    readonly falseMeaning: string;
    readonly definition: string;
    readonly rationale: string;
    readonly bottomExplanation: string;
    readonly startAction: string;
    readonly backAction: string;
    readonly footerStage: string;
  };
  readonly lessonMarkerLabel: string;
  readonly lessonName: string;
  readonly stateNoun: string;
  readonly stateDescriptions: {
    readonly bottomClosed: string;
    readonly bottomOpen: string;
    readonly informed: (token: string) => string;
  };
  readonly tokens: Readonly<Record<string, TokenText>>;
  readonly tokenRole: string;
  readonly tokensInState: string;
  readonly emptyStateLabel: string;
  readonly noObservations: string;
  readonly tokenSeparator: string;
  readonly modelDefinition: {
    readonly title: string;
    readonly subjectLabel: string;
    readonly subject: string;
    readonly tokensLabel: string;
    readonly ruleLabel: string;
    readonly rule: (tokenSet: string) => string;
    readonly statesLabel: string;
  };
  readonly headings: {
    readonly bottom: string;
    readonly inside: string;
    readonly choose: string;
    readonly informed: (token: string) => string;
    readonly conflict: string;
    readonly order: string;
  };
  readonly explanations: {
    readonly bottom: string;
    readonly inside: string;
    readonly choose: string;
    readonly informed: (token: string, state: string) => string;
    readonly conflict: string;
    readonly order: string;
  };
  readonly informationOrder: {
    readonly diagramLabel: string;
    readonly moreInformation: string;
    readonly selectedState: string;
    readonly bottomSummary: string;
    readonly informedSummary: (state: string, token: string) => string;
    readonly stateButton: (summary: string) => string;
    readonly bottomDetail: string;
    readonly informedDetail: (state: string) => string;
    readonly textViewSummary: string;
    readonly statesHeading: string;
    readonly edgesHeading: string;
    readonly edgeDescription: (lower: string, upper: string) => string;
    readonly footerStage: string;
  };
  readonly challenge: {
    readonly tokenMeaning: Readonly<Record<string, string>>;
    readonly heading: (meaning: string) => string;
    readonly explanation: string;
    readonly targetLabel: string;
    readonly choiceLegend: string;
    readonly incorrectHeading: (state: string) => string;
    readonly incorrectExplanation: (
      chosenMeaning: string,
      targetMeaning: string,
    ) => string;
    readonly successHeading: string;
    readonly successExplanation: (token: string, state: string) => string;
    readonly footerStage: string;
    readonly completeFooterStage: string;
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
    readonly showOrder: string;
    readonly backToConflict: string;
    readonly startChallenge: string;
    readonly retryChallenge: string;
    readonly backToOrder: string;
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
  introduction: {
    pageTitle: "ScottLab · Why information systems?",
    markerLabel: "Introduction: Dana Scott",
    markerName: "Origins",
    eyebrow: "Dana Scott · 1982",
    title: "Why Dana Scott introduced information systems",
    lead:
      "Programs can reveal results gradually. To reason mathematically about partial and recursive computation, Scott developed domains: spaces whose points carry different amounts of information.",
    history:
      "In 1982, he presented information systems as a simpler, constructive way to build and understand those domains. A designer chooses propositions—called tokens—plus consistency and entailment rules. The resulting states represent partial or complete information.",
    purpose:
      "The new presentation was intended to make domains easier to construct, more visible, and more useful in applications.",
    startAction: "Explore a first example",
    sourcesLabel: "Learn from the source",
    scottLink: "Dana Scott at CMU",
    paperLink: "Domains for Denotational Semantics (1982)",
    footerStage: "Introduction",
  },
  exampleIntroduction: {
    pageTitle: "ScottLab · A first Boolean model",
    markerLabel: "Introduction: First example",
    markerName: "Example",
    title: "Let’s make the idea concrete.",
    invitation:
      "Let’s look at the simplest useful example: a question with only two possible answers.",
    questionLabel: "A yes-or-no question",
    question: "Is the light switched on?",
    trueMeaning: "yes",
    falseMeaning: "no",
    definition:
      "The answer can be true—“yes”—or false—“no”. A value with exactly these two possibilities is called a Boolean.",
    rationale:
      "We start here because this small model already shows incomplete and conflicting information without being complicated.",
    bottomExplanation:
      "As long as we do not know the answer, our information state is ⊥. The symbol is read “bottom”. It is not a third Boolean value; it means “not known yet”.",
    startAction: "Begin the Boolean model at ⊥",
    backAction: "Back to Dana Scott",
    footerStage: "First example",
  },
  lessonMarkerLabel: "Lesson 1: Bottom",
  lessonName: "Bottom",
  stateNoun: "state",
  stateDescriptions: {
    bottomClosed: "Bottom state: no observations yet",
    bottomOpen: "Bottom state containing no observations",
    informed: (token) => `State containing the ${token} token`,
  },
  tokens: {
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
  emptyStateLabel: "Empty collection: no observations in this state",
  noObservations: "no observations",
  tokenSeparator: " and ",
  modelDefinition: {
    title: "Designed model",
    subjectLabel: "Models",
    subject: "one ordinary Boolean value",
    tokensLabel: "Tokens chosen",
    ruleLabel: "Rule declared",
    rule: (tokenSet) => `${tokenSet} is incompatible`,
    statesLabel: "States derived",
  },
  headings: {
    bottom: "We do not know the Boolean value yet.",
    inside: "This state contains no observations.",
    choose: "A token is one piece of information.",
    informed: (token) => `Now the Boolean value is known as ${token}.`,
    conflict: "One Boolean value cannot be both true and false.",
    order: "Three states, ordered by information.",
  },
  explanations: {
    bottom:
      "We designed this information system to describe one Boolean value: it can be true or false. A state is all the compatible information currently known about that value. The symbol ⊥ is read “bottom”. It names the least informative state: no specific answer is known yet.",
    inside:
      "A state collects the observations that fit together—everything known so far. Here that collection is empty: ∅. We have not made an observation about the light yet.",
    choose:
      "When designing this system, we chose tokens for its possible observations. The true token means “the Boolean value is true”; false means “the Boolean value is false.” Choose one to add to the state.",
    informed: (token, state) =>
      `The ${token} token is one piece of information. The state ${state} collects everything known so far.`,
    conflict:
      "ScottLab did not infer this from the token names. It checked the compatibility rule chosen for this model, so the attempted token stays outside. Another information system could allow both tokens and would model something different.",
    order:
      "Moving upward means gaining information. At ⊥ we know no answer. Adding true or false reaches one of two more informative states. Neither answer is above the other because they contain different information.",
  },
  informationOrder: {
    diagramLabel: "Information order of the three Boolean states",
    moreInformation: "more information",
    selectedState: "Selected state",
    bottomSummary: "⊥, shown as ∅: no observations",
    informedSummary: (state, token) =>
      `${state}: the Boolean answer is ${token}`,
    stateButton: (summary) => `Inspect state ${summary}`,
    bottomDetail:
      "At ⊥, the visible collection is ∅: no observation tells us whether the answer is true or false.",
    informedDetail: (state) =>
      `The state ${state} contains one observation, so it lies above ⊥ and carries more information.`,
    textViewSummary: "Read the diagram as text",
    statesHeading: "States",
    edgesHeading: "Steps to more information",
    edgeDescription: (lower, upper) =>
      `${lower} is directly below ${upper}.`,
    footerStage: "Information order",
  },
  challenge: {
    tokenMeaning: {
      false: "off",
      true: "on",
    },
    heading: (meaning) =>
      `Your turn: make the light definitely ${meaning}.`,
    explanation:
      "Start again at ⊥, where no answer is known. Choose the token that builds the requested state.",
    targetLabel: "Formal target",
    choiceLegend: "Choose a token for the challenge",
    incorrectHeading: (state) => `That builds ${state}.`,
    incorrectExplanation: (chosenMeaning, targetMeaning) =>
      `The light would now be definitely ${chosenMeaning}, but the challenge asks for ${targetMeaning}. Return to ⊥ and try the other observation.`,
    successHeading: "You built both possible Boolean answers.",
    successExplanation: (token, state) =>
      `Starting again at ⊥, you added the ${token} token and built ${state}. The diagram now highlights the other branch.`,
    footerStage: "Boolean challenge",
    completeFooterStage: "Challenge complete",
  },
  rejectedToken: (token) => `Rejected ${token} token`,
  rejectedRole: "not added",
  rejectedDetail: "outside the state",
  conflictWitness: (tokens) => `Conflict witness: ${tokens}`,
  conflictTitle: "Declared incompatible",
  chooseObservation: "Choose one observation",
  addToken: (token) => `Add ${token} token`,
  tokenChoiceRole: "token",
  oppositeQuestion:
    "Test the model's declared rule: can both observations belong to one Boolean state?",
  tryAddingToken: (token) => `Try adding ${token} token`,
  tryTokenRole: "try this token",
  actions: {
    lookInside: "Look inside",
    addInformation: "Meet the tokens",
    closeState: "Close the state",
    back: "Back",
    chooseAnother: "Choose another first token",
    tryOtherPath: "Try the other path",
    showOrder: "Show all possible states",
    backToConflict: "Back to the conflict",
    startChallenge: "Try a short challenge",
    retryChallenge: "Return to ⊥ and try again",
    backToOrder: "Back to the information order",
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
  introduction: {
    pageTitle: "ScottLab · Warum Informationssysteme?",
    markerLabel: "Einführung: Dana Scott",
    markerName: "Ursprung",
    eyebrow: "Dana Scott · 1982",
    title: "Warum Dana Scott Informationssysteme einführte",
    lead:
      "Programme können Ergebnisse schrittweise liefern. Um partielle und rekursive Berechnungen mathematisch zu untersuchen, entwickelte Scott Domänen: Räume, deren Punkte unterschiedlich viel Information tragen.",
    history:
      "1982 stellte er Informationssysteme als einfacheren, konstruktiven Weg vor, solche Domänen aufzubauen und zu verstehen. Ein Designer wählt Aussagen—Token genannt—sowie Verträglichkeits- und Folgerungsregeln. Die resultierenden Zustände stellen partielle oder vollständige Information dar.",
    purpose:
      "Die neue Darstellung sollte Domänen leichter konstruierbar, sichtbarer und für Anwendungen besser nutzbar machen.",
    startAction: "Ein erstes Beispiel ansehen",
    sourcesLabel: "Mehr aus den Quellen",
    scottLink: "Dana Scott an der CMU",
    paperLink: "Domains for Denotational Semantics (1982)",
    footerStage: "Einführung",
  },
  exampleIntroduction: {
    pageTitle: "ScottLab · Ein erstes Boolean-Modell",
    markerLabel: "Einführung: Erstes Beispiel",
    markerName: "Beispiel",
    title: "Wie sieht das nun konkret aus?",
    invitation:
      "Wir wollen uns dazu ein möglichst einfaches Beispiel ansehen: eine Frage mit nur zwei möglichen Antworten.",
    questionLabel: "Eine Ja/Nein-Frage",
    question: "Ist das Licht eingeschaltet?",
    trueMeaning: "ja",
    falseMeaning: "nein",
    definition:
      "Die Antwort kann true—also „ja“—oder false—also „nein“—sein. Einen Wert mit genau diesen beiden Möglichkeiten nennt man einen Boolean.",
    rationale:
      "Wir beginnen mit diesem kleinen Modell, weil es bereits unvollständige und widersprüchliche Information zeigt, ohne kompliziert zu sein.",
    bottomExplanation:
      "Solange wir die Antwort nicht kennen, ist unser Informationszustand ⊥. Das Symbol spricht man hier „Bottom“ aus. Das ist kein dritter Boolean-Wert, sondern bedeutet: „noch nicht bekannt“.",
    startAction: "Das Boolean-Modell bei ⊥ beginnen",
    backAction: "Zurück zu Dana Scott",
    footerStage: "Erstes Beispiel",
  },
  lessonMarkerLabel: "Lektion 1: Bottom",
  lessonName: "Bottom",
  stateNoun: "Zustand",
  stateDescriptions: {
    bottomClosed: "Bottom-Zustand: noch keine Beobachtungen",
    bottomOpen: "Bottom-Zustand ohne Beobachtungen",
    informed: (token) => `Zustand mit dem ${token}-Token`,
  },
  tokens: {
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
  emptyStateLabel: "Leere Menge: keine Beobachtungen in diesem Zustand",
  noObservations: "keine Beobachtungen",
  tokenSeparator: " und ",
  modelDefinition: {
    title: "Entworfenes Modell",
    subjectLabel: "Modelliert",
    subject: "einen gewöhnlichen booleschen Wert",
    tokensLabel: "Gewählte Token",
    ruleLabel: "Festgelegte Regel",
    rule: (tokenSet) => `${tokenSet} ist unverträglich`,
    statesLabel: "Abgeleitete Zustände",
  },
  headings: {
    bottom: "Wir kennen den booleschen Wert noch nicht.",
    inside: "Dieser Zustand enthält keine Beobachtungen.",
    choose: "Ein Token ist ein Stück Information.",
    informed: (token) => `Der boolesche Wert ist nun als ${token} bekannt.`,
    conflict: "Ein boolescher Wert kann nicht zugleich true und false sein.",
    order: "Drei Zustände, nach Information geordnet.",
  },
  explanations: {
    bottom:
      "Wir haben dieses Informationssystem entworfen, um einen booleschen Wert zu beschreiben: Er kann true oder false sein. Ein Zustand ist die gesamte miteinander verträgliche Information, die derzeit über diesen Wert bekannt ist. Das Symbol ⊥ spricht man hier „Bottom“ aus. Es bezeichnet den am wenigsten informativen Zustand: Noch ist keine konkrete Antwort bekannt.",
    inside:
      "Ein Zustand sammelt die Beobachtungen, die zusammenpassen – alles, was bisher bekannt ist. Hier ist diese Menge leer: ∅. Wir haben noch keine Beobachtung über das Licht gemacht.",
    choose:
      "Beim Entwerfen dieses Systems haben wir Token für seine möglichen Beobachtungen gewählt. Das true-Token bedeutet „Der boolesche Wert ist true“; false bedeutet „Der boolesche Wert ist false“. Wähle eines für den Zustand aus.",
    informed: (token, state) =>
      `Das ${token}-Token ist ein Stück Information. Der Zustand ${state} sammelt alles, was bisher bekannt ist.`,
    conflict:
      "ScottLab hat dies nicht aus den Namen der Token abgeleitet. Es hat die für dieses Modell gewählte Verträglichkeitsregel geprüft; deshalb bleibt das versuchte Token außerhalb. Ein anderes Informationssystem könnte beide Token erlauben und würde etwas anderes modellieren.",
    order:
      "Nach oben zu gehen bedeutet, Information hinzuzugewinnen. Bei ⊥ kennen wir keine Antwort. Mit true oder false erreichen wir einen von zwei informativeren Zuständen. Keiner der beiden liegt über dem anderen, denn sie enthalten unterschiedliche Information.",
  },
  informationOrder: {
    diagramLabel: "Informationsordnung der drei booleschen Zustände",
    moreInformation: "mehr Information",
    selectedState: "Ausgewählter Zustand",
    bottomSummary: "⊥, dargestellt als ∅: keine Beobachtungen",
    informedSummary: (state, token) =>
      `${state}: Die boolesche Antwort ist ${token}`,
    stateButton: (summary) => `Zustand untersuchen: ${summary}`,
    bottomDetail:
      "Bei ⊥ ist die sichtbare Menge ∅: Keine Beobachtung sagt uns, ob die Antwort true oder false ist.",
    informedDetail: (state) =>
      `Der Zustand ${state} enthält eine Beobachtung. Daher liegt er über ⊥ und trägt mehr Information.`,
    textViewSummary: "Diagramm als Text lesen",
    statesHeading: "Zustände",
    edgesHeading: "Schritte zu mehr Information",
    edgeDescription: (lower, upper) =>
      `${lower} liegt direkt unter ${upper}.`,
    footerStage: "Informationsordnung",
  },
  challenge: {
    tokenMeaning: {
      false: "ausgeschaltet",
      true: "eingeschaltet",
    },
    heading: (meaning) =>
      `Deine Aufgabe: Sorge dafür, dass das Licht sicher ${meaning} ist.`,
    explanation:
      "Beginne wieder bei ⊥, wo noch keine Antwort bekannt ist. Wähle das Token, das den gesuchten Zustand erzeugt.",
    targetLabel: "Formales Ziel",
    choiceLegend: "Ein Token für die Aufgabe wählen",
    incorrectHeading: (state) => `Damit entsteht ${state}.`,
    incorrectExplanation: (chosenMeaning, targetMeaning) =>
      `Das Licht wäre nun sicher ${chosenMeaning}, die Aufgabe verlangt aber ${targetMeaning}. Kehre zu ⊥ zurück und probiere die andere Beobachtung.`,
    successHeading: "Du hast beide möglichen booleschen Antworten gebaut.",
    successExplanation: (token, state) =>
      `Von ⊥ aus hast du das ${token}-Token hinzugefügt und ${state} gebaut. Das Diagramm hebt nun den anderen Zweig hervor.`,
    footerStage: "Boolean-Aufgabe",
    completeFooterStage: "Aufgabe gelöst",
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
    "Teste die festgelegte Regel des Modells: Können beide Beobachtungen zu einem booleschen Zustand gehören?",
  tryAddingToken: (token) => `Versuchen, das ${token}-Token hinzuzufügen`,
  tryTokenRole: "dieses Token testen",
  actions: {
    lookInside: "Hineinschauen",
    addInformation: "Die Token kennenlernen",
    closeState: "Zustand schließen",
    back: "Zurück",
    chooseAnother: "Anderes erstes Token wählen",
    tryOtherPath: "Den anderen Weg ausprobieren",
    showOrder: "Alle möglichen Zustände zeigen",
    backToConflict: "Zurück zum Konflikt",
    startChallenge: "Eine kurze Aufgabe lösen",
    retryChallenge: "Zu ⊥ zurückkehren und erneut versuchen",
    backToOrder: "Zurück zur Informationsordnung",
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
