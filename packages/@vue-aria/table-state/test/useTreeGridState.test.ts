import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, reactive } from "vue";
import { disableTableNestedRows, enableTableNestedRows } from "@vue-aria/flags";
import type { GridNode } from "@vue-aria/grid-state";
import { UNSTABLE_useTreeGridState } from "../src";

function createColumn(
  key: string,
  index: number
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
    props: {},
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
  childRows: GridNode<object>[] = []
): GridNode<object> {
  const childNodes = [...cells, ...childRows];
  return {
    type: "item",
    key,
    value: null,
    level: 1,
    hasChildNodes: true,
    childNodes,
    rendered: null,
    textValue: "",
    index,
    parentKey: "body",
    prevKey: null,
    nextKey: null,
    firstChildKey: childNodes[0]?.key ?? null,
    lastChildKey: childNodes[childNodes.length - 1]?.key ?? null,
    props: {
      children: childNodes,
    },
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

function createTreeGridNodes() {
  const columns = [createColumn("name", 0), createColumn("type", 1)];

  const childRow = createRow("row-1-1", 0, [
    createCell("row-1-1-name", 0, "Raichu"),
    createCell("row-1-1-type", 1, "Electric"),
  ]);
  childRow.parentKey = "row-1";

  const row1 = createRow(
    "row-1",
    0,
    [
      createCell("row-1-name", 0, "Pikachu"),
      createCell("row-1-type", 1, "Electric"),
    ],
    [childRow]
  );
  const row2 = createRow("row-2", 1, [
    createCell("row-2-name", 0, "Squirtle"),
    createCell("row-2-type", 1, "Water"),
  ]);

  return [...columns, createBody([row1, row2])] as Iterable<GridNode<object>>;
}

afterEach(() => {
  disableTableNestedRows();
});

describe("UNSTABLE_useTreeGridState", () => {
  it("throws when table nested rows flag is disabled", () => {
    disableTableNestedRows();
    expect(() =>
      UNSTABLE_useTreeGridState({
        children: createTreeGridNodes(),
        selectionMode: "single",
      })
    ).toThrowError(
      "Feature flag for table nested rows must be enabled to use useTreeGridState."
    );
  });

  it("flattens tree rows based on expanded keys and toggles expansion", () => {
    enableTableNestedRows();
    const state = UNSTABLE_useTreeGridState({
      children: createTreeGridNodes(),
      selectionMode: "single",
      UNSTABLE_defaultExpandedKeys: ["row-1"],
    });

    expect([...state.collection].map((row) => row.key)).toStrictEqual([
      "row-1",
      "row-1-1",
      "row-2",
    ]);
    expect(state.userColumnCount).toBe(2);
    expect(state.keyMap.has("row-1-1")).toBe(true);
    expect(state.expandedKeys).toStrictEqual(new Set(["row-1"]));

    state.toggleKey("row-1");
    expect(state.expandedKeys).toStrictEqual(new Set());
    expect([...state.collection].map((row) => row.key)).toStrictEqual([
      "row-1",
      "row-2",
    ]);
  });

  it("supports controlled expanded keys", async () => {
    enableTableNestedRows();
    const onExpandedChange = vi.fn();
    const props = reactive({
      children: createTreeGridNodes(),
      selectionMode: "single" as const,
      UNSTABLE_expandedKeys: new Set(["row-1"]),
      UNSTABLE_onExpandedChange: onExpandedChange,
    });

    const scope = effectScope();
    const state = scope.run(() => UNSTABLE_useTreeGridState(props as any))!;

    expect([...state.collection].map((row) => row.key)).toStrictEqual([
      "row-1",
      "row-1-1",
      "row-2",
    ]);

    state.toggleKey("row-1");
    expect(onExpandedChange).toHaveBeenCalledWith(new Set());

    props.UNSTABLE_expandedKeys = new Set();
    await nextTick();

    expect([...state.collection].map((row) => row.key)).toStrictEqual([
      "row-1",
      "row-2",
    ]);

    scope.stop();
  });
});
