# @vue-aria/toast

`@vue-aria/toast` ports the toast accessibility hooks from upstream `@react-aria/toast`.

## Implemented modules

- `useToast`
- `useToastRegion`

## Upstream-aligned examples

### Toast item hooks

```ts
import { useToast } from "@vue-aria/toast";

const { toastProps, contentProps, titleProps, descriptionProps, closeButtonProps } = useToast(
  { toast },
  state,
  toastRef
);
```

### Toast region hooks

```ts
import { useToastRegion } from "@vue-aria/toast";

const { regionProps } = useToastRegion({}, state, regionRef);
```

## Notes

- The current slice includes base hook parity and adapted tests for core toast props and close actions.
- `Spectrum S2` is ignored for this port.
