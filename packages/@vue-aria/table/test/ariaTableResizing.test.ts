import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import type { ColumnSize, Key, TableColumnResizeState } from "@vue-aria/table-state";
import { useTableColumnResizeState } from "@vue-aria/table-state";
import { useTableColumnResize } from "../src/useTableColumnResize";
import { gridIds } from "../src/utils";
import { createTableState } from "./helpers";

interface ResizeHarness {
  cleanup: () => void;
  resizeState: TableColumnResizeState<object>;
  resizerProps: Record<string, unknown>;
}

function createHarness(
  callbacks: {
    onResizeStart?: (widths: Map<Key, ColumnSize>) => void;
    onResize?: (widths: Map<Key, ColumnSize>) => void;
    onResizeEnd?: (widths: Map<Key, ColumnSize>) => void;
  } = {}
): ResizeHarness {
  const scope = effectScope();
  const state = createTableState();
  const resizeState = useTableColumnResizeState({ tableWidth: 400 }, state);
  const input = document.createElement("input");
  document.body.appendChild(input);
  gridIds.set(state, "table-id");

  let resizerProps: Record<string, unknown> = {};
  scope.run(() => {
    ({ resizerProps } = useTableColumnResize(
      {
        column: state.collection.columns[0],
        "aria-label": "Resize name",
        ...callbacks,
      },
      resizeState,
      { current: input }
    ));
  });

  return {
    resizeState,
    resizerProps,
    cleanup: () => {
      scope.stop();
      input.remove();
    },
  };
}

function keydown(handler: unknown, key: string) {
  const onKeydown = handler as ((event: KeyboardEvent) => void) | undefined;
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
  onKeydown?.(event);
}

describe("Aria Table resizing", () => {
  it("calls onResizeStart with a width map when resizing starts", () => {
    const onResizeStart = vi.fn();
    const harness = createHarness({ onResizeStart });

    keydown(harness.resizerProps.onKeydown, "Enter");

    expect(onResizeStart).toHaveBeenCalledTimes(1);
    const widthMap = onResizeStart.mock.calls[0]?.[0] as Map<Key, ColumnSize>;
    expect(widthMap).toBeInstanceOf(Map);
    expect(typeof widthMap.get("name")).toBe("number");

    harness.cleanup();
  });

  it("calls onResizeEnd with a width map even when no movement occurs", () => {
    const onResizeEnd = vi.fn();
    const harness = createHarness({ onResizeEnd });

    keydown(harness.resizerProps.onKeydown, "Enter");
    keydown(harness.resizerProps.onKeydown, "Escape");

    expect(onResizeEnd).toHaveBeenCalledTimes(1);
    const widthMap = onResizeEnd.mock.calls[0]?.[0] as Map<Key, ColumnSize>;
    expect(widthMap).toBeInstanceOf(Map);
    expect(typeof widthMap.get("name")).toBe("number");

    harness.cleanup();
  });
});
