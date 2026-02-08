# @vue-aria/ssr

SSR and id-related primitives.

## `useId`

Creates a stable id and supports an explicit override.

## `provideSSR`

Provides an SSR id scope so generated ids stay deterministic within a request/render tree.

## `useIsSSR`

Returns whether the current SSR scope is in server-render mode.

```ts
import { provideSSR, useId, useIsSSR } from "@vue-aria/ssr";

provideSSR({ isSSR: true });

const id = useId(); // "v-aria-1", etc.
const custom = useId("field-id");
const isSSR = useIsSSR();
```

### Signature

```ts
useId(explicitId?: MaybeReactive<string | undefined>, prefix?: string)
```

### Behavior

- Returns `explicitId` when provided.
- Falls back to generated ids with a configurable prefix.
- Keeps fallback stable per composable instance.
- Supports deterministic nested id scopes via `provideSSR`.
