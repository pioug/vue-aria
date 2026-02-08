# Architecture

## Goal

Match React Aria behavior in Vue while keeping package boundaries and test expectations explicit.

## Package Design

Each package is scoped to a single concern:

- `@vue-aria/types`: shared event and reactive utility types
- `@vue-aria/utils`: prop-merging and low-level helpers
- `@vue-aria/ssr`: id generation and SSR-related primitives
- `@vue-aria/focus`: focus visibility and focus ring behavior
- `@vue-aria/interactions`: generic input interactions (`press`, `hover`, etc.)
- `@vue-aria/button`: semantic button behavior built from lower-level packages
- `@vue-aria/vue-aria`: umbrella exports

## Layering Rules

1. `types` and `utils` are leaf dependencies.
2. `focus` and `interactions` build interaction primitives.
3. semantic packages (e.g. `button`) compose those primitives.
4. `vue-aria` re-exports package public APIs only.

## Reference Source

Use `references/react-spectrum` for:

- hook behavior edge cases
- event semantics
- accessibility attributes
- test-case parity
