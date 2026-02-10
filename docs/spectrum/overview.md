# Spectrum Component Layer

This section tracks the Vue port of React Spectrum UI component packages.

## Scope

- Upstream source: `references/react-spectrum/packages/@react-spectrum/*`
- Local target scope: `packages/@vue-spectrum/*`
- Current stage: phase-1 foundation migration plus initial display packages (`@vue-spectrum/icon`, `@vue-spectrum/form`, `@vue-spectrum/label`, `@vue-spectrum/text`, `@vue-spectrum/view`, `@vue-spectrum/layout`, `@vue-spectrum/divider`, `@vue-spectrum/well`, and `@vue-spectrum/statuslight` complete)

## Current Baseline

- `@vue-spectrum/provider`: provider context primitives and media query helpers
- `@vue-spectrum/icon`: icon wrapper component primitives (`Icon`, `UIIcon`, `Illustration`)
- `@vue-spectrum/utils`: shared class-name utility baseline
- `@vue-spectrum/form`: form wrapper and form context primitives (`Form`, `useFormProps`, `useFormValidationErrors`)
- `@vue-spectrum/label`: field/label/help text primitives (`Field`, `Label`, `HelpText`)
- `@vue-spectrum/text`: typography primitives (`Text`, `Heading`, `Keyboard`)
- `@vue-spectrum/view`: semantic container primitives (`View`, `Content`, `Header`, `Footer`)
- `@vue-spectrum/layout`: grid/flex layout primitives (`Grid`, `Flex`, helper functions)
- `@vue-spectrum/divider`: divider primitive (`Divider`)
- `@vue-spectrum/well`: content well primitive (`Well`)
- `@vue-spectrum/statuslight`: status indicator primitive (`StatusLight`)
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
- Cross-browser demos: `/docs/spectrum/cross-browser-demos.md`
- Theming baseline: `/docs/spectrum/theming-baseline.md`

## Scaffolding Helper

Create new package/docs/test stubs with:

```bash
npm run scaffold:spectrum-package -- <package-name>
```
