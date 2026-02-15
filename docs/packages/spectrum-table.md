# @vue-spectrum/table - TableView

`TableView` renders Spectrum-styled accessible data grids with row selection and sortable headers.

## Example

```vue
<script setup lang="ts">
import { TableView } from "@vue-spectrum/table";

const columns = [
  { key: "name", title: "Name", isRowHeader: true, allowsSorting: true },
  { key: "type", title: "Type", allowsSorting: true },
  { key: "modified", title: "Modified" },
];

const items = [
  { key: "games", name: "Games", type: "File folder", modified: "6/7/2020" },
  { key: "bootmgr", name: "bootmgr", type: "System file", modified: "11/20/2010" },
];
</script>

<template>
  <TableView
    aria-label="Files"
    :columns="columns"
    :items="items"
    selection-mode="single"
  />
</template>
```

## Static Composition

```vue
<script setup lang="ts">
import { Cell, Column, Row, TableBody, TableHeader, TableView } from "@vue-spectrum/table";
</script>

<template>
  <TableView aria-label="Static table" selection-mode="single">
    <TableHeader>
      <Column id="name" is-row-header>Name</Column>
      <Column id="type">Type</Column>
      <Column id="modified">Date Modified</Column>
    </TableHeader>
    <TableBody>
      <Row id="games">
        <Cell>Games</Cell>
        <Cell>File folder</Cell>
        <Cell>6/7/2020</Cell>
      </Row>
      <Row id="program-files">
        <Cell>Program Files</Cell>
        <Cell>File folder</Cell>
        <Cell>4/7/2021</Cell>
      </Row>
    </TableBody>
  </TableView>
</template>
```

`Cell` supports `colSpan` in static slot composition, including correct column indexing and ARIA colspan output.
In static slot composition, each row's total cell span must match the declared column count.
When using template syntax, static metadata props are supported in kebab-case (for example: `is-row-header`, `allows-sorting`, `hide-header`, `show-divider`, `text-value`, `col-span`, `is-disabled`).
Numeric string values for `col-span` are normalized (for example `col-span="2"`).

Column sizing metadata is supported in both data and slot composition:
- `width`
- `defaultWidth`
- `minWidth`
- `maxWidth`

Numeric values are treated as pixel widths. Numeric strings are normalized to pixel widths.
Percentage values are resolved against the table width.
In templates, kebab-case sizing props are supported (for example: `default-width`, `min-width`, `max-width`).

Column resizing is supported via `columns[].allowsResizing` (or `allows-resizing` in static slot syntax). Resizers are rendered for non-hidden header columns only.

## Key Props

- `selectionMode`: `"none" | "single" | "multiple"`.
- `selectionStyle`: `"highlight" | "checkbox"`.
- `density`: `"compact" | "regular" | "spacious"` to control row/cell spacing class variants.
- `overflowMode`: `"truncate" | "wrap"` to control wrapped-cell visual styling.
- `isQuiet`: enables quiet table visual styling.
- `isDisabled`: disables table interactions (row selection, row actions, and sortable-header sorting) and marks rows as disabled.
- `isKeyboardNavigationDisabled`: disables table keyboard navigation handlers (`Arrow`, `Home`, `End`, etc.) while preserving focus/blur state wiring.
- `disabledBehavior`: `"selection" | "all"` (defaults to `"selection"`) to control whether disabled rows remain actionable (`"selection"`) or become fully disabled (`"all"`).
- `disallowSelectAll`: disables keyboard select-all (`Ctrl+A`) when `selectionMode` is `"multiple"`.
- `disallowTypeAhead`: disables alphanumeric typeahead focus movement across rows.
- `disallowEmptySelection`: prevents toggling the final selected row off when selection is enabled.
- `allowDuplicateSelectionEvents`: emits `onSelectionChange` even when the next selected-key set is equal to the current controlled selection.
- `escapeKeyBehavior`: `"clearSelection" | "none"` to control Escape-key clearing behavior in selectable tables.
- `shouldSelectOnPressUp`: defers pointer-driven selection from press-start to press-up/click handling.
- `sortDescriptor` / `defaultSortDescriptor` with `onSortChange`.
- `selectedKeys` / `defaultSelectedKeys` with `onSelectionChange`.
- `onResizeStart`, `onResize`, and `onResizeEnd` receive a `Map` of column widths during resize interactions.
- `columns` + `items` for data-driven rendering.
  `items[].cells` supports `colSpan` for spanned body cells.
  `columns[].align` supports `"start" | "center" | "end"` alignment classes for matching header/body cells.
  `columns[].hideHeader` and `columns[].showDivider` map to Spectrum header/divider class variants.
  `columns[].allowsResizing` enables per-column resize affordances on visible headers.
  `columns[].width`, `columns[].defaultWidth`, `columns[].minWidth`, and `columns[].maxWidth` control per-column sizing.
  Set `isRowHeader` on one or more columns to expose row-header semantics.

## Selection Callbacks

`onSelectionChange` receives a `Set` of selected row keys in the current table collection.
Selection keys preserve row key types (for example, numeric keys such as `0` remain numbers).
Rows can provide either `key` or `id`; `id` is used as the row key when `key` is omitted.
Empty string IDs are preserved as valid row keys.
Select-all interactions (for example `Ctrl+A` in checkbox-style multiple selection) exclude disabled rows from callback key sets.

## Selection Initialization and Disabled Keys

Use `defaultSelectedKeys` to seed initial row selection. Use `disabledKeys` to prevent specific rows from being selected via interaction.
Rows marked with item-level `isDisabled` are also non-selectable and excluded from select-all key sets.

For controlled selection, pair `selectedKeys` with `onSelectionChange` and update `selectedKeys` from parent state.

`disabledKeys` updates are reactive, so changing the set at runtime immediately updates row interactivity.
In checkbox-style multiple selection, `Escape` clears selection when rows are selected and is a no-op when selection is already empty.

## Sort Initialization

Use `defaultSortDescriptor` to apply initial row ordering and header sort state before user interaction.

## Controlled Sorting

Use `sortDescriptor` with `onSortChange` for controlled sort state. Updating `sortDescriptor` from the parent updates both row ordering and the active header `aria-sort` value.
Sorting follows logical column indexes even when earlier cells use `colSpan`.

## Empty State Rendering

Pass `renderEmptyState` to render custom body content when the collection has no rows.

## Unsafe Passthrough Props

Use `UNSAFE_className` and `UNSAFE_style` to append custom classes/styles to the underlying grid element.

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
