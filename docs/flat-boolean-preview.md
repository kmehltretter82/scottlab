# Flat-Boolean First Preview

> [!NOTE]
> This is the interaction and explanation specification for ScottLab's first
> published preview. It is intentionally narrower than the eventual lesson
> sequence and editable sandbox.

The preview implements the exact system in the
[flat-Boolean fixture](../packages/examples/flat-boolean.system.json) using the
[selected mathematical conventions](mathematical-conventions.md).

## Scope

The preview contains:

1. one short historical introduction;
2. one bottom-first guided lesson;
3. one short branch-aware challenge; and
4. the same system in a read-only sandbox.

It does not contain a general editor, import/export, arbitrary systems,
continuous maps, fixed points, accounts, or server-side behavior.

## Learning promise

After the preview, a first-time learner should be able to say:

- “Scott introduced information systems as a constructive, visible way to
  present domains for computable functions.”
- “`⊥` is the state with no specific information.”
- “A token is one observation; a state is the whole collection.”
- “Looking inside `⊥` shows an empty collection of observations, `∅`.”
- “Adding `true` or `false` gives more information.”
- “The `true` and `false` tokens cannot occur in one Boolean state.”
- “A designer chooses what a system models, its tokens, and its compatibility
  rules; states are derived from those choices.”

The lesson does not compare Scott tokens with AI or language-model tokens.

## Canonical language

Use these phrases consistently in visible copy, accessible descriptions, and
tests:

| Concept | Primary copy | Avoid as the primary explanation |
| --- | --- | --- |
| `⊥` | “The state with no specific answer yet” | “Error,” “nothing exists,” “hidden value” |
| `∅` | “No observations in this state” | “No state exists,” “error” |
| Token | “One piece of information” | “A state,” “a node” |
| State | “All compatible information currently known” | “A token” |
| Refinement | “Add information” | “Reveal the answer underneath” |
| Conflict | “One Boolean value cannot be both true and false” | Color-only warning |

Formal terminology appears after the learner has interacted with the pictured
idea. Symbols are introduced only when they help explain that idea, and plain
language leads.

## Languages

The web lesson provides British English and German presentation layers. A
header switcher shows 🇬🇧 English and 🇩🇪 Deutsch with text labels, accessible
button names, and a pressed state. The learner's choice is stored locally, and
the document language, title, description, visible copy, and accessible copy
change together.

Token IDs, mathematical symbols, semantic events, and core errors are not
translated. Localization belongs to the web presentation layer so that every
language describes the same core computation.

## Beginner projection of the formal convention

The mathematical core and persisted fixture continue to use Scott's explicit
distinguished-token convention, as documented in
[Mathematical Conventions](mathematical-conventions.md). The beginner lesson
uses implicit-`Δ` notation: it hides the formal `Δ` token and shows only the
specific observations in a state.

The presentation therefore removes `Δ` from each core state:

| Explicit core state | Beginner view |
| --- | --- |
| `{Δ}` | `∅` (`⊥`, no observations) |
| `{Δ, false}` | `{false}` |
| `{Δ, true}` | `{true}` |

This is a projection of the same computed states, not a second implementation
of the semantics. A later formal lesson may reveal `Δ` when the
distinguished-token convention helps explain entailment and closure. Until
then, visible copy must not suggest that a learner needs `Δ` to understand
bottom, tokens, or the Boolean example.

## Interaction model

The lesson uses one canonical session state. The canvas, token tray,
explanation, progress indicator, and accessible text view are projections of
that state; they must not maintain competing mathematical copies.

There is one primary action at a time. Back, replay, restart, reduced-motion,
and skip-to-preview controls remain available but visually secondary. No stage
advances on a timer.

The `true` and `false` paths are symmetric. Copy and animation must be generated
from the selected token rather than maintained as two nearly duplicate lesson
implementations.

A compact “Designed model” card exposes the definition progressively rather
than presenting the system as a black box:

1. the opening identifies what the system was designed to model;
2. inspecting bottom reveals its empty collection of observations;
3. meeting the Boolean tokens reveals the chosen token set;
4. selecting a Boolean token reveals the declared compatibility rule; and
5. testing that rule reveals the states derived from those choices.

The card is explanatory presentation of the fixture, not a second mathematical
model. Its values come from the same system consumed by the lesson.

## Storyboard

### 0. Why information systems?

Before the bottom-first lesson, a short opening introduces Dana Scott and the
problem that motivated the presentation. It explains in beginner-facing
language that programs may reveal results gradually, that domains organize
partial information for mathematical reasoning about computable functions,
and that Scott's 1982 information systems presented domains through tokens,
consistency, entailment, and states.

The page paraphrases the aims Scott gave for the new presentation: simpler and
constructive definitions, more visible domains, and easier construction for
applications. It links both [Scott's homepage](https://www.cs.cmu.edu/~scott/)
and his paper [“Domains for Denotational
Semantics”](https://doi.org/10.1007/BFb0012801). The primary action is “Explore
a first example.” No lesson state or token is shown before that action.

### 1. Introduce the Boolean example

A separate bridge prevents the lesson from jumping directly from Scott's
general theory to an unexplained Boolean model. It begins:

> Let's look at the simplest useful example: a question with only two possible
> answers.

The page asks “Is the light switched on?” and presents `true` as “yes” and
`false` as “no.” It defines a Boolean as a value with exactly those two
possibilities, then explains why this is the first model: it is small but
already exhibits incomplete and conflicting information.

The final explanation explicitly says that `⊥` is not a third Boolean value;
it describes the information state in which the answer is not known yet. The
primary action is “Begin the Boolean model at `⊥`.”

### 2. Begin at bottom

The first screen is a calm, spacious stage containing:

- one large state labeled `⊥`;
- the sentence “We do not know the Boolean value yet”; and
- a compact “Designed model” card identifying one ordinary Boolean value;
- one primary action, “Look inside.”

No token tray, dense formal definition, Hasse diagram, or four-panel layout is
visible. The explanation says that this information system was designed to
describe one Boolean value, defines a state as the compatible information
currently known about that value, and names `⊥` as the state with no specific
answer yet. The accessible name is “Bottom state: no observations yet.”

Entering the stage records `bottomComputed` and `stateValidated` semantic
events. The learner's action records `stateInspected`.

### 3. Look inside the state

The bottom state opens or expands into a containing tray. The tray contains no
observations. It displays the empty-set symbol `∅` and the plain-language label
“no observations.”

The explanation establishes what the open state boundary contains before
introducing tokens:

> A state collects the observations that fit together—everything known so far.
> Here that collection is empty: `∅`. We have not made an observation about the
> light yet.

The visual treatment must make containment unambiguous: `∅` describes the
collection inside the state, while `⊥` labels the whole state. In reduced-motion
mode the expanded view replaces the collapsed view without spatial movement.

The primary action becomes “Meet the tokens.”

The model card still shows only what the system models. The chosen token set is
revealed in the next step, when tokens have a concrete role.

### 4. Introduce informative tokens

A compact token tray appears with `true` and `false`. Each choice explains its
meaning: `true` says that the Boolean value is true, and `false` says that the
Boolean value is false. The learner is asked to choose one piece of information
to add. Both choices are equally prominent and keyboard accessible.

The model card now reveals that the designer chose the visible token set
`{false, true}`.

Selecting a token:

1. records `observationAdded`;
2. asks the core to compute closure;
3. animates or highlights the selected token entering the state;
4. records `closureCompleted` and `stateValidated`; and
5. updates the explanation and structured text view.

For example, after selecting `true`, the beginner view contains `{true}`. The
core has computed the explicit state `{Δ, true}`, but the presentation keeps
the formal token implicit. The copy says:

> Now the Boolean value is known as `true`. The `true` token is one piece of
> information. The state `{true}` collects everything known so far.

The corresponding `false` copy is generated from the same template.

After the learner selects either Boolean token, the model card reveals the
declared rule `{false, true} is incompatible`. The opposite-token prompt asks
the learner to test this rule, not to guess a property inferred from the token
names.

### 5. Encounter inconsistency

The opposite token remains available with the prompt “Can both observations
belong to one Boolean state?” The learner may attempt to add it.

The core rejects the candidate before closure and returns:

```text
category: minimalInconsistentSet
witness:  {true, false}
```

The current valid state does not change. The attempted token returns to the
tray or remains outside the state boundary. The two-token witness receives a
pattern, connector, icon, and textual explanation; red alone is insufficient.

The model card reveals the three beginner-visible states `∅`, `{false}`, and
`{true}` derived from the chosen tokens and rule. Canonical explanation:

> One Boolean value cannot be both true and false. ScottLab did not infer this
> from the token names; it checked the compatibility rule chosen for this
> model. Another information system could allow both tokens and would model
> something different.

The learner can focus either token in the witness to hear the same relationship
described from that token's perspective.

### 6. Build the information order

The view pulls back to show the three states:

```text
{true}    {false}
    \      /
      ∅ (⊥)
```

The displayed node labels are `true`, `false`, and `⊥`; inspecting any node
reveals its beginner-visible observations. Edges are produced by
`coverRelation`, not drawn from a UI-specific hard-coded model.

Canonical explanation:

> Moving upward adds information. `⊥` is below both Boolean answers because it
> contains no specific Boolean information.

The interface explicitly says that `⊥` is not Boolean `false`.

### 7. Complete the challenge

The lesson resets to `⊥` and asks the learner to build the informative state
they did not choose first. If the learner first selected `true`, the target is
`false`, and conversely.

Completion requires adding the target token and arriving at the corresponding
validated state. The challenge does not require recalling a definition or
performing drag-and-drop.

Success copy:

> You added one observation to `⊥` and built another Boolean state.

The completion event records the target, final state, and branch taken. It does
not record personal data or send network requests.

### 8. Open the read-only sandbox

The final action opens the same flat-Boolean system in a read-only sandbox. It
introduces the four synchronized areas without exposing editing controls:

1. the three-state information-order diagram;
2. the current state's token tray;
3. a locked definition view showing the two visible tokens and one conflict;
   and
4. the plain-language and formal explanation view.

Selecting a state in any view updates all four areas. The definition view says
“Editing arrives in a later milestone” rather than showing disabled or
non-functional editor controls.

The sandbox provides “Restart lesson” and a link back to the focused lesson
stage.

## Structured explanation events

The core returns structured semantic events. The UI maps those events to copy,
animation, accessible announcements, and test assertions; it must not
reconstruct mathematical reasons from final token sets.

The first-preview event contract is:

```ts
type TokenId = string;

type EntailmentReason =
  | { kind: "distinguishedToken" }
  | { kind: "reflexivity" }
  | { kind: "declaredRule"; ruleId: string }
  | { kind: "cut"; through: TokenId[] };

type SemanticEvent =
  | {
      kind: "bottomComputed";
      delta: TokenId;
      state: TokenId[];
    }
  | {
      kind: "closureStarted";
      input: TokenId[];
    }
  | {
      kind: "tokenEntailed";
      premises: TokenId[];
      conclusion: TokenId;
      reason: EntailmentReason;
    }
  | {
      kind: "closureCompleted";
      input: TokenId[];
      result: TokenId[];
    }
  | {
      kind: "inconsistencyFound";
      category: "minimalInconsistentSet";
      candidate: TokenId[];
      witness: TokenId[];
    }
  | {
      kind: "stateValidated";
      state: TokenId[];
    }
  | {
      kind: "coverRelationComputed";
      edges: Array<{ lower: TokenId[]; upper: TokenId[] }>;
    };
```

Token arrays are duplicate-free and lexicographically ordered by ID. Events
are deterministic for a fixed input. If several derivations can justify the
same token, the core selects the shortest derivation. It then breaks ties by
reason kind (`distinguishedToken`, `reflexivity`, `declaredRule`, then `cut`),
followed lexicographically by premise IDs and rule ID when present.

The lesson controller may additionally record presentation events:

```ts
type LessonEvent =
  | { kind: "stepEntered"; step: string }
  | { kind: "stateInspected"; state: TokenId[] }
  | { kind: "observationAdded"; token: TokenId }
  | { kind: "challengeCompleted"; target: TokenId; state: TokenId[] }
  | { kind: "sandboxOpened"; systemId: "flat-boolean" };
```

Lesson events never substitute for semantic events. For example, the UI may
record that the learner attempted to add `false`, but only
`inconsistencyFound` supplies the mathematical category and witness.

## Expected semantic traces

These are formal core traces and therefore retain explicit `delta`. The
beginner UI projects `delta` out of state and token displays as described
above; it does not alter or reconstruct the traces.

At minimum, tests assert these ordered event summaries:

### Initial state

```text
bottomComputed(delta, {delta})
stateValidated({delta})
```

### Add `true`

```text
closureStarted({true})
tokenEntailed(∅, delta, distinguishedToken)
tokenEntailed({true}, true, reflexivity)
closureCompleted({true}, {delta, true})
stateValidated({delta, true})
```

The `false` trace is symmetric.

### Attempt both Boolean tokens

```text
inconsistencyFound(
  candidate = {delta, false, true},
  witness = {false, true}
)
```

No closure or state-validation event follows a rejected candidate.

### Enumerate the order

```text
coverRelationComputed(
  {delta} → {delta, false},
  {delta} → {delta, true}
)
```

## Accessibility and motion

- Every action is a native button or link with a visible focus indicator.
- The diagram has an equivalent structured list of states and cover edges.
- A keyboard user can enter the diagram, move between connected states with
  arrow keys, and select a state with Enter or Space.
- State changes are announced through a polite live region after the visible
  update; transient animation frames are not announced.
- Conflict uses text, shape, pattern, and an icon rather than color alone.
- Full motion provides step, pause, replay, and restart controls.
- Reduced motion replaces travel and scaling with discrete highlights and
  immediate layout changes.
- The preview is tested in current Safari, Chromium, and Firefox-based
  browsers at narrow and desktop widths.

## Preview acceptance checklist

- A learner reaches the read-only sandbox without external documentation.
- The learner encounters `⊥` before tokens or formal definitions.
- Looking inside shows `∅`, an empty collection of observations, without
  introducing `Δ`.
- Adding either Boolean token produces the expected state and trace.
- Attempting both tokens preserves the current state and shows the concrete
  witness `{true, false}`.
- The displayed diagram is computed from the three enumerated states and two
  cover edges.
- The branch-aware challenge works from either first choice.
- Mouse, touch, keyboard, reduced-motion, and structured-text paths expose the
  same mathematical behavior.
