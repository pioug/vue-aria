# @vue-stately/tabs

`@vue-stately/tabs` ports upstream `@react-stately/tabs` state management for tab selection and focus behavior.

## Implemented modules

- `useTabListState`

## Upstream-aligned example

```ts
import { useTabListState } from "@vue-stately/tabs";

const state = useTabListState({
  items: [
    { id: "tab-1", label: "One" },
    { id: "tab-2", label: "Two" },
  ],
  getKey: (item) => item.id,
  getTextValue: (item) => item.label,
});

state.setSelectedKey("tab-2");
```

## Notes

- This package is non-visual state logic; no base styles are required.
- `Spectrum S2` is out of scope unless explicitly requested.
