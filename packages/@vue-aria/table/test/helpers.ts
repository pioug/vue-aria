import type { GridNode } from "@vue-aria/grid-state";
import { TableCollection, useTableState, type TableState } from "@vue-aria/table-state";

export function createColumn(
  key: string,
  index: number,
  props: Record<string, unknown> = {}
): GridNode<object> {
  return {
    type: "column",
    key,
    value: null,
    level: 0,
    hasChildNodes: false,
    childNodes: [],
    rendered: key,
    textValue: key,
    index,
    parentKey: null,
    prevKey: null,
    nextKey: null,
    firstChildKey: null,
    lastChildKey: null,
    props,
  };
}

export function createCell(
  key: string,
  index: number,
  textValue: string
): GridNode<object> {
  return {
    type: "cell",
    key,
    value: null,
    level: 1,
    hasChildNodes: false,
    childNodes: [],
    rendered: textValue,
    textValue,
    index,
    parentKey: null,
    prevKey: null,
    nextKey: null,
    firstChildKey: null,
    lastChildKey: null,
    props: {},
  };
}

export function createRow(
  key: string,
  index: number,
  cells: GridNode<object>[],
  textValue = ""
): GridNode<object> {
  return {
    type: "item",
    key,
    value: null,
    level: 1,
    hasChildNodes: true,
    childNodes: cells,
    rendered: null,
    textValue,
    index,
    parentKey: "body",
    prevKey: null,
    nextKey: null,
    firstChildKey: cells[0]?.key ?? null,
    lastChildKey: cells[cells.length - 1]?.key ?? null,
    props: {},
  };
}

export function createBody(rows: GridNode<object>[]): GridNode<object> {
  return {
    type: "body",
    key: "body",
    value: null,
    level: 0,
    hasChildNodes: true,
    childNodes: rows,
    rendered: null,
    textValue: "",
    index: 0,
    parentKey: null,
    prevKey: null,
    nextKey: null,
    firstChildKey: rows[0]?.key ?? null,
    lastChildKey: rows[rows.length - 1]?.key ?? null,
    props: {},
  };
}

export function createTableCollection(): TableCollection<object> {
  const columns = [
    createColumn("name", 0, { isRowHeader: true, allowsSorting: true }),
    createColumn("type", 1, { allowsSorting: true }),
  ];

  const rows = [
    createRow("row-1", 0, [
      createCell("row-1-name", 0, "Pikachu"),
      createCell("row-1-type", 1, "Electric"),
    ]),
    createRow("row-2", 1, [
      createCell("row-2-name", 0, "Squirtle"),
      createCell("row-2-type", 1, "Water"),
    ]),
  ];

  return new TableCollection([...columns, createBody(rows)]);
}

export function createTableState(
  overrides: Record<string, unknown> = {}
): TableState<object> {
  return useTableState({
    collection: createTableCollection(),
    selectionMode: "multiple",
    ...overrides,
  }) as TableState<object>;
}
