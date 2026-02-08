# Test Parity

Behavior parity is required for every ported hook.

## Rules

1. Read upstream implementation and tests from `references/react-spectrum`.
2. Port behavior first, then port the corresponding test scenarios.
3. Do not mark a hook complete until both implementation and test parity pass.

## Local Commands

```bash
npm run test
npm run test:parity
```

## Current Coverage

Current test files:

- `packages/@vue-aria/utils/test/mergeProps.test.ts`
- `packages/@vue-aria/ssr/test/useId.test.ts`
- `packages/@vue-aria/focus/test/useFocusVisible.test.ts`
- `packages/@vue-aria/focus/test/useFocusRing.test.ts`
- `packages/@vue-aria/interactions/test/usePress.test.ts`
- `packages/@vue-aria/interactions/test/useKeyboard.test.ts`
- `packages/@vue-aria/interactions/test/useFocus.test.ts`
- `packages/@vue-aria/interactions/test/useFocusWithin.test.ts`
- `packages/@vue-aria/interactions/test/useHover.test.ts`
- `packages/@vue-aria/button/test/useButton.test.ts`
- `packages/@vue-aria/link/test/useLink.test.ts`

## What "Parity" Means

- Keyboard, pointer, and virtual-input behavior must align.
- Accessibility attributes and semantics must align.
- Cancellation and edge-case behavior should match upstream expectations.
