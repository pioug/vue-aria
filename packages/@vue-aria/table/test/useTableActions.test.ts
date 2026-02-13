import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useTable } from "../src/useTable";
import { useTableRow } from "../src/useTableRow";
import { createTableState } from "./helpers";

function createPointerLikeEvent(
  type: string,
  target: Element,
  options: { pointerId?: number; pointerType?: string; button?: number } = {}
): PointerEvent {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: options.button ?? 0,
    detail: type === "pointerdown" ? 1 : 0,
  });

  Object.defineProperty(event, "pointerId", { value: options.pointerId ?? 1 });
  Object.defineProperty(event, "pointerType", { value: options.pointerType ?? "mouse" });
  Object.defineProperty(event, "target", { value: target });
  Object.defineProperty(event, "currentTarget", { value: target });

  return event as PointerEvent;
}

function triggerMousePress(rowProps: Record<string, unknown>, target: HTMLElement) {
  const onPointerdown = rowProps.onPointerdown as ((event: PointerEvent) => void) | undefined;
  const onMousedown = rowProps.onMousedown as ((event: MouseEvent) => void) | undefined;

  if (onPointerdown) {
    onPointerdown(createPointerLikeEvent("pointerdown", target, { pointerId: 9 }));
    document.dispatchEvent(createPointerLikeEvent("pointerup", target, { pointerId: 9 }));
    return;
  }

  const mouseDown = new MouseEvent("mousedown", {
    bubbles: true,
    cancelable: true,
    button: 0,
    detail: 1,
  });
  Object.defineProperty(mouseDown, "target", { value: target });
  Object.defineProperty(mouseDown, "currentTarget", { value: target });
  onMousedown?.(mouseDown);

  const mouseUp = new MouseEvent("mouseup", { bubbles: true, cancelable: true, button: 0 });
  Object.defineProperty(mouseUp, "target", { value: target });
  Object.defineProperty(mouseUp, "currentTarget", { value: target });
  document.dispatchEvent(mouseUp);
}

function triggerDoubleClick(rowProps: Record<string, unknown>, target: HTMLElement) {
  const onDoubleClick = rowProps.onDoubleClick as ((event: MouseEvent) => void) | undefined;
  expect(typeof onDoubleClick).toBe("function");
  const event = new MouseEvent("dblclick", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "target", { value: target });
  Object.defineProperty(event, "currentTarget", { value: target });
  onDoubleClick?.(event);
}

describe("useTable actions", () => {
  it("invokes onRowAction on double click in replace selection mode", () => {
    const onRowAction = vi.fn();
    const scope = effectScope();
    let rowProps: Record<string, unknown> = {};
    const rowElement = document.createElement("tr");
    const tableElement = document.createElement("table");
    const state = createTableState({ selectionBehavior: "replace", selectionMode: "multiple" });

    scope.run(() => {
      useTable({ "aria-label": "Action table", onRowAction }, state, { current: tableElement });
      const rowNode = state.collection.getItem("row-1")!;
      ({ rowProps } = useTableRow({ node: rowNode }, state, { current: rowElement }));
    });

    triggerMousePress(rowProps, rowElement);
    triggerDoubleClick(rowProps, rowElement);

    expect(onRowAction).toHaveBeenCalledTimes(1);
    expect(onRowAction).toHaveBeenCalledWith("row-1");

    scope.stop();
  });

  it("supports legacy row onAction callback on double click", () => {
    const onAction = vi.fn();
    const scope = effectScope();
    let rowProps: Record<string, unknown> = {};
    const rowElement = document.createElement("tr");
    const tableElement = document.createElement("table");
    const state = createTableState({ selectionBehavior: "replace", selectionMode: "multiple" });

    scope.run(() => {
      useTable({ "aria-label": "Legacy action table" }, state, { current: tableElement });
      const rowNode = state.collection.getItem("row-1")!;
      ({ rowProps } = useTableRow(
        {
          node: rowNode,
          onAction,
        },
        state,
        { current: rowElement }
      ));
    });

    triggerMousePress(rowProps, rowElement);
    triggerDoubleClick(rowProps, rowElement);

    expect(onAction).toHaveBeenCalledTimes(1);

    scope.stop();
  });
});
