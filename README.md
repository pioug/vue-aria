# vue-aria / vue-spectrum

Vue 3 monorepo port of:

- `@react-aria/*` -> `@vue-aria/*` (hooks/state layer)
- `@react-spectrum/*` -> `@vue-spectrum/*` (component layer)

The priority is behavior and accessibility parity with upstream, while keeping Vue-native usage and package boundaries close to the original repo.

## Current migration mode

- `@vue-aria/*`: parity-complete baseline, now in maintenance/hardening mode.
- `@vue-spectrum/*`: active migration.
- Execution strategy: horizontal lane-by-lane parity (runtime + tests + docs + preview usability), currently focused on `button`, `textfield`, and `dialog`.

## Source of truth

- React Aria tracker (completed baseline): `PORTING_TRACKER.md`
- React Spectrum tracker (canonical package checklist): `SPECTRUM_PORTING_TRACKER.md`
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
npm run docs:build
```

## Local development

```bash
npm install
npm run docs:dev
```

## GitHub

- Repository: https://github.com/pioug/vue-aria/
