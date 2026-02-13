# Vue Aria / Vue Spectrum Port Plan

## 1) Mission
Port React Aria and React Spectrum to Vue 3 from scratch with strict parity.

Definition of parity:
- API parity: same public component/module names, prop names, event semantics, and helper exports.
- Implementation parity: follow upstream functions, parameters, and behavioral logic as closely as possible.
- Behavioral parity: identical user interaction behavior (keyboard, pointer, focus, selection, dismissal, validation, async/loading states).
- Visual parity: UI output must match upstream docs/examples exactly, including base styles and variants.
- Accessibility parity: match upstream ARIA roles/attributes, focus management, announcements, and interaction patterns.
- Documentation parity: same examples, guidance, explanations, and usage patterns in Vue form.

## 2) Core Rules
- Mirror upstream package/folder structure.
- Preserve package boundaries and module responsibility.
- Reuse framework-agnostic dependencies as-is; copy internal private packages when needed.
- Remove React runtime dependencies from ported packages.
- Make Vue APIs idiomatic:
  - Composables for hooks.
  - Slots for render customization.
  - `v-model` for controlled/uncontrolled value patterns where appropriate.
  - Template refs and `defineExpose` for imperative handles.
  - `defineEmits` for event contracts.
  - `provide`/`inject` for shared contextual state.
- If upstream references SSR behavior, implement Vue 3 SSR compatibility via Vite.
- If no clean idiomatic Vue styling option exists, use separate vanilla CSS files.

## 3) Testing Rules
- Copy all relevant upstream tests and adapt to Vue tooling while preserving intent and assertions.
- Follow Vue testing guidance: https://vuejs.org/guide/scaling-up/testing
- Maintain and extend test parity trackers for every package:
  - Source upstream test file
  - Ported Vue test file
  - Status (not started/in progress/passing)
  - Notes on intentional deviations (must be rare and justified)
- Run automated tests before every commit.
- A package cannot be marked complete until its migrated tests pass.

## 4) Documentation Rules
- Use VitePress and/or Storybook as appropriate per package/component.
- Port docs with matching examples and equivalent structure.
- Reuse upstream base styles and demonstration patterns.
- Ensure docs clearly show Vue-specific usage without changing upstream behavior.

## 5) Package Completion Criteria
A package is complete only when all are true:
1. Public API parity is implemented and exported.
2. Behavioral parity is validated by tests.
3. Visual parity is validated against upstream docs/examples.
4. Accessibility behavior matches upstream expectations.
5. All relevant tests are ported and passing.
6. No remaining React dependencies in that package.
7. Docs/examples for that package are ported and accurate.

Porting is complete only when all consumable React hooks/components plus public helpers/shared libraries have been migrated.

## 6) Workflow Per Package
1. Select next package from roadmap.
2. Diff upstream API surface vs current Vue package.
3. Implement missing composables/components/helpers with parity-first logic.
4. Port and run tests; fix until passing.
5. Port docs/examples/styles.
6. Update trackers (`ROADMAP.md` and package-level parity docs).
7. Commit and push.

## 7) Git Discipline
- Commit frequently in small, reviewable units.
- Always run relevant automated tests before commit.
- Push regularly to keep recoverable progress.
- Commit message format:
  - `feat(<package>): port <module/component>`
  - `test(<package>): port upstream tests for <module/component>`
  - `docs(<package>): port docs/examples for <module/component>`
  - `chore(tracker): update roadmap and parity status`

## 8) Roadmap and Progress Tracking
`ROADMAP.md` is the canonical progress file and must always be up to date.

Each package section in `ROADMAP.md` must include:
- Scope:
  - Upstream package/module coverage
  - Public API checklist
- Implementation status:
  - Not started / In progress / Complete
- Test status:
  - Total upstream tests
  - Ported tests
  - Passing tests
  - Gaps with reasons
- Docs status:
  - Ported pages/examples
  - Missing pages/examples
- Accessibility status:
  - Completed checks and pending checks
- Visual parity status:
  - Completed comparisons and pending comparisons
- React dependency status:
  - Remaining dependencies (must be empty when complete)
- Next actionable tasks:
  - Small, explicit checklist so another AI agent can resume immediately

## 9) Non-Negotiables
- Do not declare parity without tests and docs parity evidence.
- Do not mark package complete with failing or missing migrated tests.
- Do not diverge from upstream API names unless explicitly documented and approved.
- Do not leave roadmap or trackers stale after implementation changes.
- Ignore Spectrum S2 (the next Spectrum version). It is out of scope for this port unless explicitly requested later.
