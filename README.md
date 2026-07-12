# ScottLab

> [!IMPORTANT]
> **ScottLab is under construction.** The project is currently in its planning
> and specification phase; there is no usable application yet.

ScottLab is a planned browser-based playground for learning, constructing, and
experimenting with [Scott information systems](https://doi.org/10.1007/BFb0012801).
It aims to make partial information, consistency, entailment, domains,
continuous maps, and least fixed points visible and executable.

The project is intended to feel like an interactive mathematical exhibit.
Learners will begin with small pictures, direct manipulation, and guided
experiments, then discover the definitions represented by them. Every visual
action will have a precise mathematical meaning, and every computed result will
come with an explanation.

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
three-state information order.

## Current status

Work is beginning with the mathematical and visual specification: selecting a
precise information-system axiomatisation, defining the versioned data format
and algorithms, and prototyping the initial lesson. The first public release is
planned as a static website suitable for GitHub Pages.

## References

Mathematical sources are collected in the
[reference notes](docs/references.md).

## Acknowledgment

Development of ScottLab is assisted by OpenAI Codex.

## License

ScottLab is licensed under the [Apache License 2.0](LICENSE).
