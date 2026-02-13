# @vue-aria/aria-modal-polyfill

`@vue-aria/aria-modal-polyfill` ports the upstream modal watcher utility from `@react-aria/aria-modal-polyfill`.

It observes a modal root and applies `aria-hidden` to surrounding content while overlays marked with `aria-modal="true"` or `data-ismodal="true"` are mounted.

## Implemented modules

- `watchModals`

## Upstream-aligned examples

### Watch the default modal root (`body`)

```ts
import { watchModals } from "@vue-aria/aria-modal-polyfill";

const stopWatching = watchModals();

// Later, during app teardown:
stopWatching();
```

### Watch a custom root selector

```ts
import { watchModals } from "@vue-aria/aria-modal-polyfill";

watchModals(".my-modal-root");
```

## Notes

- This utility uses `aria-hidden`'s `hideOthers` helper internally, matching upstream behavior.
- `Spectrum S2` is ignored for this port.
