# @vue-spectrum/table

Vue port baseline of `@react-spectrum/table`.

<script setup lang="ts">
import { ref } from "vue";
import {
  Cell,
  Column,
  Row,
  TableBody,
  TableHeader,
  TableView,
} from "@vue-spectrum/vue-spectrum";

const selected = ref("none");
</script>

## Preview

<div class="spectrum-preview">
  <div class="spectrum-preview-panel" style="display: grid; gap: 12px; max-width: 540px;">
    <TableView
      aria-label="Files"
      selectionMode="single"
      :onSelectionChange="(keys) => (selected = Array.from(keys).join(', ') || 'none')">
      <TableHeader>
        <Column id="name" isRowHeader>Name</Column>
        <Column id="type">Type</Column>
        <Column id="modified">Modified</Column>
      </TableHeader>
      <TableBody>
        <Row id="games">
          <Cell>Games</Cell>
          <Cell>File folder</Cell>
          <Cell>6/7/2020</Cell>
        </Row>
        <Row id="bootmgr">
          <Cell>bootmgr</Cell>
          <Cell>System file</Cell>
          <Cell>11/20/2010</Cell>
        </Row>
      </TableBody>
    </TableView>
    <p style="margin: 0; font-size: 13px; color: #334155;">
      selection -> {{ selected }}
    </p>
  </div>
</div>

## Exports

- `TableView`
- `Column`
- `TableHeader`
- `TableBody`
- `Section`
- `Row`
- `Cell`
- `EditableCell`

## Example

```ts
import { h } from "vue";
import { TableView } from "@vue-spectrum/table";

const component = h(TableView, {
  "aria-label": "Table",
  columns: [
    { key: "name", title: "Name", isRowHeader: true },
    { key: "type", title: "Type" },
    { key: "modified", title: "Modified", allowsSorting: true },
  ],
  items: [
    { key: "games", name: "Games", type: "File folder", modified: "6/7/2020" },
    { key: "bootmgr", name: "bootmgr", type: "System file", modified: "11/20/2010" },
  ],
  selectionMode: "single",
  onSelectionChange: (keys) => {
    console.log(Array.from(keys));
  },
});
```

## Notes

- Baseline includes static table semantics (`grid`, `rowgroup`, `row`, `columnheader`, `rowheader`, `gridcell`), single/multiple selection, keyboard row navigation, and sortable header state wiring.
- Supports both prop-driven tables (`columns` + `items`) and static slot composition (`TableHeader`/`Column` + `TableBody`/`Row`/`Cell`/`EditableCell`).
- Includes dedicated upstream-style `Table.test` and `Table.ssr.test` parity suites plus shared `test/TableTests` fixture parity scaffolding.
- Includes expanded ARIA matrix assertions for static tables (`aria-rowcount`, row/column index attributes, and unsorted-header `aria-sort` omission).
- Advanced upstream parity such as resizing, virtualization, nested row expansion, and drag-and-drop integration remains in progress.
