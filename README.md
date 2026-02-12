# vue-aria / vue-spectrum

Vue 3 monorepo port of:

- `@react-aria/*` -> `@vue-aria/*` (hooks/state layer)
- `@react-spectrum/*` -> `@vue-spectrum/*` (component layer)

The priority is behavior and accessibility parity with upstream, while keeping Vue-native usage and package boundaries close to the original repo.

## Parity contract

For `@vue-spectrum/*`, completion means:

1. 100% upstream parity for behavior + API semantics.
2. Proven by upstream test parity for the package:
missing upstream named cases = `0`
missing upstream test files = `none`
3. Similar repository/package architecture and documentation model to upstream.
4. Similar base component appearance via the shared Spectrum docs style baseline.

## Current migration mode

- `@vue-aria/*`: parity-complete baseline, now in maintenance/hardening mode.
- `@vue-spectrum/*`: active migration.
- Execution strategy: horizontal lane-by-lane parity (runtime + tests + docs + preview usability) focused on React Spectrum v1 package completion.
- `@vue-spectrum/s2`: deprioritized/paused for new feature work until v1 parity and quality gates are complete (only regression or unblocker fixes are in scope).

## Source of truth

- React Aria tracker (completed baseline): `PORTING_TRACKER.md`
- React Spectrum tracker (canonical package checklist): `SPECTRUM_PORTING_TRACKER.md`
- React Spectrum test-case tracker (canonical upstream parity counts): `SPECTRUM_TESTCASE_TRACKER.md`
- React Spectrum style readiness tracker (completion gate): `SPECTRUM_STYLE_TRACKER.md`
- React Spectrum active WIP lock and slice rules: `SPECTRUM_WIP.md`
- Strategy/phases and current lane: `docs/porting/spectrum-roadmap.md`
- Documentation status page: `docs/porting/status.md`

## Upstream reference

Upstream source is available as a submodule:

- `references/react-spectrum`

It is used as the parity reference for runtime behavior, tests, and package structure.

## Repository layout

- `packages/@vue-aria/*`: hook/state packages
- `packages/@vue-spectrum/*`: component packages
- `packages/@vue-aria/vue-aria`: hook umbrella exports
- `packages/@vue-spectrum/vue-spectrum`: component umbrella exports
- `docs/*`: docs site (guides, package docs, Spectrum component docs, porting status)

## Quality gates

```bash
npm run check
npm run test
npm run test:parity
npm run test:spectrum-parity
npm run test:spectrum-case-parity
npm run test:spectrum-case-parity:diagnostics
npm run check:spectrum-workflow
npm run docs:build
```

## Porting workflow commands

```bash
# Refresh test-case parity counts/report.
npm run update:spectrum-case-tracker

# Optional: include local-only named-case diagnostics in report/console output.
npm run update:spectrum-case-tracker:diagnostics

# Dry-run missing upstream named-case scaffolding (no writes).
npm run scaffold:spectrum-missing-tests

# Write __upstream-missing__.test.ts scaffolds for all mapped packages.
npm run scaffold:spectrum-missing-tests -- --write

# Optional: include S2 in scaffold generation.
npm run scaffold:spectrum-missing-tests -- --write --include-s2

# Mine docs style alias gaps and write report.
npm run docs:style-alias-gaps
```

## Local development

```bash
npm install
npm run docs:dev
```

## GitHub

- Repository: https://github.com/pioug/vue-aria/
