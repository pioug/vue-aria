# @vue-aria/actiongroup

`@vue-aria/actiongroup` ports the upstream action group hooks from `@react-aria/actiongroup`.

## Implemented modules

- `useActionGroup`
- `useActionGroupItem`

## Features

- Toolbar/radiogroup role mapping based on selection mode.
- Arrow-key roving focus behavior with locale-aware horizontal direction (LTR/RTL).
- Item-level role/checked/focus wiring via `useActionGroupItem`.
- Nested-toolbar role downgrade (`toolbar` parent -> child role `group`).

## Upstream-aligned examples

### Group-level wiring with list state

```ts
import { useActionGroup } from "@vue-aria/actiongroup";
import { useListState } from "@vue-aria/list-state";
import { ref } from "vue";

const state = useListState({
  selectionMode: "single",
  items: [{ id: "left" }, { id: "center" }, { id: "right" }],
  getKey: (item) => item.id,
});

const groupRef = ref<HTMLElement | null>(null);
const groupRefAdapter = {
  get current() {
    return groupRef.value;
  },
  set current(value: Element | null) {
    groupRef.value = value as HTMLElement | null;
  },
};

const { actionGroupProps } = useActionGroup(
  { selectionMode: "single", "aria-label": "Text alignment" },
  state,
  groupRefAdapter
);
```

### Item-level props

```ts
import { useActionGroupItem } from "@vue-aria/actiongroup";

const { buttonProps } = useActionGroupItem({ key: "left" }, state);
```

### Interactive render pattern (Vue)

```ts
import { h } from "vue";

return () =>
  h("div", { ...actionGroupProps, ref: groupRef }, [
    h("button", { ...useActionGroupItem({ key: "left" }, state).buttonProps }, "Left"),
    h("button", { ...useActionGroupItem({ key: "center" }, state).buttonProps }, "Center"),
    h("button", { ...useActionGroupItem({ key: "right" }, state).buttonProps }, "Right"),
  ]);
```

### Nested-toolbar behavior

```ts
return () =>
  h("div", { role: "toolbar" }, [
    h("div", { ...actionGroupProps, ref: groupRef }),
  ]);
// `actionGroupProps.role` resolves to "group" when nested in a toolbar.
```

## Notes

- Keyboard roving/focus behavior follows upstream toolbar/radiogroup semantics.
- `Spectrum S2` is ignored for this port.
