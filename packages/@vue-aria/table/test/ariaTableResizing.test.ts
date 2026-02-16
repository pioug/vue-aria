import { effectScope } from "vue";
import { describe } from "vitest";
import { useTableColumnResizeState } from "@vue-stately/table";
import { useTableColumnResize } from "../src/useTableColumnResize";
import { gridIds } from "../src/utils";
import { createTableState } from "./helpers";
import {
  resizingTests,
  type ResizeCallbacks,
  type ResizeHarness,
} from "./tableResizingTests";

function createHarness(callbacks: ResizeCallbacks = {}): ResizeHarness {
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

describe("Aria Table resizing", () => {
  resizingTests(createHarness);
});
