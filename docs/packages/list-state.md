# @vue-aria/list-state

`@vue-aria/list-state` ports list state management utilities from upstream `@react-stately/list`.

## Implemented modules

- `ListCollection`
- `useListState`
- `UNSTABLE_useFilteredListState`
- `useSingleSelectListState`

## Upstream-aligned example

```ts
import { useSingleSelectListState } from "@vue-aria/list-state";

const state = useSingleSelectListState({
  defaultSelectedKey: "a",
  items: [
    { type: "item", key: "a", textValue: "A", childNodes: [] } as any,
    { type: "item", key: "b", textValue: "B", childNodes: [] } as any
  ]
});
```

## Notes

- `Spectrum S2` is ignored for this port.
