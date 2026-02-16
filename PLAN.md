# Plan: Quality Audit for All Ported Modules

## Objective

Run a complete parity-and-test audit for every ported package against the reference baseline and ensure no implementation or testing gaps remain.

Reference baseline: `references/react-spectrum`

## Scope

- `@react-aria` (54 packages): compare against fixed local targets `@vue-aria/*` only.
- `@react-stately` (32 packages): compare against local `packages/@vue-stately/*`.
- `@react-spectrum` (64 packages): compare against local `packages/@vue-spectrum/*`.
- `@react-types` (47 packages): compare against local `packages/@vue-types/*`.

## Work order

1. Freeze current state and verify mapping table from source to local package names.
2. Build a package-by-package queue in strict order by scope:
   1. `@react-aria`
   2. `@react-stately`
   3. `@react-spectrum`
   4. `@react-types`
3. For each package:
   - run manual parity review against reference and local source,
   - compare exported API surface and behavior,
   - add/repair equivalent tests,
   - run package-level tests.
4. Record package status in `ROADMAP.md` as `TODO` / `In progress` / `Done`.
5. Continue in a strict sequence: always start with the first unchecked package listed in `ROADMAP.md`, and once it is moved to `Done`, immediately start the next unchecked package until none remain.
6. Manually move to the next unchecked package in list order.

## Quality gate for “Done”

A package is `Done` only when all are true:

- Upstream references show no implementation gap (or documented, approved exception).
- Behavioral parity is evidenced by tests.
- Equivalent or stronger tests exist for known edge cases.
- Package-level tests pass in local equivalent of CI.

## Required checks

- Manual mapping check against `references/react-spectrum` for package presence and API parity.
- Scoped package test runs for each touched package.
- Manual path-mapping validation so `@react-*` imports map to expected local packages.

## Commit rule

- No more than one package scope should be advanced per checkpoint.
- Update `ROADMAP.md` and commit only after quality gates are met.
