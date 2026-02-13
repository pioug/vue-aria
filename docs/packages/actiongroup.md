# @vue-aria/actiongroup

`@vue-aria/actiongroup` ports the upstream action group hooks from `@react-aria/actiongroup`.

## Implemented modules

- `useActionGroup`
- `useActionGroupItem`

## Upstream-aligned examples

### Group-level props

```ts
import { useActionGroup } from "@vue-aria/actiongroup";
import { useListState } from "@vue-aria/list-state";

const state = useListState({
  selectionMode: "single",
  items: [{ id: "left" }, { id: "center" }, { id: "right" }],
  getKey: (item) => item.id,
});

const groupRef = { current: null as Element | null };
const { actionGroupProps } = useActionGroup(
  { selectionMode: "single", "aria-label": "Text alignment" },
  state,
  groupRef
);
```

### Item-level props

```ts
import { useActionGroupItem } from "@vue-aria/actiongroup";

const { buttonProps } = useActionGroupItem({ key: "left" }, state);
```

## Notes

- Keyboard roving/focus behavior follows upstream toolbar/radiogroup semantics.
- `Spectrum S2` is ignored for this port.
