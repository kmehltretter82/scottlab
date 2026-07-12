# ScottLab Mathematical Conventions

> [!NOTE]
> This is the draft mathematical contract for the first published preview. It
> covers finite Scott information systems and flat Booleans. Continuous maps
> and fixed points will extend this document in later milestones.

ScottLab version 1 follows the distinguished-token presentation in Dana S.
Scott's [“Domains for Denotational Semantics”](references.md#primary-source).
The implementation uses finite token sets, but it preserves the distinction
between an information system and the domain of states generated from it.

## Beginner vocabulary

The interface must keep these two levels distinct:

- A **token** is one finite observation.
- A **state** is a whole collection of tokens that is consistent and closed
  under entailment.

Two symbols are similarly related but not interchangeable:

- `Δ` is the distinguished, always-present token.
- `⊥` is the least state, with no specific information.

Tokens belong to states. In particular, `Δ` belongs to `⊥`; `Δ` is not another
name for `⊥`.

## Information systems

A version 1 information system is a tuple

```text
A = (T, Δ, Con, ⊢)
```

where:

- `T` is a finite set of tokens;
- `Δ ∈ T` is the distinguished least-informative token;
- `Con` is a collection of finite consistent subsets of `T`; and
- `⊢` relates a consistent finite token set to a token.

Write `X ⊢ Y` when `X ⊢ b` for every token `b ∈ Y`.

For all finite token sets `X` and `Y`, and every token `a`, the following laws
must hold whenever the displayed entailments are defined:

1. **Downward consistency:** if `X ⊆ Y` and `Y ∈ Con`, then `X ∈ Con`.
2. **Singleton consistency:** `{a} ∈ Con`.
3. **Entailment preserves consistency:** if `X ∈ Con` and `X ⊢ a`, then
   `X ∪ {a} ∈ Con`.
4. **Distinguished token:** if `X ∈ Con`, then `X ⊢ Δ`.
5. **Reflexivity:** if `a ∈ X ∈ Con`, then `X ⊢ a`.
6. **Cut:** if `Y ⊢ X` and `X ⊢ a`, then `Y ⊢ a`.

These laws imply weakening: if `X ⊆ Y ∈ Con` and `X ⊢ a`, then `Y ⊢ a`.

## Closure, states, and bottom

For a consistent set of observations `S`, its entailment closure is

```text
closure(S) = { a ∈ T | some finite X ⊆ S entails a }.
```

Because version 1 systems are finite, a consistent finite `S` has the simpler
equivalent description

```text
closure(S) = { a ∈ T | S ⊢ a }.
```

The public `closure` operation must reject an inconsistent input with a
concrete witness rather than returning a state-like result.

A **state** is a token set `x ⊆ T` such that:

1. every finite subset of `x` is consistent; and
2. whenever a finite `X ⊆ x` entails `a`, then `a ∈ x`.

For a finite version 1 system, this is equivalent to

```text
x ∈ Con and closure(x) = x.
```

States are ordered by inclusion. If `x ⊆ y`, then `y` contains at least as much
information as `x`.

Every valid system generates a least state:

```text
⊥ = closure({Δ}) = closure(∅).
```

Thus `⊥` is contained in every state. It contains `Δ` and any other token that
is entailed unconditionally. “No specific information” is the canonical
beginner description; bottom need not be the empty set.

For finite systems, `coverRelation` contains an edge `x → y` exactly when
`x ⊂ y` and no state lies strictly between them. This is the relation displayed
in a Hasse diagram.

## Persisted finite representation

The draft [version 1 JSON Schema](../schemas/information-system.v1.schema.json)
uses a compact presentation rather than listing the full `Con` and `⊢`
relations.

### Consistency

The persisted `minimalInconsistentSets` are the minimal forbidden token
combinations. A finite set `X` is consistent exactly when it contains none of
those combinations as a subset.

The semantic validator must check that:

- every listed token exists;
- every forbidden combination has at least two tokens;
- no forbidden combination contains `delta`; and
- the list is minimal: no listed combination contains another one.

This representation makes downward consistency and singleton consistency
structural, while retaining a concrete witness for every inconsistency.

### Entailment

Each persisted entailment rule has finite premises and one conclusion. The
core constructs the least entailment relation containing those rules and the
required distinguished-token and reflexivity laws, then closes it under cut
and weakening.

The semantic validator must check that:

- every premise and conclusion token exists;
- every premise set is consistent; and
- every derived entailment preserves consistency.

Empty-premise rules are allowed. Their conclusions belong to bottom because
they hold before any specific observation is added.

### Structural and semantic validation

JSON Schema checks document shape. It cannot express token-ID references,
minimality, or the information-system laws, so successful schema validation is
necessary but not sufficient. Imported data must pass the semantic validator
before it changes the active session.

Before evaluating the laws, the semantic validator must check that:

- token IDs are unique;
- rule IDs are unique;
- `delta` names exactly one declared token; and
- every token reference resolves to a declared token.

Exports are deterministic:

- tokens and token IDs inside sets are ordered lexicographically by ID;
- inconsistent sets are ordered lexicographically by their token-ID lists;
- entailment rules are ordered by rule ID; and
- absent optional values are omitted rather than serialized as `null`.

## Flat Booleans

The first preview uses the exact finite system in the
[flat-Boolean fixture](../packages/examples/flat-boolean.system.json).

Its tokens are:

| ID | Presentation | Meaning |
| --- | --- | --- |
| `delta` | Always-present token (`Δ`) | No specific Boolean information |
| `true` | `true` | The Boolean is true |
| `false` | `false` | The Boolean is false |

The only minimal inconsistent set is

```text
{true, false}.
```

There are no user-declared entailment rules. Entailment is the minimal relation
required by the axioms:

```text
X ⊢ a exactly when a = Δ or a ∈ X.
```

The expected closure results are:

| Input observations | Closure | Result |
| --- | --- | --- |
| `∅` | `{Δ}` | Bottom |
| `{Δ}` | `{Δ}` | Bottom |
| `{true}` | `{Δ, true}` | Valid state |
| `{false}` | `{Δ, false}` | Valid state |
| `{true, false}` | Not computed | Inconsistent witness `{true, false}` |

Exactly three states are generated:

```text
{Δ}          = ⊥
{Δ, true}
{Δ, false}
```

Their cover relation is

```text
{Δ} → {Δ, true}
{Δ} → {Δ, false}.
```

The interface may label the whole state `{Δ}` as `⊥`, but it must let learners
inspect the contained `Δ` token and must never present `Δ` and `⊥` as the same
object.

## Deferred conventions

The first preview does not persist or validate approximable mappings,
fixed-point traces, infinite-system presentations, or general lesson sessions.
Those additions must preserve this document's token/state distinction and use
new schema versions when compatibility would otherwise be ambiguous.
