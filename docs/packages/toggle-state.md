# @vue-aria/toggle-state

`@vue-aria/toggle-state` ports upstream `@react-stately/toggle` primitives for single-toggle and toggle-group state.

## Implemented modules

- `useToggleState`
- `useToggleGroupState`

## Upstream-aligned examples

### `useToggleState`

```ts
import { useToggleState } from "@vue-aria/toggle-state";

const state = useToggleState({
  defaultSelected: false,
  onChange: (selected) => {
    console.log("selected", selected);
  },
});

state.toggle();
```

### `useToggleGroupState`

```ts
import { useToggleGroupState } from "@vue-aria/toggle-state";

const group = useToggleGroupState({
  selectionMode: "multiple",
});

group.toggleKey("bold");
group.toggleKey("italic");
```

## Notes

- This package is non-visual; no base styles are required.
- `Spectrum S2` is out of scope unless explicitly requested.
