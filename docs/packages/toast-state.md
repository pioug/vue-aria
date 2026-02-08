# @vue-aria/toast-state

State management for toast queues, visibility windows, and pause/resume timers.

## `useToastState`

Provides:

- queued toast insertion/removal
- configurable max visible toasts
- pause/resume support for visible toast timers
- optional wrapped updates for animated transitions

```ts
import { useToastState } from "@vue-aria/toast-state";

const state = useToastState<string>({
  maxVisibleToasts: 2,
});

state.add("Saved", { timeout: 5000 });
state.pauseAll();
state.resumeAll();
```
