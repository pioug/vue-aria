# @vue-aria/live-announcer

Live region announcement primitives.

## `announce`

Announces a message for assistive technologies using hidden live regions.

## `clearAnnouncer`

Clears queued/present announcements for assertive/polite channels.

## `destroyAnnouncer`

Removes the announcer node from the DOM.

```ts
import {
  announce,
  clearAnnouncer,
  destroyAnnouncer,
} from "@vue-aria/live-announcer";

announce("Saved", "polite");
```

### Behavior

- Creates a singleton hidden live region in `document.body`.
- Supports `assertive` and `polite` channels.
- Auto-cleans announcements after a timeout.
