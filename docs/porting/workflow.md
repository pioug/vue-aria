# Porting Workflow

Use this process for each hook/component package.

## 1. Select Scope

- Prefer horizontal lanes for active work (small set of related packages/components).
- Confirm upstream source package under `references/react-spectrum/packages`.

## 2. Port Runtime Behavior

- Implement in `packages/@vue-aria/<pkg>/src` or `packages/@vue-spectrum/<pkg>/src`.
- Keep Vue-native API shape, but preserve upstream semantics.

## 3. Port Tests

- Port relevant upstream scenarios into package `test/`.
- Cover keyboard, pointer, and assistive/virtual behavior where relevant.

## 4. Wire Exports

- Ensure package `src/index.ts` exports are correct.
- Update umbrella exports in `packages/@vue-aria/vue-aria/src/index.ts` or `packages/@vue-spectrum/vue-spectrum/src/index.ts`.

## 5. Validate

```bash
npm run check
npm run test -- <targeted-tests>
npm run test:parity
npm run test:spectrum-parity
npm run docs:build
```

## 6. Update Docs

- Add/refresh package docs page.
- Update canonical trackers and roadmap references:
  - `PORTING_TRACKER.md` (React Aria layer)
  - `SPECTRUM_PORTING_TRACKER.md` (React Spectrum layer)
  - `docs/porting/spectrum-roadmap.md` (strategy/priorities only)
