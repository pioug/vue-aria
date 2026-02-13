# @vue-aria/select

`@vue-aria/select` ports select accessibility hooks from upstream `@react-aria/select`.

## Implemented modules

- `useSelect`
- `useHiddenSelect`
- `HiddenSelect`
- `selectData`

## Upstream-aligned example

```ts
import { useSelect } from "@vue-aria/select";

const triggerRef = { current: null as HTMLElement | null };
const state = {} as any;

const { triggerProps, menuProps, hiddenSelectProps } = useSelect(
  { label: "Color", name: "color" },
  state,
  triggerRef
);
```

## Notes

- Current select state integration is adapter-based and expects an upstream-equivalent state shape.
- `Spectrum S2` is ignored for this port.
