# @vue-aria/toast-state

`@vue-aria/toast-state` ports upstream `@react-stately/toast` queue/state management.

## API

- `useToastState`
- `useToastQueue`
- `ToastQueue`

## Example

```ts
import { useToastState } from "@vue-aria/toast-state";

const state = useToastState<string>({ maxVisibleToasts: 2 });
state.add("First toast", { timeout: 5000 });
state.add("Second toast", { timeout: 5000 });
```

## Queue behavior

```ts
import { ToastQueue } from "@vue-aria/toast-state";

const queue = new ToastQueue<string>({ maxVisibleToasts: 1 });
queue.add("A");
queue.add("B");
console.log(queue.visibleToasts[0].content); // "B"
```

## Timers

```ts
const state = useToastState<string>();
state.add("Timed toast", { timeout: 3000 });
state.resumeAll();
state.pauseAll();
state.resumeAll();
```

## Notes

- Matches upstream add/close/queue ordering semantics.
- `pauseAll()`/`resumeAll()` apply to visible toasts and preserve partial remaining timeout durations.
- `wrapUpdate` is supported for transition wrappers.
- `Spectrum S2` is ignored for this port.
