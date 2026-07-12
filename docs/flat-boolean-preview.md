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

1. one bottom-first guided lesson;
2. one short branch-aware challenge; and
3. the same system in a read-only sandbox.

It does not contain a general editor, import/export, arbitrary systems,
continuous maps, fixed points, accounts, or server-side behavior.

## Learning promise

After the preview, a first-time learner should be able to say:

- “`⊥` is the state with no specific information.”
- “A token is one observation; a state is the whole collection.”
- “`Δ` is the always-present token inside every state.”
- “Adding `true` or `false` gives more information.”
- “The `true` and `false` tokens cannot occur in one Boolean state.”

The lesson does not compare Scott tokens with AI or language-model tokens.

## Canonical language

Use these phrases consistently in visible copy, accessible descriptions, and
tests:

| Concept | Primary copy | Avoid as the primary explanation |
| --- | --- | --- |
| `⊥` | “No specific information yet” | “Error,” “nothing exists,” “hidden value” |
| `Δ` | “Always-present token” | “Bottom token,” “the bottom” |
| Token | “One observation” | “A state,” “a node” |
| State | “The whole collection of observations” | “A token” |
| Refinement | “Add information” | “Reveal the answer underneath” |
| Conflict | “These tokens cannot belong to one Boolean state” | Color-only warning |

Formal terminology appears after the learner has interacted with the pictured
idea. The symbols remain visible, but plain language leads.

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

## Storyboard

### 1. Begin at bottom

The first screen is a calm, spacious stage containing:

- one large state labeled `⊥`;
- the sentence “No specific information yet”; and
- one primary action, “Look inside.”

No token tray, formal definition, Hasse diagram, or four-panel layout is
visible. The accessible name is “Bottom state: no specific information yet.”

Entering the stage records `bottomComputed` and `stateValidated` semantic
events. The learner's action records `stateInspected`.

### 2. Look inside the state

The bottom state opens or expands into a containing tray. Inside it is one
token-shaped object with:

- primary label “Always-present token”; and
- secondary mathematical symbol `Δ`.

The explanation says:

> This whole tray is a state. The object inside it is one token. `Δ` is present
> in every state, but it gives no specific Boolean information.

The visual treatment must make containment unambiguous: `Δ` is a chip or card
inside the state boundary; `⊥` labels the whole boundary. In reduced-motion
mode the expanded view replaces the collapsed view without spatial movement.

The primary action becomes “Add information.”

### 3. Introduce informative tokens

A compact token tray appears with `true` and `false`. The learner is asked to
choose one observation to add. Both choices are equally prominent and keyboard
accessible.

Selecting a token:

1. records `observationAdded`;
2. asks the core to compute closure;
3. animates or highlights the selected token entering the state;
4. records `closureCompleted` and `stateValidated`; and
5. updates the explanation and structured text view.

For example, after selecting `true`, the state contains `{Δ, true}`. The copy
says:

> The state now contains the token `true`. It has more information than `⊥`.

The corresponding `false` copy is generated from the same template.

### 4. Encounter inconsistency

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

Canonical explanation:

> `true` and `false` cannot belong to the same Boolean state. The current state
> is unchanged.

The learner can focus either token in the witness to hear the same relationship
described from that token's perspective.

### 5. Build the information order

The view pulls back to show the three states:

```text
{Δ, true}    {Δ, false}
      \        /
          {Δ}
```

The displayed node labels are `true`, `false`, and `⊥`; inspecting any node
reveals its full token set. Edges are produced by `coverRelation`, not drawn
from a UI-specific hard-coded model.

Canonical explanation:

> Moving upward adds information. `⊥` is below both Boolean answers because it
> contains no specific Boolean information.

The interface explicitly says that `⊥` is not Boolean `false`.

### 6. Complete the challenge

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

### 7. Open the read-only sandbox

The final action opens the same flat-Boolean system in a read-only sandbox. It
introduces the four synchronized areas without exposing editing controls:

1. the three-state information-order diagram;
2. the current state's token tray;
3. a locked definition view showing the three tokens and one conflict; and
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
- Looking inside visually distinguishes the state boundary from the `Δ` token.
- Adding either Boolean token produces the expected state and trace.
- Attempting both tokens preserves the current state and shows the concrete
  witness `{true, false}`.
- The displayed diagram is computed from the three enumerated states and two
  cover edges.
- The branch-aware challenge works from either first choice.
- Mouse, touch, keyboard, reduced-motion, and structured-text paths expose the
  same mathematical behavior.
