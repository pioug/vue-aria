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

## Key Props

- `selectionMode`: `"none" | "single" | "multiple"`.
- `selectionStyle`: `"highlight" | "checkbox"`.
- `sortDescriptor` / `defaultSortDescriptor` with `onSortChange`.
- `selectedKeys` / `defaultSelectedKeys` with `onSelectionChange`.
- `columns` + `items` for data-driven rendering.

## Selection Callbacks

`onSelectionChange` receives a `Set` of selected row keys in the current table collection.

## Sort Initialization

Use `defaultSortDescriptor` to apply initial row ordering and header sort state before user interaction.

## Related

- `Spectrum S2` remains out of scope unless explicitly requested.
