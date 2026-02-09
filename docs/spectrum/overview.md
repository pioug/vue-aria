# Spectrum Component Layer

This section tracks the Vue port of React Spectrum UI component packages.

## Scope

- Upstream source: `references/react-spectrum/packages/@react-spectrum/*`
- Local target scope: `packages/@vue-spectrum/*`
- Current stage: foundational scaffolding

## Current Baseline

- `@vue-spectrum/provider`: provider context primitives and media query helpers
- `@vue-spectrum/icon`: icon wrapper component primitives (`Icon`, `UIIcon`, `Illustration`)
- `@vue-spectrum/utils`: shared class-name utility baseline
- `@vue-spectrum/vue-spectrum`: umbrella export package for the component layer

## Rules For Marking A Package Complete

1. Runtime behavior ported from upstream package intent.
2. Upstream-equivalent tests ported and passing.
3. Package docs page added under `docs/spectrum/`.
4. Package exported via `@vue-spectrum/vue-spectrum`.
5. Parity and repo checks pass:

```bash
npm run check
npm run test
npm run test:spectrum-parity
npm run test:cross-browser
```

## Tracker

- Checklist: `/SPECTRUM_PORTING_TRACKER.md`
- Strategy and phases: `/docs/porting/spectrum-roadmap.md`
