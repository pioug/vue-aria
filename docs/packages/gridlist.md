# @vue-aria/gridlist

`@vue-aria/gridlist` ports upstream `@react-aria/gridlist` accessibility hooks for single-column grid-style list semantics.

## Implemented modules

- `useGridList`
- `useGridListItem`
- `useGridListSection`
- `useGridListSelectionCheckbox`

## Feature coverage

- Item selection via `selectionMode` and `selectionBehavior`
- Interactive children in rows (buttons, checkboxes, menus, etc.)
- Row actions and row selection coexistence
- Arrow-key child navigation (`keyboardNavigationBehavior="arrow"`)
- Optional tab-key child navigation (`keyboardNavigationBehavior="tab"`)
- Accessible row-level checkbox labeling via `useGridListSelectionCheckbox`

## Upstream-aligned root/item example

```ts
import { useGridList, useGridListItem, useGridListSelectionCheckbox } from "@vue-aria/gridlist";
import { useListState } from "@vue-stately/list";

const listRef = { current: null as HTMLElement | null };
const rowRef = { current: null as HTMLElement | null };

const state = useListState({
  selectionMode: "multiple",
  items: [
    { id: "a", label: "Item A", description: "First row" },
    { id: "b", label: "Item B", description: "Second row" },
  ],
  getKey: (item) => item.id,
  getTextValue: (item) => item.label,
});

const { gridProps } = useGridList(
  {
    "aria-label": "Example grid list",
    keyboardNavigationBehavior: "arrow",
  },
  state,
  listRef
);
const node = state.collection.getItem("a")!;
const { rowProps, gridCellProps, descriptionProps } = useGridListItem({ node }, state, rowRef);
const { checkboxProps } = useGridListSelectionCheckbox({ key: "a" }, state);
```

## Section example

```html
<div v-bind="rowProps" class="gridlist-section-row">
  <div v-bind="rowHeaderProps" class="gridlist-section-header">Favorites</div>
</div>
<div v-bind="rowGroupProps" class="gridlist-section-group">
  <!-- section rows -->
</div>
```

```ts
import { useGridListSection } from "@vue-aria/gridlist";

const { rowProps, rowHeaderProps, rowGroupProps } = useGridListSection(
  { "aria-label": "Favorites" },
  state,
  { current: null }
);
```

## State management

`useGridList` consumes a collection + selection manager, typically from `useListState`. For tree-backed collections, `useTreeState` is supported and row metadata is derived automatically.

`useGridList` and `useGridListItem` manage container/row semantics, keyboard navigation, and selection behavior. `useGridListSelectionCheckbox` connects row checkboxes to the selection manager and row labels.

## Base markup example

```html
<div v-bind="gridProps" ref="listRef" class="gridlist">
  <div v-bind="rowProps" ref="rowRef" class="gridlist-row">
    <div v-bind="gridCellProps" class="gridlist-cell">
      <input type="checkbox" v-bind="checkboxProps" />
      <div class="gridlist-copy">
        <span class="gridlist-label">Item A</span>
        <span v-bind="descriptionProps" class="gridlist-description">First row</span>
      </div>
      <button type="button" class="gridlist-action">Info</button>
    </div>
  </div>
</div>
```

```css
.gridlist {
  border: 1px solid #ccd3da;
  border-radius: 8px;
  padding: 6px;
}

.gridlist-row + .gridlist-row {
  margin-top: 4px;
}

.gridlist-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
}

.gridlist-copy {
  display: grid;
  gap: 2px;
}

.gridlist-label {
  font-weight: 600;
}

.gridlist-description {
  color: #66717d;
  font-size: 12px;
}

.gridlist-action {
  margin-left: auto;
}

.gridlist-row:focus-visible {
  outline: 2px solid #0f62fe;
  outline-offset: 2px;
}
```

## Checkbox and Button helpers

Use reusable primitives for row checkboxes and action buttons.

```ts
import { useCheckbox } from "@vue-aria/checkbox";
import { useToggleState } from "@vue-stately/toggle";
import { useButton } from "@vue-aria/button";

const checkboxRef = { current: null as HTMLInputElement | null };
const buttonRef = { current: null as HTMLButtonElement | null };

const checkboxState = useToggleState({ defaultSelected: false });
const { inputProps } = useCheckbox({}, checkboxState, checkboxRef);
const { buttonProps } = useButton({}, buttonRef);
```

## Usage

### Dynamic collections

Pass `items` with `getKey`/`getTextValue` (and optional `children` for nested data) to build the collection reactively.

```ts
const state = useListState({
  items,
  getKey: (item) => item.id,
  getTextValue: (item) => item.label,
});
```

### Selection modes

`selectionMode` supports `"none"`, `"single"`, and `"multiple"`.

```ts
const single = useListState({ selectionMode: "single", items, getKey, getTextValue });
const multiple = useListState({ selectionMode: "multiple", items, getKey, getTextValue });
```

### Disallow empty selection

```ts
const state = useListState({
  selectionMode: "single",
  disallowEmptySelection: true,
  items,
  getKey,
  getTextValue,
});
```

### Controlled selection

```ts
const state = useListState({
  selectionMode: "multiple",
  selectedKeys: new Set(["a", "c"]),
  onSelectionChange: (keys) => {
    // persist keys in app state
  },
  items,
  getKey,
  getTextValue,
});
```

### Disabled rows

```ts
const state = useListState({
  selectionMode: "multiple",
  disabledKeys: new Set(["archived-row"]),
  items,
  getKey,
  getTextValue,
});
```

### Selection behavior

`selectionBehavior` controls whether interactions replace selection (`"replace"`) or toggle items (`"toggle"`).

```ts
const state = useListState({
  selectionMode: "multiple",
  selectionBehavior: "toggle",
  items,
  getKey,
  getTextValue,
});
```

### Row actions

Use `onAction` for row-level behavior (navigation/details/etc.) while preserving keyboard selection semantics.

```ts
const { gridProps } = useGridList(
  {
    "aria-label": "Grid list",
    onAction: (key) => {
      // open row details
    },
  },
  state,
  listRef
);
```

### Links and routing

Rows can expose link-like behavior through item props and shared routing helpers.

```ts
const items = [
  { id: "doc-1", label: "API reference", href: "/docs/api" },
  { id: "doc-2", label: "Guides", href: "/docs/guides" },
];
```

### Asynchronous loading

Use `useListData`/`useAsyncList` style data sources with `useListState` to support incremental loading and virtualization.

```ts
const state = useListState({
  selectionMode: "multiple",
  items: asyncItems,
  getKey,
  getTextValue,
});
```

## Internationalization

Row selection announcements and interactive row keyboard behavior are localized through `@vue-aria/i18n` and copied upstream `intl` bundles.

### RTL

For `keyboardNavigationBehavior="arrow"`, left/right child traversal automatically mirrors in RTL locales.

## Notes

- Pair `useGridList` with either `useListState` or `useTreeState` depending on list vs tree data.
- `useGridListItem` includes row-level tree metadata (`aria-expanded`, level/setsize/posinset) when used with `useTreeState`.
- `Spectrum S2` is out of scope unless explicitly requested.
