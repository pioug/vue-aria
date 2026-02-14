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

## Key Props

- `selectionMode`: `"none" | "single" | "multiple"`.
- `selectionStyle`: `"highlight" | "checkbox"`.
- `disallowSelectAll`: disables keyboard select-all (`Ctrl+A`) when `selectionMode` is `"multiple"`.
- `escapeKeyBehavior`: `"clearSelection" | "none"` to control Escape-key clearing behavior in selectable tables.
- `sortDescriptor` / `defaultSortDescriptor` with `onSortChange`.
- `selectedKeys` / `defaultSelectedKeys` with `onSelectionChange`.
- `columns` + `items` for data-driven rendering.
  `items[].cells` supports `colSpan` for spanned body cells.
  Set `isRowHeader` on one or more columns to expose row-header semantics.

## Selection Callbacks

`onSelectionChange` receives a `Set` of selected row keys in the current table collection.
Selection keys preserve row key types (for example, numeric keys such as `0` remain numbers).
Rows can provide either `key` or `id`; `id` is used as the row key when `key` is omitted.
Empty string IDs are preserved as valid row keys.
Select-all interactions (for example `Ctrl+A` in checkbox-style multiple selection) exclude disabled rows from callback key sets.

## Selection Initialization and Disabled Keys

Use `defaultSelectedKeys` to seed initial row selection. Use `disabledKeys` to prevent specific rows from being selected via interaction.

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
