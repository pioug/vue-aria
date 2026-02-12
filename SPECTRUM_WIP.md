# Spectrum WIP Lock

This file enforces the active package lock for the React Spectrum v1 migration lane.

- Active package lock: `@react-spectrum/inlinealert`
- Execution mode: `single-package`
- Updated: `2026-02-12`

## Slice Rules

1. Only one package is in progress at a time (the active lock above).
2. A package switch is allowed only after a completed parity slice commit.
3. Every completed slice commit must include, for the active package:
   - runtime behavior updates (`packages/@vue-spectrum/<pkg>/src`)
   - upstream-style tests (`packages/@vue-spectrum/<pkg>/test`)
   - docs preview/usability updates (`docs/spectrum/<pkg>.md` and style aliases when needed)
   - umbrella export verification (`packages/@vue-spectrum/vue-spectrum/src/index.ts`)
   - tracker updates (`SPECTRUM_PORTING_TRACKER.md`, `SPECTRUM_TESTCASE_TRACKER.md` when regenerated)

## Validation Commands

```bash
npm run check:spectrum-workflow
npm run test:spectrum-parity
npm run test:spectrum-case-parity
```
