# ScottLab References

This bibliography records the mathematical sources that guide ScottLab. The
notes emphasize material relevant to a visual and educational presentation of
Scott information systems.

## Primary Source

### Dana S. Scott, “Domains for Denotational Semantics” (1982)

- [DOI: 10.1007/BFb0012801](https://doi.org/10.1007/BFb0012801)
- Published in *Automata, Languages and Programming*, LNCS 140, pages 577–610.

This is the central source for ScottLab. Its presentation closely matches the
project's intended progression:

- Section 2 defines information systems and develops examples.
- Section 3 constructs the elements, or states, of a system.
- Section 4 relates those states to lattices and topology.
- Section 5 introduces approximable mappings.
- Sections 6 and 7 construct products, sums, and function spaces.
- Section 8 discusses recursive domain equations.

The implementation must select and document its exact finite interpretation of
Scott's axioms rather than silently weakening or replacing them.

## Supporting Source

### Dana S. Scott, *Lectures on a Mathematical Theory of Computation* (1981)

- [Oxford publication record](https://www.cs.ox.ac.uk/publications/publication3742-abstract.html)
- Oxford University Computing Laboratory Technical Monograph PRG-19.

These lectures use neighborhood systems, an equivalent predecessor to the
information-system presentation. They are useful for intuition and historical
context, especially:

- Lecture I: domains given by neighborhoods;
- Lecture II: mappings between domains;
- Lecture IV: fixed points and recursion; and
- Lectures VI–VIII: domain equations, effective domains, and a universal
  domain.

Scott's 1982 information-system formulation should remain authoritative when
the two presentations differ in terminology or organization.

## Additional Background

These sources are useful but are not required for the first implementation.
They are linked rather than copied into the project.

### Dana S. Scott, “Data Types as Lattices” (1976)

- [DOI: 10.1137/0205037](https://doi.org/10.1137/0205037)
- Published in *SIAM Journal on Computing* 5(3), pages 522–587.

This paper provides broader background on partial objects, continuous
lattices, computability, function spaces, and fixed points. Its lattice-first
presentation is mathematically important, but it is not the model for
ScottLab's introductory learning path.

### Dana S. Scott, *Outline of a Mathematical Theory of Computation* (1970)

- [Oxford publication record](https://www.cs.ox.ac.uk/publications/publication3720-abstract.html)
- Oxford University Computing Laboratory Technical Monograph PRG-2.

This monograph gives historical context for approximation orders, continuity,
computability, and the early development of mathematical semantics.

### Samson Abramsky and Achim Jung, “Domain Theory” (1994)

- Published in *Handbook of Logic in Computer Science*, Volume 3.

This is a broader modern reference for domain-theoretic definitions and their
relationships. It is best used after the concrete information-system model is
stable.
