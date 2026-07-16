# ScottLab

> [!IMPORTANT]
> **ScottLab is under construction.** The guided Boolean preview now reaches
> its explicit-`Δ` formalisation, synchronized read-only sandbox, and first
> rule-driven entailment, state-validation, and continuous-maps lessons.
> General editing and fixed points are not implemented yet.

**[Open the current interactive preview](https://kmehltretter82.github.io/scottlab/)**

ScottLab is a planned browser-based playground for learning, constructing, and
experimenting with [Scott information systems](https://doi.org/10.1007/BFb0012801),
introduced by [Dana S. Scott](https://www.cs.cmu.edu/~scott/). It aims to make
partial information, consistency, entailment, domains, continuous maps, and
least fixed points visible and executable.

The project is intended to feel like an interactive mathematical exhibit.
Learners will begin with small pictures, direct manipulation, and guided
experiments, then discover the definitions represented by them. Every visual
action will have a precise mathematical meaning, and every computed result will
come with an explanation.

## The basic idea

ScottLab begins at bottom (`⊥`): a state with no specific information yet.
Learners then discover **tokens**, small pieces of information such as
`true`. A token is one observation; a state is the whole picture formed from
the observations known so far. Bottom is a state, not a token.

## Goals

- Teach Scott information systems without requiring prior knowledge of domain
  theory.
- Turn tokens, consistency, entailment closure, states, and the information
  order into interactive visual models.
- Demonstrate continuous maps and least-fixed-point construction step by step.
- Provide a sandbox for creating, validating, and sharing finite information
  systems and bounded approximations of infinite domains.
- Explain validation failures and computed results with concrete witnesses and
  derivation traces.
- Keep the mathematical core deterministic, framework-independent, and well
  tested.
- Make every essential interaction accessible by mouse, touch, and keyboard,
  without relying on color or animation alone.

## Planned experience

ScottLab will combine two closely connected modes:

- **Guided lessons** will introduce observations, consistency, entailment,
  states, information order, continuous maps, and fixed points through short
  interactive tasks.
- **The sandbox** will let users define tokens and rules, compute closure,
  inspect state diagrams, apply mappings, iterate endomaps, and import or export
  shareable examples.

Planned examples include flat Booleans, bounded lazy natural numbers, stream
prefixes, partial trees, and small rule-driven knowledge systems. Infinite
objects will always be presented as explicitly bounded finite approximations.

The first implementation slice is a polished flat-Boolean lesson. It starts at
the least-defined state, lets a learner reveal `true` or `false`, shows why
those observations are incompatible, and visualizes the resulting three-state
information order. Afterward, the learner can inspect the explicit `Δ`
convention and open the same example in a read-only sandbox preview.

## Current status

The mathematical convention, versioned data format, and first lesson flow are
documented. The Vite and React application gives a short historical
introduction, explains why its first model is a Boolean, then begins at `⊥`
and opens it as an empty collection before introducing the `true` and `false`
tokens. It rejects their incompatible combination with a concrete witness and
turns the result into an interactive three-state information order. A final
challenge asks the learner to build the Boolean branch not chosen first. The
advanced phase then distinguishes `Δ` from `⊥` across four focused pages and
opens a hash-addressable, four-area read-only sandbox whose diagram, token
tray, definition, and closure explanation share one selected state.

The framework-independent core validates finite system definitions with
deterministic counterexamples, computes closure traces, recognizes states, and
enumerates the information order. The rule-driven access-permissions lesson
uses that core trace to reveal one active premise-rule-conclusion triple at a
time, provides manual step and replay controls, and ends with a short
transitive-consequence challenge. The following Editing Policy lesson
classifies arbitrary selections as inconsistent, consistent-but-unclosed, or
states using one structured core inspection result. Learners can inspect
concrete witnesses and repair an unclosed selection manually.

The next guided lesson applies an exact finite-generator mapping between two
separately labelled Boolean copies. It reveals the input premise, active
negation generator, and target closure step by step, then asks the learner to
produce a `true` output. The accompanying definition explains why swapping the
incomparable `true` and `false` branches is monotone and Scott continuous, not
order-reversing. The core validates mapping generators, preserves alternate
supports, and returns deterministic application traces. All persisted example
documents are checked against their Draft 2020-12 schemas and semantic
validation covers the Boolean-negation fixture.

## Run locally

ScottLab requires Node.js 20.19+ or 22.12+. Install dependencies and start the
development server:

```sh
npm install
npm run dev
```

Open the address printed by Vite, normally <http://localhost:5173>. Other
root-level checks are `npm test`, `npm run lint`, `npm run typecheck`, and
`npm run build`. Install the Playwright browsers once with
`npx playwright install chromium firefox webkit`, then run the Chromium,
Firefox, and WebKit acceptance matrix with `npm run test:e2e`. Use
`npm run preview` to inspect the static production build.

## References

Mathematical sources are collected in the
[reference notes](docs/references.md).

## Acknowledgment

Development of ScottLab is assisted by OpenAI Codex.

## License

ScottLab is licensed under the [Apache License 2.0](LICENSE).
