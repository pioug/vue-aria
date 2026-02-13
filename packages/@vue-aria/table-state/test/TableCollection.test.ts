import { describe, expect, it } from "vitest";
import type { GridNode } from "@vue-aria/grid-state";
import { TableCollection } from "../src/TableCollection";

function createColumn(
  key: string,
  index: number,
  options: {
    props?: Record<string, unknown>;
    parentKey?: string | null;
    childNodes?: GridNode<object>[];
  } = {}
): GridNode<object> {
  const childNodes = options.childNodes ?? [];
  return {
    type: "column",
    key,
    value: null,
    level: 0,
    hasChildNodes: childNodes.length > 0,
    childNodes,
    rendered: key,
    textValue: key,
    index,
    parentKey: options.parentKey ?? null,
    prevKey: null,
    nextKey: null,
    firstChildKey: childNodes[0]?.key ?? null,
    lastChildKey: childNodes[childNodes.length - 1]?.key ?? null,
    props: options.props ?? {},
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

function createGroupedCollectionRows() {
  const nameColumn = createColumn("name", 0, { props: { isRowHeader: true }, parentKey: "meta" });
  const typeColumn = createColumn("type", 1, { parentKey: "meta" });
  const metaColumn = createColumn("meta", 0, { childNodes: [nameColumn, typeColumn] });
  const levelColumn = createColumn("level", 2);

  const row1 = createRow("row-1", 0, [
    createCell("row-1-name", 0, "Pikachu"),
    createCell("row-1-type", 1, "Electric"),
    createCell("row-1-level", 2, "100"),
  ]);
  const row2 = createRow("row-2", 1, [
    createCell("row-2-name", 0, "Squirtle"),
    createCell("row-2-type", 1, "Water"),
    createCell("row-2-level", 2, "12"),
  ]);

  return {
    nodes: [metaColumn, levelColumn, createBody([row1, row2])] as GridNode<object>[],
  };
}

describe("TableCollection", () => {
  it("builds header rows and row text values from row header columns", () => {
    const { nodes } = createGroupedCollectionRows();
    const collection = new TableCollection(nodes);

    expect(collection.columns.map((column) => column.key)).toStrictEqual([
      "name",
      "type",
      "level",
    ]);
    expect(collection.headerRows).toHaveLength(2);
    expect(collection.rowHeaderColumnKeys.has("name")).toBe(true);
    expect(collection.getTextValue("row-1")).toBe("Pikachu");
    expect(collection.getFirstKey()).toBe("row-1");
    expect(collection.getLastKey()).toBe("row-2");
    expect(collection.size).toBe(2);
  });

  it("injects drag/selection columns and defaults row header to first data column", () => {
    const nameColumn = createColumn("name", 0);
    const typeColumn = createColumn("type", 1);
    const collection = new TableCollection(
      [nameColumn, typeColumn, createBody([])],
      null,
      { showSelectionCheckboxes: true, showDragButtons: true }
    );

    expect((collection.columns[0].props as any)?.isDragButtonCell).toBe(true);
    expect((collection.columns[1].props as any)?.isSelectionCell).toBe(true);
    expect(collection.rowHeaderColumnKeys.has("name")).toBe(true);
  });

  it("returns a filtered table collection with matching rows", () => {
    const { nodes } = createGroupedCollectionRows();
    const collection = new TableCollection(nodes);
    const filtered = collection.filter((textValue) => textValue.startsWith("Pika"));

    expect(filtered).not.toBe(collection);
    expect(filtered.size).toBe(1);
    expect([...filtered].map((row) => row.key)).toStrictEqual(["row-1"]);
    expect(filtered.getItem("row-2")).toBeNull();
    expect(filtered.headerRows).toHaveLength(collection.headerRows.length);
  });
});
