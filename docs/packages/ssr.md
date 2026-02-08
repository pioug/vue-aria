# @vue-aria/ssr

SSR and id-related primitives.

## `useId`

Creates a stable id and supports an explicit override.

```ts
import { useId } from "@vue-aria/ssr";

const id = useId(); // "v-aria-1", etc.
const custom = useId("field-id");
```

### Signature

```ts
useId(explicitId?: MaybeReactive<string | undefined>, prefix?: string)
```

### Behavior

- Returns `explicitId` when provided.
- Falls back to generated ids with a configurable prefix.
- Keeps fallback stable per composable instance.

### Current Gap vs React Aria

- Deterministic SSR hydration strategy (`SSRProvider` equivalent) is still pending.
