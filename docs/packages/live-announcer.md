# @vue-aria/live-announcer

`@vue-aria/live-announcer` ports the global screen-reader announcement utility from upstream `@react-aria/live-announcer`.

## Implemented modules

- `announce`
- `clearAnnouncer`
- `destroyAnnouncer`

## Upstream-aligned examples

### announce text

```ts
import { announce } from "@vue-aria/live-announcer";

announce("Changes saved", "assertive");
```

### announce labelled content

```ts
import { announce } from "@vue-aria/live-announcer";

announce({ "aria-labelledby": "status-label" }, "polite");
```

### clear and destroy

```ts
import { clearAnnouncer, destroyAnnouncer } from "@vue-aria/live-announcer";

clearAnnouncer("assertive");
destroyAnnouncer();
```

## Notes

- `Spectrum S2` is ignored for this port.
- Remaining work focuses on downstream integration coverage and documentation parity depth.
