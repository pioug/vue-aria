# @vue-stately/list

`@vue-stately/list` ports list state management utilities from upstream `@react-stately/list`.

## Implemented modules

- `ListCollection`
- `useListState`
- `UNSTABLE_useFilteredListState`
- `useSingleSelectListState`

## Upstream-aligned example

```ts
import { useSingleSelectListState } from "@vue-stately/list";

const state = useSingleSelectListState({
  defaultSelectedKey: "2",
  items: [
    { id: "1", label: "Red" },
    { id: "2", label: "Blue" },
    { id: "3", label: "Green" }
  ],
  getKey: (item) => item.id,
  getTextValue: (item) => item.label
});
```

## Notes

- `items` accepts either prebuilt `Node` objects or plain data records with `getKey`/`getTextValue`.
- `Spectrum S2` is ignored for this port.
