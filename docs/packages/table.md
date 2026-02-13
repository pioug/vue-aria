# @vue-aria/table

`@vue-aria/table` ports upstream `@react-aria/table` accessibility hooks for table semantics, sorting, selection, keyboard navigation, and column resizing interactions.

## Implemented modules

- `useTable`
- `useTableRowGroup`
- `useTableHeaderRow`
- `useTableRow`
- `useTableCell`
- `useTableColumnHeader`
- `useTableSelectionCheckbox`
- `useTableSelectAllCheckbox`
- `useTableColumnResize`
- `TableKeyboardDelegate`
- table ID utilities:
  - `gridIds`
  - `getColumnHeaderId`
  - `getCellId`
  - `getRowLabelledBy`

## Parity status

- Current package status: in progress.
- The primary hook surface is implemented, including column resize behavior.
- Additional upstream integration-style table tests/docs examples are still being expanded.

## Upstream-aligned example (implemented slice)

```ts
import {
  useTable,
  useTableRow,
  useTableCell,
  useTableColumnHeader,
  useTableHeaderRow,
  useTableSelectionCheckbox,
  useTableSelectAllCheckbox,
  useTableColumnResize,
} from "@vue-aria/table";

const state = {} as any;
const tableRef = { current: document.createElement("table") as HTMLElement | null };
const rowRef = { current: document.createElement("tr") as HTMLElement | null };
const cellRef = { current: document.createElement("td") as HTMLElement | null };
const resizeInputRef = { current: document.createElement("input") as HTMLInputElement | null };
const columnResizeState = {} as any;

const { gridProps } = useTable({ "aria-label": "Pokemon table" }, state, tableRef);
const { rowProps } = useTableRow({ node: {} as any }, state, rowRef);
const { gridCellProps } = useTableCell({ node: {} as any }, state, cellRef);
const { columnHeaderProps } = useTableColumnHeader({ node: {} as any }, state, cellRef);
const { checkboxProps: rowCheckboxProps } = useTableSelectionCheckbox({ key: "row-1" }, state);
const { checkboxProps: selectAllProps } = useTableSelectAllCheckbox(state);
const { inputProps, resizerProps } = useTableColumnResize(
  {
    column: {} as any,
    "aria-label": "Resize Name",
  },
  columnResizeState,
  resizeInputRef
);
```

## Sorting example

```ts
import { useTable, useTableColumnHeader } from "@vue-aria/table";

const state = {} as any;
const tableRef = { current: document.createElement("table") as HTMLElement | null };
const headerCellRef = { current: document.createElement("th") as HTMLElement | null };

const { gridProps } = useTable(
  {
    "aria-label": "Sortable table",
    sortDescriptor: { column: "name", direction: "ascending" },
    onSortChange: (nextSort) => {
      // sync external sort state
      console.log(nextSort);
    },
  },
  state,
  tableRef
);

const { columnHeaderProps, isPressed } = useTableColumnHeader(
  { node: state.collection.columns[0] },
  state,
  headerCellRef
);
```

```html
<th v-bind="columnHeaderProps" ref="headerCellRef">
  Name
  <span aria-hidden="true">{{ isPressed ? "..." : "⇅" }}</span>
</th>
```

## Selection checkbox example

```ts
import { useTableSelectionCheckbox, useTableSelectAllCheckbox } from "@vue-aria/table";

const state = {} as any;
const { checkboxProps: selectAllCheckboxProps } = useTableSelectAllCheckbox(state);
const { checkboxProps: rowCheckboxProps } = useTableSelectionCheckbox({ key: "row-1" }, state);
```

```html
<th>
  <input
    type="checkbox"
    :checked="Boolean(selectAllCheckboxProps.isSelected)"
    :disabled="Boolean(selectAllCheckboxProps.isDisabled)"
    :aria-label="String(selectAllCheckboxProps['aria-label'])"
    @change="selectAllCheckboxProps.onChange?.()"
  />
</th>

<td>
  <input
    type="checkbox"
    :checked="Boolean(rowCheckboxProps.isSelected)"
    :disabled="Boolean(rowCheckboxProps.isDisabled)"
    :aria-labelledby="String(rowCheckboxProps['aria-labelledby'])"
    @change="rowCheckboxProps.onChange?.($event)"
  />
</td>
```

## Column resize example

```ts
import { useTableColumnResize } from "@vue-aria/table";
import { useTableColumnResizeState } from "@vue-aria/table-state";

const state = {} as any;
const resizeState = useTableColumnResizeState({ tableWidth: 960 }, state);
const resizeInputRef = { current: document.createElement("input") as HTMLInputElement | null };
const triggerRef = { current: document.createElement("button") as HTMLElement | null };

const { inputProps, resizerProps, isResizing } = useTableColumnResize(
  {
    column: state.collection.columns[0],
    "aria-label": "Resize Name",
    triggerRef,
    onResizeStart: (widths) => console.log("resize start", widths),
    onResize: (widths) => console.log("resize", widths),
    onResizeEnd: (widths) => console.log("resize end", widths),
  },
  resizeState,
  resizeInputRef
);
```

```html
<span v-bind="resizerProps" class="resizer-handle" :data-resizing="isResizing">
  <input v-bind="inputProps" ref="resizeInputRef" />
</span>
```

## Base markup example

```html
<table v-bind="gridProps" ref="tableRef" class="table">
  <thead>
    <tr v-bind="headerRowProps">
      <th v-bind="columnHeaderProps">
        <span>Name</span>
        <span v-bind="resizerProps" class="resizer-handle">
          <input v-bind="inputProps" ref="resizeInputRef" />
        </span>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr v-bind="rowProps" ref="rowRef">
      <td v-bind="gridCellProps" ref="cellRef">Pikachu</td>
    </tr>
  </tbody>
</table>
```

```css
.table {
  border-collapse: collapse;
  width: 100%;
}

.table th,
.table td {
  border: 1px solid #d7dce1;
  padding: 8px 10px;
}

.resizer-handle {
  display: inline-flex;
  width: 12px;
  margin-left: 6px;
  cursor: col-resize;
}

.resizer-handle[data-resizing="true"] {
  background: #e5efff;
}
```

## Notes

- This package depends on `@vue-aria/table-state` for collection and resize state.
- `UNSTABLE_useTreeGridState` support comes from `@vue-aria/table-state` and requires `tableNestedRows` to be enabled in `@vue-aria/flags`.
- `Spectrum S2` is out of scope unless explicitly requested.
