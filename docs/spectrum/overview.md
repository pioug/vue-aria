# Spectrum Component Layer

This section documents the Vue port of React Spectrum components:

- Upstream: `@react-spectrum/*`
- Local target: `@vue-spectrum/*`

## Migration Priority

- v1 parity first (`@react-spectrum/*` package set).
- S2 parity stays secondary until v1 completion criteria are met.
- Active horizontal lane: `button`, `textfield`, `dialog`.

## Where Progress Is Tracked

- Canonical package checklist: `SPECTRUM_PORTING_TRACKER.md`
- Strategy/priorities: `/porting/spectrum-roadmap`
- Consolidated status and process: `/porting/status`

## Quality Gates

Every package completion is gated by:

```bash
npm run check
npm run test
npm run test:parity
npm run test:spectrum-parity
npm run docs:build
```

## Package Docs

Each package page in `/spectrum/*` includes:

- Current baseline/parity notes
- Usage examples
- A preview suitable for quick manual validation
