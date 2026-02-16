# @vue-stately/toggle

`@vue-stately/toggle` ports upstream `@react-stately/toggle` primitives for single-toggle and toggle-group state.

## Implemented modules

- `useToggleState`
- `useToggleGroupState`

## Upstream-aligned examples

### `useToggleState`

```ts
import { useToggleState } from "@vue-stately/toggle";

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
import { useToggleGroupState } from "@vue-stately/toggle";

const group = useToggleGroupState({
  selectionMode: "multiple",
});

group.toggleKey("bold");
group.toggleKey("italic");
```

## Notes

- This package is non-visual; no base styles are required.
- `Spectrum S2` is out of scope unless explicitly requested.
