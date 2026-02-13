import { describe, expect, it } from "vitest";
import { effectScope, nextTick, reactive } from "vue";
import type { GridNode } from "@vue-aria/grid-state";
import {
  TableCollection,
  useTableColumnResizeState,
  useTableState,
} from "../src";

function createColumn(
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

function createCell(
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

function createRow(
  key: string,
  cells: GridNode<object>[]
): GridNode<object> {
  return {
    type: "item",
    key,
    value: null,
    level: 1,
    hasChildNodes: true,
    childNodes: cells,
    rendered: null,
    textValue: "",
    index: 0,
    parentKey: "body",
    prevKey: null,
    nextKey: null,
    firstChildKey: cells[0]?.key ?? null,
    lastChildKey: cells[cells.length - 1]?.key ?? null,
    props: {},
  };
}

function createBody(rows: GridNode<object>[]): GridNode<object> {
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

function createCollection(
  columns: Array<{
    key: string;
    width?: string | number;
    defaultWidth?: string | number;
  }>
): TableCollection<object> {
  const columnNodes = columns.map((column, index) =>
    createColumn(column.key, index, {
      width: column.width,
      defaultWidth: column.defaultWidth,
      isRowHeader: index === 0,
    })
  );
  const cells = columns.map((column, index) =>
    createCell(`row-1-${column.key}`, index, `${column.key}-value`)
  );
  return new TableCollection([
    ...columnNodes,
    createBody([createRow("row-1", cells)]),
  ]);
}

describe("useTableColumnResizeState", () => {
  it("builds column width/min/max maps from table width", () => {
    const tableState = useTableState({
      collection: createCollection([
        { key: "name", defaultWidth: "1fr" },
        { key: "type", defaultWidth: "1fr" },
        { key: "level", defaultWidth: "2fr" },
      ]),
      selectionMode: "single",
    });

    const resizeState = useTableColumnResizeState(
      { tableWidth: 400 },
      tableState
    );

    expect(resizeState.columnWidths).toStrictEqual(
      new Map<string, number>([
        ["name", 100],
        ["type", 100],
        ["level", 200],
      ])
    );
    expect(resizeState.getColumnWidth("level")).toBe(200);
    expect(resizeState.getColumnMinWidth("name")).toBe(75);
    expect(resizeState.getColumnMaxWidth("name")).toBe(Number.MAX_SAFE_INTEGER);
  });

  it("tracks resize lifecycle and updates resized columns", () => {
    const tableState = useTableState({
      collection: createCollection([
        { key: "name", defaultWidth: "1fr" },
        { key: "type", defaultWidth: "1fr" },
        { key: "level", defaultWidth: "2fr" },
      ]),
      selectionMode: "single",
    });
    const resizeState = useTableColumnResizeState(
      { tableWidth: 400 },
      tableState
    );

    resizeState.startResize("name");
    expect(resizeState.resizingColumn).toBe("name");

    const newSizes = resizeState.updateResizedColumns("name", 150);
    expect(newSizes).toStrictEqual(
      new Map<string, string | number>([
        ["name", 150],
        ["type", "1fr"],
        ["level", "2fr"],
      ])
    );
    expect(resizeState.columnWidths.get("name")).toBe(150);
    expect(resizeState.columnWidths.get("type")).toBe(83);
    expect(resizeState.columnWidths.get("level")).toBe(167);

    resizeState.endResize();
    expect(resizeState.resizingColumn).toBeNull();
  });

  it("does not mutate computed widths for controlled columns", () => {
    const tableState = useTableState({
      collection: createCollection([
        { key: "name", width: "1fr" },
        { key: "type", width: "1fr" },
        { key: "level", width: "2fr" },
      ]),
      selectionMode: "single",
    });
    const resizeState = useTableColumnResizeState(
      { tableWidth: 400 },
      tableState
    );

    expect(resizeState.columnWidths).toStrictEqual(
      new Map<string, number>([
        ["name", 100],
        ["type", 100],
        ["level", 200],
      ])
    );

    const newSizes = resizeState.updateResizedColumns("name", 180);
    expect(newSizes.get("name")).toBe(180);
    expect(resizeState.columnWidths).toStrictEqual(
      new Map<string, number>([
        ["name", 100],
        ["type", 100],
        ["level", 200],
      ])
    );
  });

  it("resets uncontrolled widths when the column key order changes", async () => {
    const props = reactive({
      collection: createCollection([
        { key: "name", defaultWidth: "1fr" },
        { key: "type", defaultWidth: "1fr" },
      ]),
      selectionMode: "single" as const,
    });
    const scope = effectScope();
    const tableState = scope.run(() => useTableState(props as any))!;
    const resizeState = scope.run(() =>
      useTableColumnResizeState(
        reactive({
          tableWidth: 300,
        }),
        tableState
      )
    )!;

    resizeState.updateResizedColumns("name", 220);
    expect(resizeState.columnWidths.get("name")).toBe(220);

    props.collection = createCollection([
      { key: "name", defaultWidth: "1fr" },
      { key: "type", defaultWidth: "1fr" },
      { key: "level", defaultWidth: "1fr" },
    ]);
    await nextTick();

    expect(resizeState.columnWidths).toStrictEqual(
      new Map<string, number>([
        ["name", 100],
        ["type", 100],
        ["level", 100],
      ])
    );

    scope.stop();
  });
});
