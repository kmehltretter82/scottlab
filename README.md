# ScottLab

> [!IMPORTANT]
> **ScottLab is under construction.** A small local preview now introduces the
> bottom state; the complete lesson and sandbox are not implemented yet.

ScottLab is a planned browser-based playground for learning, constructing, and
experimenting with [Scott information systems](https://doi.org/10.1007/BFb0012801).
It aims to make partial information, consistency, entailment, domains,
continuous maps, and least fixed points visible and executable.

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

The first implementation slice will be a polished flat-Boolean lesson. It will
start at the least-defined state, let a learner reveal `true` or `false`, show
why those observations are incompatible, and visualize the resulting
three-state information order. Afterward, the learner can open the same example
in a read-only sandbox preview.

## Current status

The mathematical convention, versioned data format, and first lesson flow are
documented. The initial Vite and React application begins at `⊥` and lets the
learner look inside to distinguish the state from its `Δ` token.

## Run locally

ScottLab requires Node.js 20.19+ or 22.12+. Install dependencies and start the
development server:

```sh
npm install
npm run dev
```

Open the address printed by Vite, normally <http://localhost:5173>. Other
root-level checks are `npm test`, `npm run lint`, `npm run typecheck`, and
`npm run build`. Use `npm run preview` to inspect the static production build.

## References

Mathematical sources are collected in the
[reference notes](docs/references.md).

## Acknowledgment

Development of ScottLab is assisted by OpenAI Codex.

## License

ScottLab is licensed under the [Apache License 2.0](LICENSE).
