# Porting Workflow

Use this process for each new hook/component.

## 1. Locate Upstream Source

- Find package and hook under `references/react-spectrum/packages`.
- Identify all related helpers and state dependencies.

## 2. Port Minimal Behavior

- Create package-local file in `packages/@vue-aria/<pkg>/src`.
- Keep API Vue-native but semantics React Aria-aligned.

## 3. Port Tests

- Create matching scenarios in `packages/@vue-aria/<pkg>/test`.
- Cover keyboard, pointer, and assistive/virtual behavior where relevant.

## 4. Wire Exports

- Add package `src/index.ts` exports.
- Update umbrella exports in `packages/@vue-aria/vue-aria/src/index.ts`.

## 5. Validate

```bash
npm run check
npm run test
npm run test:parity
```

## 6. Update Docs

- Add/refresh package docs page.
- Update roadmap and tracker status.
