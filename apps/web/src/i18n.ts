import type { ContinuousMapLessonCopy } from "./ContinuousMapLesson";
import type { EntailmentLessonCopy } from "./EntailmentLesson";
import type { SandboxPreviewCopy } from "./SandboxPreview";
import type { StateLessonCopy } from "./StateLesson";

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
  readonly homeAction: string;
  readonly footerNavigationLabel: string;
  readonly openSystem: (system: string) => string;
  readonly currentStageLabel: string;
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
    readonly explanation: (
      previousState: string,
      targetState: string,
    ) => string;
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
  readonly formalisation: {
    readonly pageTitle: string;
    readonly markerLabel: string;
    readonly markerName: string;
    readonly eyebrow: string;
    readonly pageProgress: (current: number, total: number) => string;
    readonly pageNavigationLabel: string;
    readonly previousAction: string;
    readonly nextAction: string;
    readonly lead: string;
    readonly continuity: string;
    readonly distinctionHeading: string;
    readonly deltaRole: string;
    readonly deltaName: string;
    readonly deltaDescription: string;
    readonly belongsTo: string;
    readonly bottomRole: string;
    readonly bottomDescription: string;
    readonly systemHeading: string;
    readonly systemIntroduction: string;
    readonly tokensLabel: string;
    readonly tokensDescription: string;
    readonly deltaLabel: string;
    readonly deltaDefinition: string;
    readonly consistencyLabel: string;
    readonly consistencyDefinition: (inconsistentSet: string) => string;
    readonly entailmentLabel: string;
    readonly entailmentDefinition: string;
    readonly entailmentRule: string;
    readonly closureHeading: string;
    readonly closureExplanation: string;
    readonly closureFormula: (bottomState: string) => string;
    readonly statesHeading: string;
    readonly beginnerColumn: string;
    readonly formalColumn: string;
    readonly meaningColumn: string;
    readonly bottomMeaning: string;
    readonly informedMeaning: (token: string) => string;
    readonly projectionNote: string;
    readonly continueAction: string;
    readonly backAction: string;
    readonly restartAction: string;
    readonly footerStage: string;
  };
  readonly sandboxPreview: SandboxPreviewCopy;
  readonly entailment: EntailmentLessonCopy;
  readonly stateLesson: StateLessonCopy;
  readonly continuousMapLesson: ContinuousMapLessonCopy;
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
    readonly backToConflict: string;
    readonly startChallenge: string;
    readonly retryChallenge: string;
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
  homeAction: "Return to the ScottLab start",
  footerNavigationLabel: "Lesson location",
  openSystem: (system) => `Restart ${system}`,
  currentStageLabel: "Current step",
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
    delta: {
      label: "always-present token",
      accessibleName: "Delta, the always-present token",
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
    explanation: (previousState, targetState) =>
      `Earlier, you built ${previousState}. This challenge uses that choice: start again at ⊥ and build the other possible state, ${targetState}.`,
    targetLabel: "Formal target",
    choiceLegend: "Choose a token for the challenge",
    incorrectHeading: (state) => `That builds ${state}.`,
    incorrectExplanation: (chosenMeaning, targetMeaning) =>
      `The light would now be definitely ${chosenMeaning}, but the challenge asks for ${targetMeaning}. Return to ⊥ and try the other observation.`,
    successHeading: "Good — that was correct.",
    successExplanation: (token, state) =>
      `Starting at ⊥, you added the ${token} token and built ${state}. The diagram now highlights the state you just built.`,
    footerStage: "Boolean challenge",
    completeFooterStage: "Challenge complete",
  },
  formalisation: {
    pageTitle: "ScottLab · The formal Boolean system",
    markerLabel: "Lesson 2: Formalisation",
    markerName: "Formalisation",
    eyebrow: "Advanced phase · Scott’s convention",
    pageProgress: (current, total) => `Part ${current} of ${total}`,
    pageNavigationLabel: "Formalisation pages",
    previousAction: "Previous",
    nextAction: "Next",
    lead:
      "The introduction hid one formal token so that you could first concentrate on partial information. From here on, we use Scott’s explicit notation and expose more of the machinery.",
    continuity:
      "The Boolean model has not changed. This is the same computation, shown without the beginner projection.",
    distinctionHeading: "Δ is a token. ⊥ is a state.",
    deltaRole: "distinguished token",
    deltaName: "always-present token",
    deltaDescription:
      "It records no specific answer about the light, but it belongs to every state.",
    belongsTo: "belongs to every state",
    bottomRole: "least state",
    bottomDescription:
      "This is a whole, consistent, entailment-closed collection of tokens.",
    systemHeading: "The four ingredients",
    systemIntroduction:
      "Scott writes an information system as a tuple. For the Boolean example, each component is now visible.",
    tokensLabel: "Token set",
    tokensDescription: "The finite observations available in this system.",
    deltaLabel: "Distinguished token",
    deltaDefinition: "The designated token that every consistent set entails.",
    consistencyLabel: "Consistency",
    consistencyDefinition: (inconsistentSet) =>
      `${inconsistentSet} is the only forbidden combination.`,
    entailmentLabel: "Entailment",
    entailmentDefinition:
      "A set entails its own tokens and always entails Δ.",
    entailmentRule: "X ⊢ a ⇔ a = Δ or a ∈ X",
    closureHeading: "Why Δ appears at bottom",
    closureExplanation:
      "The empty set is consistent—not contradictory. But in the explicit convention it is not yet closed under entailment. Closure adds Δ, producing the least state.",
    closureFormula: (bottomState) => `closure(∅) = ${bottomState} = ⊥`,
    statesHeading: "The same three states, written explicitly",
    beginnerColumn: "Introductory view",
    formalColumn: "Formal state",
    meaningColumn: "Boolean information",
    bottomMeaning: "No specific answer is known",
    informedMeaning: (token) => `The answer is ${token}`,
    projectionNote:
      "The introductory column hid Δ. It was a projection of these formal states, not a different model.",
    continueAction: "Use the explicit convention",
    backAction: "Back to the introductory diagram",
    restartAction: "Restart the introduction",
    footerStage: "Explicit Δ",
  },
  sandboxPreview: {
    pageTitle: "ScottLab · Flat Booleans sandbox preview",
    markerLabel: "Sandbox preview: Flat Booleans",
    markerName: "Sandbox",
    eyebrow: "Read-only sandbox · same computed model",
    title: "Explore the same system without the lesson rails.",
    lead:
      "All four areas read one canonical selection. Choose a state in the order or tray and watch its tokens, formal definition, and semantic explanation stay synchronized.",
    readOnlyBadge: "Read-only preview",
    workspaceLabel: "Flat Booleans read-only sandbox workspace",
    sectionNavigationLabel: "Move between sandbox areas",
    canvasTab: "Order",
    trayTab: "State",
    definitionTab: "Definition",
    explanationTab: "Explanation",
    canvasHeading: "Visual canvas",
    canvasIntroduction:
      "The computed cover relation places states with more information higher.",
    diagramLabel: "Formal information order of the flat-Boolean states",
    moreInformation: "more information",
    bottomSummary: "⊥ = {Δ}: no specific Boolean answer",
    informedSummary: (state, token) =>
      `${state}: the Boolean answer is ${token}`,
    inspectState: (summary) => `Inspect state ${summary}`,
    selectedState: "Selected state",
    textViewSummary: "Read the computed order as text",
    statesHeading: "States",
    edgesHeading: "Cover edges",
    edgeDescription: (lower, upper) => `${lower} is directly below ${upper}.`,
    trayHeading: "Experiment tray",
    trayIntroduction:
      "Select any formal state. The tray shows every token that belongs to it.",
    stateChoicesLabel: "Choose a state to inspect",
    selectState: (state) => `Select state ${state}`,
    formalState: "Formal state",
    observationRole: "specific observation",
    deltaRole: "always-present token",
    definitionHeading: "Definition panel",
    lockedLabel: "Locked",
    editingLater:
      "Editing arrives in a later milestone; this view exposes exactly the model used by the lesson.",
    tokensLabel: "Tokens",
    consistencyLabel: "Consistency",
    entailmentLabel: "Entailment",
    consistencyRule: (set) => `${set} ∉ Con`,
    entailmentRule: "X ⊢ a ⇔ a = Δ or a ∈ X",
    explanationHeading: "Explanation panel",
    plainLanguageLabel:
      "Plain language and the core derivation for the selected state.",
    bottomExplanation:
      "This is bottom: the least state. It contains Δ, but no token that answers whether the Boolean is true or false.",
    informedExplanation: (token) =>
      `This state adds the ${token} observation to Δ, so the Boolean answer is known.`,
    traceHeading: "Core closure trace",
    deltaTrace: "Every consistent input entails the always-present token Δ.",
    reflexivityTrace: (token) =>
      `The selected observation entails itself: ${token}.`,
    declaredRuleTrace: (ruleId, token) =>
      `Rule ${ruleId} entails ${token}.`,
    cutTrace: (token) =>
      `A transitive chain of entailments derives ${token}.`,
    openAction: "Open the read-only sandbox",
    backAction: "Back to the focused lesson",
    restartAction: "Restart lesson",
    footerSystem: "Flat Booleans",
    footerStage: "Read-only sandbox",
  },
  entailment: {
    pageTitle: "ScottLab · Entailment in action",
    markerLabel: "Lesson 3: Entailment",
    markerName: "Entailment",
    footerSystem: "Access Permissions",
    footerStage: "Closure trace",
    eyebrow: "Advanced lesson · a rule-driven system",
    title: "Watch one observation teach the state more.",
    lead:
      "This is not another datatype. It is a small access-permissions model whose declared rules turn one observed role into two guaranteed permissions. Step through the closure to see exactly why each token appears.",
    workspaceLabel: "Interactive access-permissions entailment lesson",
    tokens: {
      delta: {
        label: "always-present token",
        accessibleName: "Delta, the always-present token",
        description: "The distinguished token present in every state.",
      },
      administrator: {
        label: "administrator",
        accessibleName: "administrator token",
        description: "The observed role assigned to this user.",
      },
      "may-edit": {
        label: "may edit",
        accessibleName: "may edit token",
        description: "The user has permission to change content.",
      },
      "may-view": {
        label: "may view",
        accessibleName: "may view token",
        description: "The user has permission to read content.",
      },
    },
    rules: {
      "administrator-entails-may-edit": {
        label: "Administrators may edit",
        explanation:
          "The declared administrator rule guarantees edit permission.",
      },
      "may-edit-entails-may-view": {
        label: "Editors may view",
        explanation: "The declared edit rule guarantees view permission.",
      },
    },
    bottom: {
      heading: "Begin with no specific permission information.",
      explanation:
        "At bottom, the state contains only Δ. No role or permission has been observed yet.",
      stateLabel: "Bottom state {Δ}",
      specificObservations: "No specific permission observations",
    },
    state: {
      currentStateLabel: "Current formal state",
      alwaysPresentRole: "always present",
      chosenPremiseRole: "chosen premise",
      presentConclusionRole: "conclusion in state",
      pendingConclusionRole: "not yet in state",
    },
    trace: {
      heading: "Closure trace",
      navigationLabel: "Closure trace controls",
      progress: (current, total) => `Trace frame ${current} of ${total}`,
      premiseLabel: "Premise present",
      pendingRuleLabel: "Rule pending",
      activeRuleLabel: "Active rule",
      appliedRuleLabel: "Rule applied",
      premiseHeading: (premises) => `The premise ${premises} is available.`,
      premiseExplanation: (premises) =>
        `ScottLab first checks that ${premises} is already contained in the current state.`,
      activeRuleHeading: (rule) => `Apply “${rule}”.`,
      activeRuleExplanation: (premises, conclusion) =>
        `Because ${premises} is present, this declared rule now justifies ${conclusion}.`,
      conclusionHeading: (conclusion) => `The state learns ${conclusion}.`,
      conclusionExplanation: (conclusion, state) =>
        `The conclusion ${conclusion} joins the state, producing ${state}. It can now support another rule.`,
      completeHeading: "Closure has stabilized.",
      completeExplanation: (state) =>
        `No declared rule can add another token. The closed state is ${state}.`,
      closureFunctionName: "closure",
      structuredHeading: "Ordered semantic derivation",
      structuredInitialState: (state) => `Start at bottom ${state}.`,
      structuredInputStep: (step, input, state) =>
        `Step ${step}: observe ${input}. Reflexivity adds it to the closure, producing ${state}.`,
      structuredStep: (step, premises, rule, conclusion) =>
        `Step ${step}: ${premises} enables “${rule}”, which entails ${conclusion}.`,
      structuredFinalState: (state) => `Closure stabilizes at ${state}.`,
    },
    definition: {
      summary: "Open the formal definition and full derivation",
      heading: "Rule-driven definition",
      introduction:
        "The fixture declares four tokens and two rules. The core supplies reflexivity, Δ, and transitive closure.",
      tokensHeading: "Token set",
      consistencyHeading: "Consistency",
      consistencyValue: "Every finite token set is consistent in this model.",
      rulesHeading: "Declared rules",
    },
    challenge: {
      eyebrow: "Short challenge",
      heading: "Which token needed both declared rules?",
      explanation:
        "Start from administrator and follow the chain. Select the conclusion that appears only after rule one supplies the premise for rule two.",
      choiceLegend: "Choose the two-step conclusion",
      chooseToken: (token) => `Choose ${token}`,
      correctHeading: "Exactly — that is the two-step consequence.",
      correctExplanation: (token) =>
        `${token} needs the administrator-to-edit rule and then the edit-to-view rule.`,
      incorrectHeading: "That token has a different role in the trace.",
      incorrectExplanation: (chosenToken, targetToken) =>
        `${chosenToken} is not the conclusion reached only after both rules. Inspect the chain and try ${targetToken}.`,
    },
    actions: {
      startLesson: "Continue to entailment",
      addAdministrator: "Add the administrator premise",
      previous: "Previous frame",
      next: "Next frame",
      showCompleteClosure: "Show the complete closure",
      replay: "Replay from the premise",
      continueStates: "Continue to states",
      back: "Back to formalisation",
      openSandbox: "Review the Boolean sandbox",
    },
  },
  stateLesson: {
    pageTitle: "ScottLab · What makes a state?",
    markerLabel: "Lesson 4: States",
    markerName: "States",
    footerSystem: "Editing Policy",
    footerStage: "State inspection",
    eyebrow: "Advanced lesson · consistency and closure",
    title: "A selection is not automatically a state.",
    lead:
      "A state must pass two independent checks: its tokens must be mutually consistent, and every consequence must already be included. Change this policy selection and let the semantic core explain each verdict.",
    workspaceLabel: "Interactive editing-policy states lesson",
    tokens: {
      administrator: {
        label: "administrator",
        accessibleName: "administrator token",
        description: "The account has the administrator role.",
      },
      delta: {
        label: "always-present token",
        accessibleName: "Delta, the always-present token",
        description: "The distinguished token required in every state.",
      },
      "may-edit": {
        label: "may edit",
        accessibleName: "may edit token",
        description: "The policy permits editing.",
      },
      "read-only": {
        label: "read only",
        accessibleName: "read only token",
        description: "The policy forbids editing.",
      },
    },
    selection: {
      heading: "Arbitrary token selection",
      introduction:
        "Toggle any token. This is a candidate set until both state conditions pass.",
      selectedLabel: "Selected tokens",
      toggleLegend: "Change the candidate selection",
      addToken: (token) => `Add ${token}`,
      removeToken: (token) => `Remove ${token}`,
      emptySelection: "No tokens selected",
    },
    analysis: {
      heading: "Two-condition state test",
      introduction:
        "The core checks consistency first. Only a consistent selection can be tested for entailment closure.",
      consistencyCriterion: "Mutually consistent",
      closureCriterion: "Closed under entailment",
      stateVerdict: "Is a state",
      passes: "passes",
      fails: "fails",
      notChecked: "not checked",
      inconsistentHeading: "This selection is inconsistent.",
      inconsistentExplanation: (witness) =>
        `${witness} is a declared conflict, so these observations cannot belong to one state.`,
      notClosedHeading: "Consistent, but not yet a state.",
      notClosedExplanation: (missing) =>
        `Closure adds ${missing}. A state must already contain every entailed token.`,
      stateHeading: "This selection is a state.",
      stateExplanation: (state) =>
        `${state} is consistent and unchanged by closure.`,
      witnessLabel: "Concrete conflict witness",
      missingLabel: "Missing entailed tokens",
    },
    definition: {
      heading: "Editing-policy definition",
      introduction:
        "The declared conflicts and rule below drive every visible verdict.",
      tokensHeading: "Token set",
      conflictsHeading: "Minimal conflicts",
      rulesHeading: "Declared entailment",
      stateCriterionHeading: "State criterion",
      stateCriterion:
        "A state is a consistent token set that is closed under entailment.",
    },
    explanation: {
      heading: "Why the first selection fails",
      guide:
        "Administrator is compatible with Δ, but the declared rule also entails may edit. Apply closure to see the smallest state containing the selection.",
      closedExample:
        "Closure supplied the missing permission. The result now passes consistency and closure together.",
      challenge:
        "Make the starting selection a state yourself. Toggle tokens and use the live witness or missing-token explanation as evidence.",
      complete: (token) =>
        `You added ${token}, the consequence required by the administrator rule. The candidate is now a state.`,
      structuredSummary: "Read the core analysis as text",
      structuredHeading: "Ordered state analysis",
      selectedStep: (selection) => `Inspect the candidate ${selection}.`,
      consistencyPass: "No declared conflict is contained in the candidate.",
      consistencyFail: (witness) =>
        `Consistency fails with the concrete witness ${witness}.`,
      distinguishedStep: (token, state) =>
        `The distinguished-token law adds ${token}, producing ${state}.`,
      closureStep: (premises, conclusion, state) =>
        `${premises} entails ${conclusion}; adding it produces ${state}.`,
      closureComplete: (state) => `Closure stabilizes at ${state}.`,
      closureResultLabel: "closure",
    },
    challenge: {
      eyebrow: "Manipulation challenge",
      heading: "Repair the selection without using automatic closure.",
      explanation: (selection) =>
        `Begin again from ${selection}. Add the required consequence while keeping the administrator premise.`,
      wrongState:
        "That is a state, but it removes the administrator premise. Keep the premise and repair its closure instead.",
      successHeading: "You built a consistent, closed state.",
    },
    actions: {
      applyClosure: "Complete this selection with closure",
      beginChallenge: "Repair it yourself",
      continueMaps: "Continue to continuous maps",
      resetSelection: "Reset the selection",
      replayGuide: "Replay the state test",
      back: "Back to entailment",
    },
  },
  continuousMapLesson: {
    pageTitle: "ScottLab · Continuous maps in action",
    markerLabel: "Lesson 5: Continuous maps",
    markerName: "Continuous maps",
    footerSystem: "Flat Boolean negation",
    footerStage: "Incremental mapping",
    eyebrow: "Advanced lesson · finite support",
    title: "Refine the input; watch the output learn.",
    lead:
      "A continuous map consumes one state and produces another. Keep the two Boolean copies separate while exact negation turns each finite input observation into justified output information.",
    workspaceLabel: "Interactive Boolean-negation continuous-maps lesson",
    tokens: {
      delta: {
        label: "always-present token",
        accessibleName: "Delta, the always-present token",
        description: "The distinguished token contained in every state.",
      },
      false: {
        label: "false",
        accessibleName: "false token",
        description: "The observation that this Boolean is false.",
      },
      true: {
        label: "true",
        accessibleName: "true token",
        description: "The observation that this Boolean is true.",
      },
    },
    rules: {
      "false-maps-to-true": {
        label: "false input maps to true output",
        explanation:
          "A false observation in the source justifies true in the separate target copy.",
      },
      "true-maps-to-false": {
        label: "true input maps to false output",
        explanation:
          "A true observation in the source justifies false in the separate target copy.",
      },
    },
    canvas: {
      heading: "Two copies, one mapping",
      introduction:
        "The left state is input. The right state is newly computed output; tokens never move between one shared container.",
      inputCopyLabel: "Input copy A",
      outputCopyLabel: "Output copy B",
      systemName: "Flat Booleans",
      mappingName: "not",
      stateLabel: "Formal state",
      bottomBadge: "bottom · no specific Boolean information",
      informativeBadge: "informative state",
      dormantRule: "no informative generator active",
      pendingRule: "generator ready",
      activeRule: "generator active",
      appliedRule: "generator applied",
      diagramLabel: (inputState, outputState, ruleStatus) =>
        `Boolean input ${inputState} maps to output ${outputState}; ${ruleStatus}.`,
    },
    experiment: {
      heading: "Refine the source state",
      introduction:
        "Begin at bottom, then reveal the causal premise, generator, and output one frame at a time.",
      inputStateLabel: "Current input",
      outputStateLabel: "Visible output",
      navigationLabel: "Mapping trace controls",
      guideProgress: (current, total) =>
        `Guided mapping frame ${current} of ${total}`,
      challengeProgress: (current, total) =>
        `Challenge frame ${current} of ${total}`,
    },
    challenge: {
      eyebrow: "Short challenge",
      heading: "Which input makes the output true?",
      introduction:
        "Choose one informative source state, inspect its generator, and finish the trace. Remember that input and output are separate Boolean copies.",
      choiceLegend: "Choose the input observation",
      chooseInput: (token) => `Choose ${token} as the input observation`,
      correctBadge: "Correct finite support",
      incorrectBadge: "Valid map result, different target",
    },
    definition: {
      heading: "Exact finite-generator definition",
      introduction:
        "The persisted fixture is exact. Its two positive generators and target closure determine every result shown here.",
      sourceStatesHeading: "Source states",
      targetStatesHeading: "Target states",
      generatorsHeading: "Declared generators",
      orderHeading: "Information order",
      orderExplanation:
        "States are ordered by inclusion: adding a compatible token means learning more.",
      incomparabilityHeading: "The branches are incomparable",
      incomparabilityExplanation:
        "True and false do not lie above one another. Each lies only above bottom.",
      continuityHeading: "Why this map is continuous",
      continuityExplanation:
        "Positive finite premises persist under refinement, and target closure is monotone. On this finite state domain, that monotonicity gives Scott continuity. Negation swaps incomparable branches; it does not reverse their order.",
    },
    explanation: {
      heading: "Causal mapping trace",
      introduction:
        "The same structured core computation drives the diagram, narration, and complete text trace.",
      bottomHeading: "Bottom maps to bottom.",
      bottomExplanation: (state) =>
        `With no specific input observation, neither informative generator applies. Target closure still supplies ${state}.`,
      challengeReadyHeading: "Now make the output true.",
      challengeReadyExplanation:
        "Select the source observation whose declared generator concludes true, then inspect all three causal frames.",
      premiseHeading: (token) => `The input contains ${token}.`,
      premiseExplanation: (token, state) =>
        `${token} is present in the source state ${state}, so a generator with that finite premise can activate.`,
      ruleHeading: (rule) => `Activate “${rule}”.`,
      ruleExplanation: (rule, inputState, conclusion) =>
        `The finite support ${inputState} satisfies “${rule}”, which justifies ${conclusion} in the target copy.`,
      outputHeading: (state) => `The target closes to ${state}.`,
      outputExplanation: (token, state) =>
        `The justified ${token} observation joins target Δ, producing the separate output state ${state}.`,
      incorrectHeading: "That input produces the other Boolean branch.",
      incorrectExplanation: (input, output, expectedInput) =>
        `${input} correctly maps to ${output}, but the challenge asks for true output. Choose ${expectedInput} as the source observation.`,
      completeHeading: "You computed Boolean negation from finite support.",
      completeExplanation: (inputState, outputState) =>
        `${inputState} activates one declared generator and target closure produces ${outputState}.`,
      structuredSummary: "Read the complete mapping derivation as text",
      structuredHeading: "Ordered semantic mapping derivation",
      structuredInput: (state) => `Use source state ${state}.`,
      structuredDeltaStep: (step, token, state) =>
        `Step ${step}: target closure adds distinguished token ${token}, producing ${state}.`,
      structuredMappingStep: (
        step,
        sourceSupport,
        rule,
        conclusion,
        state,
      ) =>
        `Step ${step}: source support ${sourceSupport} activates “${rule}”; add ${conclusion} to produce ${state}.`,
      structuredEntailmentStep: (step, premises, conclusion, state) =>
        `Step ${step}: target premises ${premises} entail ${conclusion}, producing ${state}.`,
      structuredResult: (state) => `Target closure stabilizes at ${state}.`,
    },
    actions: {
      startGuide: "Refine the input to true",
      previous: "Previous frame",
      next: "Next frame",
      skipGuide: "Show the guided result",
      showResult: "Show this map result",
      beginChallenge: "Begin the challenge",
      finishChallenge: "Finish the challenge",
      replay: "Replay from bottom",
      back: "Back to states",
      openSandbox: "Review the Boolean sandbox",
    },
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
    backToConflict: "Back to the conflict",
    startChallenge: "Try a short challenge",
    retryChallenge: "Return to ⊥ and try again",
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
  homeAction: "Zur ScottLab-Startseite zurückkehren",
  footerNavigationLabel: "Position im Lernpfad",
  openSystem: (system) => `${system} neu starten`,
  currentStageLabel: "Aktueller Schritt",
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
    delta: {
      label: "stets vorhandenes Token",
      accessibleName: "Delta, das stets vorhandene Token",
      description: "Das ausgezeichnete Token, das zu jedem Zustand gehört.",
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
    explanation: (previousState, targetState) =>
      `Zuvor hast du ${previousState} gebaut. Diese Aufgabe knüpft an diese Wahl an: Beginne wieder bei ⊥ und baue den anderen möglichen Zustand ${targetState}.`,
    targetLabel: "Formales Ziel",
    choiceLegend: "Ein Token für die Aufgabe wählen",
    incorrectHeading: (state) => `Damit entsteht ${state}.`,
    incorrectExplanation: (chosenMeaning, targetMeaning) =>
      `Das Licht wäre nun sicher ${chosenMeaning}, die Aufgabe verlangt aber ${targetMeaning}. Kehre zu ⊥ zurück und probiere die andere Beobachtung.`,
    successHeading: "Gut – das war richtig.",
    successExplanation: (token, state) =>
      `Von ⊥ aus hast du das ${token}-Token hinzugefügt und ${state} gebaut. Das Diagramm hebt nun den Zustand hervor, den du gerade gebaut hast.`,
    footerStage: "Boolean-Aufgabe",
    completeFooterStage: "Aufgabe gelöst",
  },
  formalisation: {
    pageTitle: "ScottLab · Das formale Boolean-System",
    markerLabel: "Lektion 2: Formalisierung",
    markerName: "Formalisierung",
    eyebrow: "Fortgeschrittene Phase · Scotts Konvention",
    pageProgress: (current, total) => `Teil ${current} von ${total}`,
    pageNavigationLabel: "Seiten der Formalisierung",
    previousAction: "Zurück",
    nextAction: "Weiter",
    lead:
      "In der Einführung blieb ein formales Token verborgen, damit du dich zunächst auf partielle Information konzentrieren konntest. Von jetzt an verwenden wir Scotts explizite Notation und zeigen mehr von der mathematischen Struktur.",
    continuity:
      "Das Boolean-Modell hat sich nicht geändert. Es ist dieselbe Berechnung, jetzt ohne die Projektion für Einsteiger.",
    distinctionHeading: "Δ ist ein Token. ⊥ ist ein Zustand.",
    deltaRole: "ausgezeichnetes Token",
    deltaName: "stets vorhandenes Token",
    deltaDescription:
      "Es enthält keine konkrete Antwort über das Licht, gehört aber zu jedem Zustand.",
    belongsTo: "gehört zu jedem Zustand",
    bottomRole: "kleinster Zustand",
    bottomDescription:
      "Dies ist eine ganze, verträgliche und unter Folgerung abgeschlossene Menge von Token.",
    systemHeading: "Die vier Bestandteile",
    systemIntroduction:
      "Scott schreibt ein Informationssystem als Tupel. Beim Boolean-Beispiel sind nun alle Bestandteile sichtbar.",
    tokensLabel: "Tokenmenge",
    tokensDescription: "Die endlichen Beobachtungen dieses Systems.",
    deltaLabel: "Ausgezeichnetes Token",
    deltaDefinition:
      "Das festgelegte Token, das aus jeder verträglichen Menge folgt.",
    consistencyLabel: "Verträglichkeit",
    consistencyDefinition: (inconsistentSet) =>
      `${inconsistentSet} ist die einzige verbotene Kombination.`,
    entailmentLabel: "Folgerung",
    entailmentDefinition:
      "Eine Menge impliziert ihre eigenen Token und immer auch Δ.",
    entailmentRule: "X ⊢ a ⇔ a = Δ oder a ∈ X",
    closureHeading: "Warum Δ im Bottom erscheint",
    closureExplanation:
      "Die leere Menge ist verträglich – nicht widersprüchlich. In der expliziten Konvention ist sie jedoch noch nicht unter Folgerung abgeschlossen. Der Abschluss fügt Δ hinzu und erzeugt den kleinsten Zustand.",
    closureFormula: (bottomState) => `Abschluss(∅) = ${bottomState} = ⊥`,
    statesHeading: "Dieselben drei Zustände, nun explizit geschrieben",
    beginnerColumn: "Einführende Darstellung",
    formalColumn: "Formaler Zustand",
    meaningColumn: "Boolean-Information",
    bottomMeaning: "Keine konkrete Antwort ist bekannt",
    informedMeaning: (token) => `Die Antwort ist ${token}`,
    projectionNote:
      "In der einführenden Spalte war Δ ausgeblendet. Sie war eine Projektion dieser formalen Zustände und kein anderes Modell.",
    continueAction: "Die explizite Konvention verwenden",
    backAction: "Zurück zum einführenden Diagramm",
    restartAction: "Die Einführung neu beginnen",
    footerStage: "Explizites Δ",
  },
  sandboxPreview: {
    pageTitle: "ScottLab · Schreibgeschützte Boolean-Sandbox",
    markerLabel: "Sandbox-Vorschau: Flache boolesche Werte",
    markerName: "Sandbox",
    eyebrow: "Schreibgeschützte Sandbox · dasselbe berechnete Modell",
    title: "Dasselbe System nun ohne den vorgegebenen Lernpfad erkunden.",
    lead:
      "Alle vier Bereiche verwenden dieselbe Auswahl. Wähle einen Zustand in der Ordnung oder Ablage; seine Token, die formale Definition und die semantische Erklärung bleiben synchron.",
    readOnlyBadge: "Schreibgeschützte Vorschau",
    workspaceLabel:
      "Schreibgeschützte Sandbox für flache boolesche Werte",
    sectionNavigationLabel: "Zwischen den Sandbox-Bereichen wechseln",
    canvasTab: "Ordnung",
    trayTab: "Zustand",
    definitionTab: "Definition",
    explanationTab: "Erklärung",
    canvasHeading: "Visuelle Fläche",
    canvasIntroduction:
      "Die berechnete Überdeckungsrelation ordnet informativere Zustände weiter oben an.",
    diagramLabel: "Formale Informationsordnung der booleschen Zustände",
    moreInformation: "mehr Information",
    bottomSummary: "⊥ = {Δ}: keine konkrete boolesche Antwort",
    informedSummary: (state, token) =>
      `${state}: Die boolesche Antwort ist ${token}`,
    inspectState: (summary) => `Zustand untersuchen: ${summary}`,
    selectedState: "Ausgewählter Zustand",
    textViewSummary: "Berechnete Ordnung als Text lesen",
    statesHeading: "Zustände",
    edgesHeading: "Überdeckungskanten",
    edgeDescription: (lower, upper) => `${lower} liegt direkt unter ${upper}.`,
    trayHeading: "Experimentierablage",
    trayIntroduction:
      "Wähle einen formalen Zustand. Die Ablage zeigt alle Token, die zu ihm gehören.",
    stateChoicesLabel: "Einen Zustand zur Untersuchung wählen",
    selectState: (state) => `Zustand ${state} auswählen`,
    formalState: "Formaler Zustand",
    observationRole: "konkrete Beobachtung",
    deltaRole: "stets vorhandenes Token",
    definitionHeading: "Definitionsbereich",
    lockedLabel: "Gesperrt",
    editingLater:
      "Bearbeitung folgt in einem späteren Meilenstein; diese Ansicht zeigt genau das im Lernpfad verwendete Modell.",
    tokensLabel: "Token",
    consistencyLabel: "Verträglichkeit",
    entailmentLabel: "Folgerung",
    consistencyRule: (set) => `${set} ∉ Con`,
    entailmentRule: "X ⊢ a ⇔ a = Δ oder a ∈ X",
    explanationHeading: "Erklärungsbereich",
    plainLanguageLabel:
      "Alltagssprache und die Kernherleitung für den ausgewählten Zustand.",
    bottomExplanation:
      "Dies ist Bottom, der kleinste Zustand. Er enthält Δ, aber kein Token, das beantwortet, ob der boolesche Wert true oder false ist.",
    informedExplanation: (token) =>
      `Dieser Zustand fügt die Beobachtung ${token} zu Δ hinzu; die boolesche Antwort ist somit bekannt.`,
    traceHeading: "Abschlussspur aus dem semantischen Kern",
    deltaTrace:
      "Jede verträgliche Eingabe impliziert das stets vorhandene Token Δ.",
    reflexivityTrace: (token) =>
      `Die ausgewählte Beobachtung impliziert sich selbst: ${token}.`,
    declaredRuleTrace: (ruleId, token) =>
      `Die Regel ${ruleId} impliziert ${token}.`,
    cutTrace: (token) =>
      `Eine transitive Folgerungskette leitet ${token} her.`,
    openAction: "Schreibgeschützte Sandbox öffnen",
    backAction: "Zurück zum geführten Lernpfad",
    restartAction: "Lernpfad neu starten",
    footerSystem: "Flache boolesche Werte",
    footerStage: "Schreibgeschützte Sandbox",
  },
  entailment: {
    pageTitle: "ScottLab · Folgerung in Aktion",
    markerLabel: "Lektion 3: Folgerung",
    markerName: "Folgerung",
    footerSystem: "Zugriffsrechte",
    footerStage: "Abschlussspur",
    eyebrow: "Fortgeschrittene Lektion · ein regelbasiertes System",
    title: "Beobachte, wie der Zustand aus einer Beobachtung mehr lernt.",
    lead:
      "Dies ist kein weiterer Datentyp, sondern ein kleines Modell für Zugriffsrechte. Seine festgelegten Regeln machen aus einer beobachteten Rolle zwei garantierte Rechte. Gehe den Abschluss schrittweise durch und sieh genau, warum jedes Token erscheint.",
    workspaceLabel: "Interaktive Folgerungslektion zu Zugriffsrechten",
    tokens: {
      delta: {
        label: "stets vorhandenes Token",
        accessibleName: "Delta, das stets vorhandene Token",
        description: "Das ausgezeichnete Token in jedem Zustand.",
      },
      administrator: {
        label: "Administrator",
        accessibleName: "Administrator-Token",
        description: "Die für diesen Benutzer beobachtete Rolle.",
      },
      "may-edit": {
        label: "darf bearbeiten",
        accessibleName: "Darf-bearbeiten-Token",
        description: "Der Benutzer darf Inhalte verändern.",
      },
      "may-view": {
        label: "darf ansehen",
        accessibleName: "Darf-ansehen-Token",
        description: "Der Benutzer darf Inhalte lesen.",
      },
    },
    rules: {
      "administrator-entails-may-edit": {
        label: "Administratoren dürfen bearbeiten",
        explanation:
          "Die festgelegte Administratorregel garantiert das Bearbeitungsrecht.",
      },
      "may-edit-entails-may-view": {
        label: "Bearbeiter dürfen ansehen",
        explanation:
          "Die festgelegte Bearbeitungsregel garantiert das Leserecht.",
      },
    },
    bottom: {
      heading: "Beginne ohne konkrete Information über Zugriffsrechte.",
      explanation:
        "Bei Bottom enthält der Zustand nur Δ. Es wurde noch keine Rolle und kein Recht beobachtet.",
      stateLabel: "Bottom-Zustand {Δ}",
      specificObservations: "Keine konkreten Beobachtungen zu Rechten",
    },
    state: {
      currentStateLabel: "Aktueller formaler Zustand",
      alwaysPresentRole: "stets vorhanden",
      chosenPremiseRole: "gewählte Prämisse",
      presentConclusionRole: "Konsequenz im Zustand",
      pendingConclusionRole: "noch nicht im Zustand",
    },
    trace: {
      heading: "Abschlussspur",
      navigationLabel: "Steuerung der Abschlussspur",
      progress: (current, total) => `Spurbild ${current} von ${total}`,
      premiseLabel: "Prämisse vorhanden",
      pendingRuleLabel: "Regel ausstehend",
      activeRuleLabel: "Aktive Regel",
      appliedRuleLabel: "Regel angewendet",
      premiseHeading: (premises) => `Die Prämisse ${premises} ist vorhanden.`,
      premiseExplanation: (premises) =>
        `ScottLab prüft zuerst, dass ${premises} bereits im aktuellen Zustand enthalten ist.`,
      activeRuleHeading: (rule) => `„${rule}“ anwenden.`,
      activeRuleExplanation: (premises, conclusion) =>
        `Weil ${premises} vorhanden ist, begründet diese festgelegte Regel nun ${conclusion}.`,
      conclusionHeading: (conclusion) => `Der Zustand lernt ${conclusion}.`,
      conclusionExplanation: (conclusion, state) =>
        `Die Konsequenz ${conclusion} kommt zum Zustand hinzu und erzeugt ${state}. Sie kann nun eine weitere Regel stützen.`,
      completeHeading: "Der Abschluss hat sich stabilisiert.",
      completeExplanation: (state) =>
        `Keine festgelegte Regel kann ein weiteres Token hinzufügen. Der abgeschlossene Zustand ist ${state}.`,
      closureFunctionName: "Abschluss",
      structuredHeading: "Geordnete semantische Herleitung",
      structuredInitialState: (state) => `Bei Bottom ${state} beginnen.`,
      structuredInputStep: (step, input, state) =>
        `Schritt ${step}: ${input} beobachten. Durch Reflexivität kommt das Token zum Abschluss hinzu; es entsteht ${state}.`,
      structuredStep: (step, premises, rule, conclusion) =>
        `Schritt ${step}: ${premises} aktiviert „${rule}“; daraus folgt ${conclusion}.`,
      structuredFinalState: (state) =>
        `Der Abschluss stabilisiert sich bei ${state}.`,
    },
    definition: {
      summary: "Formale Definition und vollständige Herleitung öffnen",
      heading: "Regelbasierte Definition",
      introduction:
        "Die Beispieldatei legt vier Token und zwei Regeln fest. Reflexivität, Δ und den transitiven Abschluss liefert der Kern.",
      tokensHeading: "Tokenmenge",
      consistencyHeading: "Verträglichkeit",
      consistencyValue:
        "In diesem Modell ist jede endliche Tokenmenge verträglich.",
      rulesHeading: "Festgelegte Regeln",
    },
    challenge: {
      eyebrow: "Kurze Aufgabe",
      heading: "Welches Token benötigte beide festgelegten Regeln?",
      explanation:
        "Beginne beim Administrator und folge der Kette. Wähle die Konsequenz, die erst erscheint, nachdem Regel eins die Prämisse für Regel zwei geliefert hat.",
      choiceLegend: "Die Konsequenz nach zwei Schritten wählen",
      chooseToken: (token) => `${token} wählen`,
      correctHeading: "Genau – das ist die Konsequenz nach zwei Schritten.",
      correctExplanation: (token) =>
        `${token} benötigt zuerst die Administrator-zu-Bearbeiten-Regel und dann die Bearbeiten-zu-Ansehen-Regel.`,
      incorrectHeading: "Dieses Token hat in der Spur eine andere Rolle.",
      incorrectExplanation: (chosenToken, targetToken) =>
        `${chosenToken} ist nicht die Konsequenz, die erst nach beiden Regeln erreicht wird. Untersuche die Kette und versuche ${targetToken}.`,
    },
    actions: {
      startLesson: "Mit der Folgerung fortfahren",
      addAdministrator: "Die Administrator-Prämisse hinzufügen",
      previous: "Vorheriges Bild",
      next: "Nächstes Bild",
      showCompleteClosure: "Vollständigen Abschluss zeigen",
      replay: "Bei der Prämisse erneut beginnen",
      continueStates: "Mit Zuständen fortfahren",
      back: "Zurück zur Formalisierung",
      openSandbox: "Boolean-Sandbox erneut ansehen",
    },
  },
  stateLesson: {
    pageTitle: "ScottLab · Was macht einen Zustand aus?",
    markerLabel: "Lektion 4: Zustände",
    markerName: "Zustände",
    footerSystem: "Bearbeitungsrichtlinie",
    footerStage: "Zustandsprüfung",
    eyebrow: "Fortgeschrittene Lektion · Konsistenz und Abschluss",
    title: "Eine Auswahl ist nicht automatisch ein Zustand.",
    lead:
      "Ein Zustand muss zwei unabhängige Prüfungen bestehen: Seine Token müssen miteinander verträglich sein und jede Konsequenz muss bereits enthalten sein. Verändere diese Richtlinienauswahl und lass den semantischen Kern jedes Urteil erklären.",
    workspaceLabel: "Interaktive Zustandslektion zur Bearbeitungsrichtlinie",
    tokens: {
      administrator: {
        label: "Administrator",
        accessibleName: "Administrator-Token",
        description: "Das Konto hat die Administratorrolle.",
      },
      delta: {
        label: "stets vorhandenes Token",
        accessibleName: "Delta, das stets vorhandene Token",
        description: "Das ausgezeichnete Token, das jeder Zustand benötigt.",
      },
      "may-edit": {
        label: "darf bearbeiten",
        accessibleName: "Darf-bearbeiten-Token",
        description: "Die Richtlinie erlaubt das Bearbeiten.",
      },
      "read-only": {
        label: "nur lesen",
        accessibleName: "Nur-lesen-Token",
        description: "Die Richtlinie verbietet das Bearbeiten.",
      },
    },
    selection: {
      heading: "Beliebige Token-Auswahl",
      introduction:
        "Schalte beliebige Token um. Dies bleibt eine Kandidatenmenge, bis beide Zustandsbedingungen erfüllt sind.",
      selectedLabel: "Ausgewählte Token",
      toggleLegend: "Kandidatenauswahl verändern",
      addToken: (token) => `${token} hinzufügen`,
      removeToken: (token) => `${token} entfernen`,
      emptySelection: "Keine Token ausgewählt",
    },
    analysis: {
      heading: "Zustandstest mit zwei Bedingungen",
      introduction:
        "Der Kern prüft zuerst die Verträglichkeit. Nur eine verträgliche Auswahl kann auf Folgerungsabschluss geprüft werden.",
      consistencyCriterion: "Miteinander verträglich",
      closureCriterion: "Unter Folgerung abgeschlossen",
      stateVerdict: "Ist ein Zustand",
      passes: "erfüllt",
      fails: "nicht erfüllt",
      notChecked: "nicht geprüft",
      inconsistentHeading: "Diese Auswahl ist unverträglich.",
      inconsistentExplanation: (witness) =>
        `${witness} ist als Konflikt festgelegt; diese Beobachtungen können daher nicht zu einem Zustand gehören.`,
      notClosedHeading: "Verträglich, aber noch kein Zustand.",
      notClosedExplanation: (missing) =>
        `Der Abschluss fügt ${missing} hinzu. Ein Zustand muss jedes gefolgerte Token bereits enthalten.`,
      stateHeading: "Diese Auswahl ist ein Zustand.",
      stateExplanation: (state) =>
        `${state} ist verträglich und bleibt durch Abschluss unverändert.`,
      witnessLabel: "Konkreter Konfliktbeleg",
      missingLabel: "Fehlende gefolgerte Token",
    },
    definition: {
      heading: "Definition der Bearbeitungsrichtlinie",
      introduction:
        "Die festgelegten Konflikte und die Regel bestimmen jedes sichtbare Urteil.",
      tokensHeading: "Token-Menge",
      conflictsHeading: "Minimale Konflikte",
      rulesHeading: "Festgelegte Folgerung",
      stateCriterionHeading: "Zustandskriterium",
      stateCriterion:
        "Ein Zustand ist eine verträgliche und unter Folgerung abgeschlossene Token-Menge.",
    },
    explanation: {
      heading: "Warum die erste Auswahl scheitert",
      guide:
        "Administrator ist mit Δ verträglich, aber die festgelegte Regel folgert außerdem darf bearbeiten. Wende den Abschluss an, um den kleinsten Zustand über der Auswahl zu sehen.",
      closedExample:
        "Der Abschluss hat das fehlende Recht ergänzt. Das Ergebnis erfüllt nun Verträglichkeit und Abschluss zugleich.",
      challenge:
        "Mache die Startauswahl selbst zu einem Zustand. Schalte Token um und nutze den aktuellen Beleg oder die Erklärung der fehlenden Token.",
      complete: (token) =>
        `Du hast ${token} hinzugefügt, die von der Administratorregel geforderte Konsequenz. Der Kandidat ist nun ein Zustand.`,
      structuredSummary: "Kernanalyse als Text lesen",
      structuredHeading: "Geordnete Zustandsanalyse",
      selectedStep: (selection) => `Den Kandidaten ${selection} prüfen.`,
      consistencyPass: "Der Kandidat enthält keinen festgelegten Konflikt.",
      consistencyFail: (witness) =>
        `Die Verträglichkeit scheitert am konkreten Beleg ${witness}.`,
      distinguishedStep: (token, state) =>
        `Das Gesetz des ausgezeichneten Tokens fügt ${token} hinzu; es entsteht ${state}.`,
      closureStep: (premises, conclusion, state) =>
        `${premises} folgert ${conclusion}; durch Hinzufügen entsteht ${state}.`,
      closureComplete: (state) => `Der Abschluss stabilisiert sich bei ${state}.`,
      closureResultLabel: "Abschluss",
    },
    challenge: {
      eyebrow: "Manipulationsaufgabe",
      heading: "Repariere die Auswahl ohne automatischen Abschluss.",
      explanation: (selection) =>
        `Beginne erneut bei ${selection}. Ergänze die nötige Konsequenz und behalte die Administrator-Prämisse.`,
      wrongState:
        "Das ist ein Zustand, aber die Administrator-Prämisse fehlt. Behalte sie und repariere stattdessen ihren Abschluss.",
      successHeading: "Du hast einen verträglichen, abgeschlossenen Zustand gebaut.",
    },
    actions: {
      applyClosure: "Auswahl durch Abschluss vervollständigen",
      beginChallenge: "Selbst reparieren",
      continueMaps: "Mit stetigen Abbildungen fortfahren",
      resetSelection: "Auswahl zurücksetzen",
      replayGuide: "Zustandstest wiederholen",
      back: "Zurück zur Folgerung",
    },
  },
  continuousMapLesson: {
    pageTitle: "ScottLab · Stetige Abbildungen in Aktion",
    markerLabel: "Lektion 5: Stetige Abbildungen",
    markerName: "Stetige Abbildungen",
    footerSystem: "Negation flacher Booleans",
    footerStage: "Schrittweise Abbildung",
    eyebrow: "Fortgeschrittene Lektion · endliche Stütze",
    title: "Verfeinere die Eingabe und sieh der Ausgabe beim Lernen zu.",
    lead:
      "Eine stetige Abbildung verarbeitet einen Zustand und erzeugt einen anderen. Halte die beiden Boolean-Kopien getrennt, während die exakte Negation jede endliche Eingabebeobachtung in begründete Ausgabeinformation verwandelt.",
    workspaceLabel: "Interaktive Lektion zur stetigen Boolean-Negation",
    tokens: {
      delta: {
        label: "stets vorhandenes Token",
        accessibleName: "Delta, das stets vorhandene Token",
        description: "Das ausgezeichnete Token, das jeder Zustand enthält.",
      },
      false: {
        label: "false",
        accessibleName: "False-Token",
        description: "Die Beobachtung, dass dieser Boolean falsch ist.",
      },
      true: {
        label: "true",
        accessibleName: "True-Token",
        description: "Die Beobachtung, dass dieser Boolean wahr ist.",
      },
    },
    rules: {
      "false-maps-to-true": {
        label: "False-Eingabe wird auf True-Ausgabe abgebildet",
        explanation:
          "Eine False-Beobachtung in der Quelle begründet True in der getrennten Zielkopie.",
      },
      "true-maps-to-false": {
        label: "True-Eingabe wird auf False-Ausgabe abgebildet",
        explanation:
          "Eine True-Beobachtung in der Quelle begründet False in der getrennten Zielkopie.",
      },
    },
    canvas: {
      heading: "Zwei Kopien, eine Abbildung",
      introduction:
        "Links steht der Eingabezustand. Rechts wird die Ausgabe neu berechnet; Token wandern nicht in einem gemeinsamen Behälter.",
      inputCopyLabel: "Eingabekopie A",
      outputCopyLabel: "Ausgabekopie B",
      systemName: "Flache Booleans",
      mappingName: "nicht",
      stateLabel: "Formaler Zustand",
      bottomBadge: "Bottom · keine bestimmte Boolean-Information",
      informativeBadge: "informativer Zustand",
      dormantRule: "keine informative Erzeugerregel aktiv",
      pendingRule: "Erzeugerregel bereit",
      activeRule: "Erzeugerregel aktiv",
      appliedRule: "Erzeugerregel angewendet",
      diagramLabel: (inputState, outputState, ruleStatus) =>
        `Boolean-Eingabe ${inputState} wird auf Ausgabe ${outputState} abgebildet; ${ruleStatus}.`,
    },
    experiment: {
      heading: "Den Quellzustand verfeinern",
      introduction:
        "Beginne bei Bottom und decke dann Prämisse, Erzeugerregel und Ausgabe Bild für Bild auf.",
      inputStateLabel: "Aktuelle Eingabe",
      outputStateLabel: "Sichtbare Ausgabe",
      navigationLabel: "Steuerung der Abbildungsspur",
      guideProgress: (current, total) =>
        `Geführtes Abbildungsbild ${current} von ${total}`,
      challengeProgress: (current, total) =>
        `Aufgabenbild ${current} von ${total}`,
    },
    challenge: {
      eyebrow: "Kurze Aufgabe",
      heading: "Welche Eingabe macht die Ausgabe true?",
      introduction:
        "Wähle einen informativen Quellzustand, untersuche seine Erzeugerregel und beende die Spur. Eingabe und Ausgabe sind getrennte Boolean-Kopien.",
      choiceLegend: "Eingabebeobachtung wählen",
      chooseInput: (token) => `${token} als Eingabebeobachtung wählen`,
      correctBadge: "Korrekte endliche Stütze",
      incorrectBadge: "Gültiges Ergebnis, aber anderer Zielzweig",
    },
    definition: {
      heading: "Exakte Definition durch endliche Erzeuger",
      introduction:
        "Die gespeicherte Beispieldatei ist exakt. Ihre zwei positiven Erzeugerregeln und der Zielabschluss bestimmen jedes hier gezeigte Ergebnis.",
      sourceStatesHeading: "Quellzustände",
      targetStatesHeading: "Zielzustände",
      generatorsHeading: "Festgelegte Erzeugerregeln",
      orderHeading: "Informationsordnung",
      orderExplanation:
        "Zustände sind durch Inklusion geordnet: Ein verträgliches Token hinzuzufügen bedeutet, mehr zu lernen.",
      incomparabilityHeading: "Die Zweige sind unvergleichbar",
      incomparabilityExplanation:
        "True und False liegen nicht übereinander. Beide liegen ausschließlich über Bottom.",
      continuityHeading: "Warum diese Abbildung stetig ist",
      continuityExplanation:
        "Positive endliche Prämissen bleiben bei Verfeinerung erhalten, und der Zielabschluss ist monoton. Auf diesem endlichen Zustandsbereich folgt daraus Scott-Stetigkeit. Die Negation vertauscht unvergleichbare Zweige; sie kehrt ihre Ordnung nicht um.",
    },
    explanation: {
      heading: "Kausale Abbildungsspur",
      introduction:
        "Dieselbe strukturierte Kernberechnung steuert Diagramm, Erzählung und vollständige Textspur.",
      bottomHeading: "Bottom wird auf Bottom abgebildet.",
      bottomExplanation: (state) =>
        `Ohne bestimmte Eingabebeobachtung gilt keine informative Erzeugerregel. Der Zielabschluss liefert dennoch ${state}.`,
      challengeReadyHeading: "Erzeuge nun die Ausgabe true.",
      challengeReadyExplanation:
        "Wähle die Quellbeobachtung, deren festgelegte Erzeugerregel True folgert, und untersuche alle drei kausalen Bilder.",
      premiseHeading: (token) => `Die Eingabe enthält ${token}.`,
      premiseExplanation: (token, state) =>
        `${token} ist im Quellzustand ${state} vorhanden. Eine Erzeugerregel mit dieser endlichen Prämisse kann daher aktiv werden.`,
      ruleHeading: (rule) => `„${rule}“ aktivieren.`,
      ruleExplanation: (rule, inputState, conclusion) =>
        `Die endliche Stütze ${inputState} erfüllt „${rule}“ und begründet dadurch ${conclusion} in der Zielkopie.`,
      outputHeading: (state) => `Der Zielabschluss ergibt ${state}.`,
      outputExplanation: (token, state) =>
        `Die begründete Beobachtung ${token} kommt zum Ziel-Δ hinzu und erzeugt den getrennten Ausgabezustand ${state}.`,
      incorrectHeading: "Diese Eingabe erzeugt den anderen Boolean-Zweig.",
      incorrectExplanation: (input, output, expectedInput) =>
        `${input} wird korrekt auf ${output} abgebildet, aber die Aufgabe verlangt die Ausgabe True. Wähle ${expectedInput} als Quellbeobachtung.`,
      completeHeading:
        "Du hast die Boolean-Negation aus endlicher Stütze berechnet.",
      completeExplanation: (inputState, outputState) =>
        `${inputState} aktiviert eine festgelegte Erzeugerregel; der Zielabschluss erzeugt ${outputState}.`,
      structuredSummary: "Vollständige Abbildungsherleitung als Text lesen",
      structuredHeading: "Geordnete semantische Abbildungsherleitung",
      structuredInput: (state) => `Quellzustand ${state} verwenden.`,
      structuredDeltaStep: (step, token, state) =>
        `Schritt ${step}: Der Zielabschluss fügt das ausgezeichnete Token ${token} hinzu; es entsteht ${state}.`,
      structuredMappingStep: (
        step,
        sourceSupport,
        rule,
        conclusion,
        state,
      ) =>
        `Schritt ${step}: Die Quellstütze ${sourceSupport} aktiviert „${rule}“; ${conclusion} wird hinzugefügt und erzeugt ${state}.`,
      structuredEntailmentStep: (step, premises, conclusion, state) =>
        `Schritt ${step}: Die Zielprämissen ${premises} folgern ${conclusion}; es entsteht ${state}.`,
      structuredResult: (state) =>
        `Der Zielabschluss stabilisiert sich bei ${state}.`,
    },
    actions: {
      startGuide: "Eingabe zu true verfeinern",
      previous: "Vorheriges Bild",
      next: "Nächstes Bild",
      skipGuide: "Geführtes Ergebnis zeigen",
      showResult: "Dieses Abbildungsergebnis zeigen",
      beginChallenge: "Aufgabe beginnen",
      finishChallenge: "Aufgabe abschließen",
      replay: "Bei Bottom erneut beginnen",
      back: "Zurück zu Zuständen",
      openSandbox: "Boolean-Sandbox erneut ansehen",
    },
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
    backToConflict: "Zurück zum Konflikt",
    startChallenge: "Eine kurze Aufgabe lösen",
    retryChallenge: "Zu ⊥ zurückkehren und erneut versuchen",
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
