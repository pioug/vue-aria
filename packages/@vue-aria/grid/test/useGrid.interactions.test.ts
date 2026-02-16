import { describe, expect, it } from "vitest";
import { effectScope, nextTick } from "vue";
import { GridCollection, useGridState } from "@vue-stately/grid";
import { useGrid } from "../src/useGrid";
import { useGridCell } from "../src/useGridCell";
import { useGridRow } from "../src/useGridRow";

type GridFocusMode = "row" | "cell";
type CellFocusMode = "row" | "cell" | "child";

interface GridHarness {
  row: HTMLElement;
  cell: HTMLElement;
  switches: HTMLElement[];
  focusRow: () => Promise<void>;
  focusCell: () => Promise<void>;
  press: (key: "ArrowLeft" | "ArrowRight") => Promise<void>;
  cleanup: () => void;
}

async function flushFocusUpdates() {
  await nextTick();
  await nextTick();
}

function createGridHarness(gridFocusMode: GridFocusMode, cellFocusMode: CellFocusMode): GridHarness {
  const collection = new GridCollection<Record<string, unknown>>({
    columnCount: 1,
    items: [
      {
        key: "row-1",
        type: "item",
        index: 0,
        childNodes: [
          {
            key: "cell-1",
            type: "cell",
            index: 0,
            parentKey: "row-1",
            hasChildNodes: false,
            childNodes: [],
            textValue: "row 1",
          } as any,
        ],
      },
    ],
  });

  const state = useGridState({
    selectionMode: "multiple",
    collection,
    focusMode: gridFocusMode,
  });

  const grid = document.createElement("div");
  const row = document.createElement("div");
  const cell = document.createElement("div");
  const firstSwitch = document.createElement("button");
  firstSwitch.setAttribute("aria-label", "Switch 1");
  firstSwitch.textContent = "Switch 1";
  const secondSwitch = document.createElement("button");
  secondSwitch.setAttribute("aria-label", "Switch 2");
  secondSwitch.textContent = "Switch 2";
  cell.append(firstSwitch, secondSwitch);
  row.appendChild(cell);
  grid.appendChild(row);
  document.body.appendChild(grid);

  const scope = effectScope();
  const { gridProps, rowProps, gridCellProps } = scope.run(() => {
    const gridRef = { current: grid as HTMLElement | null };
    const rowRef = { current: row as HTMLElement | null };
    const cellRef = { current: cell as HTMLElement | null };
    const rowNode = collection.getItem("row-1")!;
    const cellNode = collection.getItem("cell-1")!;
    return {
      gridProps: useGrid(
        {
          "aria-label": "Grid",
          focusMode: gridFocusMode,
        },
        state as any,
        gridRef
      ).gridProps,
      rowProps: useGridRow({ node: rowNode as any }, state as any, rowRef).rowProps,
      gridCellProps: useGridCell(
        {
          node: cellNode as any,
          focusMode: cellFocusMode === "row" ? "cell" : cellFocusMode,
        },
        state as any,
        cellRef
      ).gridCellProps,
    };
  })!;

  if (typeof gridProps.tabIndex === "number") {
    grid.tabIndex = gridProps.tabIndex;
  }
  if (typeof rowProps.tabIndex === "number") {
    row.tabIndex = rowProps.tabIndex as number;
  }
  if (typeof gridCellProps.tabIndex === "number") {
    cell.tabIndex = gridCellProps.tabIndex as number;
  }

  if (typeof gridProps.role === "string") {
    grid.setAttribute("role", gridProps.role);
  }
  if (typeof rowProps.role === "string") {
    row.setAttribute("role", rowProps.role as string);
  }
  if (typeof gridCellProps.role === "string") {
    cell.setAttribute("role", gridCellProps.role as string);
  }

  const onGridKeydown = gridProps.onKeydown as ((event: KeyboardEvent) => void) | undefined;
  const onGridFocus = gridProps.onFocus as ((event: FocusEvent) => void) | undefined;
  const onGridBlur = gridProps.onBlur as ((event: FocusEvent) => void) | undefined;
  const onRowFocus = rowProps.onFocus as ((event: FocusEvent) => void) | undefined;
  const onCellFocus = gridCellProps.onFocus as ((event: FocusEvent) => void) | undefined;
  const onCellKeydownCapture = gridCellProps.onKeydownCapture as
    | ((event: KeyboardEvent) => void)
    | undefined;

  if (onGridKeydown) {
    grid.addEventListener("keydown", (event) => onGridKeydown(event as KeyboardEvent));
  }
  if (onGridFocus) {
    grid.addEventListener("focusin", (event) => onGridFocus(event as FocusEvent));
  }
  if (onGridBlur) {
    grid.addEventListener("focusout", (event) => onGridBlur(event as FocusEvent));
  }
  if (onRowFocus) {
    row.addEventListener("focus", (event) => onRowFocus(event as FocusEvent));
  }
  if (onCellFocus) {
    cell.addEventListener("focus", (event) => onCellFocus(event as FocusEvent));
  }
  if (onCellKeydownCapture) {
    cell.addEventListener("keydown", (event) => onCellKeydownCapture(event as KeyboardEvent), true);
  }

  return {
    row,
    cell,
    switches: [firstSwitch, secondSwitch],
    async focusRow() {
      row.focus();
      await flushFocusUpdates();
    },
    async focusCell() {
      cell.focus();
      await flushFocusUpdates();
    },
    async press(key) {
      const active = document.activeElement as HTMLElement | null;
      if (!active) {
        throw new Error("No active element for key press");
      }
      active.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
      await flushFocusUpdates();
    },
    cleanup() {
      scope.stop();
      grid.remove();
    },
  };
}

describe("useGrid interaction parity", () => {
  it("supports gridFocusMode=row and cellFocusMode=cell", async () => {
    const harness = createGridHarness("row", "cell");

    await harness.focusRow();
    expect(document.activeElement).toBe(harness.row);

    await harness.press("ArrowRight");
    expect(document.activeElement).toBe(harness.cell);

    await harness.press("ArrowRight");
    expect(document.activeElement).toBe(harness.switches[0]);

    await harness.press("ArrowRight");
    expect(document.activeElement).toBe(harness.switches[1]);

    await harness.press("ArrowRight");
    expect(document.activeElement).toBe(harness.row);

    await harness.press("ArrowLeft");
    expect(document.activeElement).toBe(harness.cell);

    harness.switches[1].focus();
    await flushFocusUpdates();
    await harness.press("ArrowLeft");
    expect(document.activeElement).toBe(harness.switches[0]);

    await harness.press("ArrowLeft");
    expect(document.activeElement).toBe(harness.cell);

    await harness.press("ArrowLeft");
    expect(document.activeElement).toBe(harness.row);

    harness.cleanup();
  });

  it("supports gridFocusMode=row and cellFocusMode=child", async () => {
    const harness = createGridHarness("row", "child");

    await harness.focusRow();
    expect(document.activeElement).toBe(harness.row);

    await harness.press("ArrowRight");
    expect(document.activeElement).toBe(harness.switches[0]);

    await harness.press("ArrowRight");
    expect(document.activeElement).toBe(harness.switches[1]);

    await harness.press("ArrowRight");
    expect(document.activeElement).toBe(harness.row);

    await harness.press("ArrowLeft");
    expect(document.activeElement).toBe(harness.switches[1]);

    await harness.press("ArrowLeft");
    expect(document.activeElement).toBe(harness.switches[0]);

    await harness.press("ArrowLeft");
    expect(document.activeElement).toBe(harness.row);

    await harness.press("ArrowLeft");
    expect(document.activeElement).toBe(harness.switches[1]);

    harness.cleanup();
  });

  it("supports gridFocusMode=cell and cellFocusMode=child", async () => {
    const harness = createGridHarness("cell", "child");

    await harness.focusCell();
    expect(document.activeElement).toBe(harness.switches[0]);

    await harness.press("ArrowRight");
    expect(document.activeElement).toBe(harness.switches[1]);

    await harness.press("ArrowRight");
    expect(document.activeElement).toBe(harness.switches[0]);

    await harness.press("ArrowLeft");
    expect(document.activeElement).toBe(harness.switches[1]);

    await harness.press("ArrowLeft");
    expect(document.activeElement).toBe(harness.switches[0]);

    await harness.press("ArrowLeft");
    expect(document.activeElement).toBe(harness.switches[1]);

    harness.cleanup();
  });

  it("supports gridFocusMode=cell and cellFocusMode=cell", async () => {
    const harness = createGridHarness("cell", "cell");

    await harness.focusCell();
    expect(document.activeElement).toBe(harness.cell);

    await harness.press("ArrowRight");
    expect(document.activeElement).toBe(harness.switches[0]);

    await harness.press("ArrowRight");
    expect(document.activeElement).toBe(harness.switches[1]);

    await harness.press("ArrowRight");
    expect(document.activeElement).toBe(harness.cell);

    await harness.press("ArrowLeft");
    expect(document.activeElement).toBe(harness.switches[1]);

    await harness.press("ArrowLeft");
    expect(document.activeElement).toBe(harness.switches[0]);

    await harness.press("ArrowLeft");
    expect(document.activeElement).toBe(harness.cell);

    harness.cleanup();
  });
});
