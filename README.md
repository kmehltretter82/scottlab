# ScottLab

**[Open ScottLab](https://kmehltretter82.github.io/scottlab/)** ·
[Concise reference](https://kmehltretter82.github.io/scottlab/reference.html) ·
[For instructors](https://kmehltretter82.github.io/scottlab/instructors.html)

ScottLab is an interactive browser playground for learning, constructing,
and experimenting with
[Scott information systems](https://doi.org/10.1007/BFb0012801), the
constructive presentation of domain theory introduced by
[Dana S. Scott](https://www.cs.cmu.edu/~scott/). It makes partial
information, consistency, entailment, states, the information order,
continuous maps, and least fixed points visible and executable — and it
answers questions such as: what does a program mean before it finishes?
Why does `take 3` work on an infinite list?

ScottLab is an interactive mathematical exhibit, not a form editor.
Learners begin with small pictures and direct manipulation, then discover
the definitions those pictures realize. Every visual action has a precise
mathematical meaning, and every computed result comes with an explanation
and, on failure, a concrete witness.

## The basic idea

ScottLab begins at bottom (`⊥`): a state with no specific information yet.
Learners then discover **tokens**, small pieces of information such as
`true`. A token is one observation; a state is the whole picture formed
from the observations known so far. Bottom is a state, not a token.

## Version 1 — complete

The guided trail has seven stations plus two free-exploration surfaces:

1. **Bottom, tokens, consistency, order** — the hands-on flat-Boolean arc,
   from `⊥` through the conflict witness to the three-state information
   order and its branch challenge.
2. **Formalisation** — the explicit distinguished token `Δ`, the tuple
   `A = (T, Δ, Con, ⊢)`, the derivation `closure(∅) = {Δ} = ⊥`, and a
   documented bridge to the Δ-free presentations of the literature.
3. **Entailment** — a rule-driven closure trace with manual stepping,
   framed honestly as bottom-up Datalog, plus the non-flat Coquand system
   where one multi-premise rule bends the whole order.
4. **States** — classify arbitrary selections as inconsistent, unclosed,
   or states, with witnesses, and repair one by hand.
5. **Continuous maps** — apply the Boolean-negation mapping step by step,
   then meet the capstone: the eleven-state function space
   `[Bool → Bool]`, drawn as a Hasse diagram in which your own negation
   map is one of the four maximal points.
6. **Fixed points** — Kleene iteration from `⊥` on bounded lazy naturals
   and on stream prefixes (`ones = 1 : ones`), with every bounded
   truncation labeled, and Boolean negation as the
   least-fixed-point-is-bottom counterpoint.
7. **Games** — retrograde analysis of a take-away game as a fixed-point
   iteration, ending with a "same mathematics, elsewhere" panel (Minlog's
   coherent systems, coherence spaces and linear logic, formal topology,
   event structures, formal concept analysis).

The **read-only sandbox** synchronizes a state diagram, token tray,
definition, and closure explanation, with the selection encoded in a
shareable URL. The **gallery** opens every example system, quizzes the
learner on random selections against the core's verdict, exports
deterministic JSON, imports systems (validated structurally and against
the semantic laws before activation), and derives systems from small
formal-concept cross-tables.

Lesson progress persists in the browser; every route is hash-addressable
and crawlable; a widget for lecture notes can be embedded via
`embed.html?system=<id>`. The interface is fully bilingual (English and
German), keyboard-operable, reduced-motion aware, and never relies on
color alone.

The framework-independent core validates finite systems exhaustively with
deterministic counterexamples (cached per definition), computes closure
and mapping traces, recognizes and enumerates states, iterates endomaps to
least fixed points with stabilization witnesses, and enumerates finite
function spaces. All persisted documents are checked against Draft
2020-12 schemas and the semantic laws.

## Run locally

ScottLab requires Node.js 20.19+ or 22.12+. Install dependencies and start
the development server:

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
[reference notes](docs/references.md); the conventions the implementation
follows are specified in
[the mathematical conventions](docs/mathematical-conventions.md).

## Acknowledgment

Development of ScottLab is assisted by OpenAI Codex and Claude Code.

## License

ScottLab is licensed under the [Apache License 2.0](LICENSE).
