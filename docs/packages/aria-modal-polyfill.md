# @vue-aria/aria-modal-polyfill

`@vue-aria/aria-modal-polyfill` ports the upstream modal watcher utility from `@react-aria/aria-modal-polyfill`.

It observes a modal root and applies `aria-hidden` to surrounding content while overlays marked with `aria-modal="true"` or `data-ismodal="true"` are mounted.

## Implemented modules

- `watchModals`

## Features

- Watches a modal root for mounted/unmounted modal containers.
- Hides non-modal siblings via `aria-hidden` while modal content is present.
- Restores previous hidden state when nested modal stacks unwind.
- Preserves live announcer nodes (`[data-live-announcer="true"]`) while modals are open.

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

### Modal container markup shape

```html
<div id="overlay-root">
  <div>
    <div role="dialog" aria-modal="true">...</div>
  </div>
</div>
```

`data-ismodal="true"` is also supported as a modal marker for compatibility with upstream overlay stacks.

### Custom document support

```ts
import { watchModals } from "@vue-aria/aria-modal-polyfill";

const iframeDocument = iframe.contentWindow?.document;
const stopWatching = watchModals("#overlay-root", { document: iframeDocument });
```

### Cleanup on teardown

```ts
const stopWatching = watchModals("#overlay-root");
// During app/provider teardown:
stopWatching();
```

## Notes

- This utility uses `aria-hidden`'s `hideOthers` helper internally, matching upstream behavior.
- Behavior parity includes both modal marker paths (`aria-modal` and `data-ismodal`) and non-modal mutation no-op handling.
- `Spectrum S2` is ignored for this port.
