import { effectScope } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { setInteractionModality } from "@vue-aria/interactions";
import { useTableColumnResizeState, type TableColumnResizeState } from "@vue-stately/table";
import type { ColumnSize, Key } from "@vue-stately/table";
import { useTableColumnResize } from "../src/useTableColumnResize";
import { gridIds } from "../src/utils";
import { createTableState } from "./helpers";

interface ResizeHarness {
  cleanup: () => void;
  input: HTMLInputElement;
  state: ReturnType<typeof createTableState>;
  resizeState: TableColumnResizeState<object>;
  aria: ReturnType<typeof useTableColumnResize<object>>;
}

function createResizeHarness(
  props: Partial<Parameters<typeof useTableColumnResize<object>>[0]> = {}
): ResizeHarness {
  const scope = effectScope();
  const state = createTableState();
  const resizeState = useTableColumnResizeState({ tableWidth: 400 }, state);
  const column = state.collection.columns[0];
  gridIds.set(state, "table-id");

  const input = document.createElement("input");
  document.body.appendChild(input);
  const inputRef = { current: input as HTMLInputElement | null };

  let aria!: ReturnType<typeof useTableColumnResize<object>>;
  scope.run(() => {
    aria = useTableColumnResize(
      {
        column,
        "aria-label": "Resize name column",
        ...props,
      },
      resizeState,
      inputRef
    );
  });

  return {
    input,
    state,
    resizeState,
    aria,
    cleanup() {
      scope.stop();
      input.remove();
    },
  };
}

function callKeydown(handler: unknown, key: string) {
  const onKeydown = handler as ((event: KeyboardEvent) => void) | undefined;
  expect(typeof onKeydown).toBe("function");
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
  onKeydown?.(event);
}

function createPointerLikeEvent(
  type: string,
  target: Element,
  options: { pointerId?: number; pointerType?: string; button?: number } = {}
): PointerEvent {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: options.button ?? 0,
  });

  Object.defineProperty(event, "pointerId", { value: options.pointerId ?? 1 });
  Object.defineProperty(event, "pointerType", { value: options.pointerType ?? "mouse" });
  Object.defineProperty(event, "target", { value: target });
  Object.defineProperty(event, "currentTarget", { value: target });

  return event as PointerEvent;
}

describe("useTableColumnResize", () => {
  afterEach(() => {
    setInteractionModality("pointer");
  });

  it("returns slider props and keyboard description wiring", () => {
    setInteractionModality("keyboard");
    const harness = createResizeHarness();

    expect(harness.aria.isResizing).toBe(false);
    expect(harness.aria.inputProps["aria-label"]).toBe("Resize name column");
    expect(harness.aria.inputProps.type).toBe("range");
    expect(harness.aria.inputProps.min).toBe(
      Math.floor(harness.resizeState.getColumnMinWidth("name"))
    );
    expect(typeof harness.aria.inputProps.max).toBe("number");
    expect(typeof harness.aria.inputProps.value).toBe("number");
    expect(String(harness.aria.inputProps["aria-labelledby"])).toContain("table-id-name");
    expect((harness.aria.resizerProps.style as { touchAction?: string }).touchAction).toBe("none");

    const describedBy = harness.aria.inputProps["aria-describedby"] as string | undefined;
    expect(typeof describedBy).toBe("string");
    expect(document.getElementById(describedBy ?? "")?.textContent).toBe(
      "Press Enter to start resizing"
    );

    harness.cleanup();
  });

  it("starts keyboard resizing, resizes by arrow key, and ends on escape", () => {
    const onResizeStart = vi.fn();
    const onResize = vi.fn();
    const onResizeEnd = vi.fn();
    const harness = createResizeHarness({ onResizeStart, onResize, onResizeEnd });

    const before = harness.resizeState.getColumnWidth("name");
    callKeydown(harness.aria.resizerProps.onKeydown, "Enter");

    expect(harness.state.isKeyboardNavigationDisabled).toBe(true);
    expect(harness.resizeState.resizingColumn).toBe("name");
    expect(onResizeStart).toHaveBeenCalledTimes(1);
    const startMap = onResizeStart.mock.calls[0]?.[0] as Map<Key, ColumnSize>;
    expect(startMap).toBeInstanceOf(Map);
    expect(typeof startMap.get("name")).toBe("number");

    callKeydown(harness.aria.resizerProps.onKeydown, "ArrowRight");

    expect(onResize.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(harness.resizeState.getColumnWidth("name")).not.toBe(before);
    const resizeMap = onResize.mock.calls.at(-1)?.[0] as Map<Key, ColumnSize>;
    expect(resizeMap).toBeInstanceOf(Map);
    expect(typeof resizeMap.get("name")).toBe("number");

    callKeydown(harness.aria.resizerProps.onKeydown, "Escape");

    expect(onResizeEnd).toHaveBeenCalledTimes(1);
    expect(harness.state.isKeyboardNavigationDisabled).toBe(false);
    expect(harness.resizeState.resizingColumn).toBeNull();
    const endMap = onResizeEnd.mock.calls[0]?.[0] as Map<Key, ColumnSize>;
    expect(endMap).toBeInstanceOf(Map);
    expect(typeof endMap.get("name")).toBe("number");

    harness.cleanup();
  });

  it("uses +/-10 width steps on input change and blurs to end resize", () => {
    const onResize = vi.fn();
    const onResizeEnd = vi.fn();
    const harness = createResizeHarness({ onResize, onResizeEnd });

    callKeydown(harness.aria.resizerProps.onKeydown, "Enter");
    const initial = harness.resizeState.getColumnWidth("name");
    const onChange = harness.aria.inputProps.onChange as (event: Event) => void;
    const onBlur = harness.aria.inputProps.onBlur as () => void;
    const min = harness.resizeState.getColumnMinWidth("name");
    const max = harness.resizeState.getColumnMaxWidth("name");

    onChange({ target: { value: String(initial + 200) } } as unknown as Event);
    const afterIncrease = harness.resizeState.getColumnWidth("name");
    expect(afterIncrease).not.toBe(initial);
    expect(afterIncrease).toBeGreaterThanOrEqual(min);
    expect(afterIncrease).toBeLessThanOrEqual(max);

    onChange({ target: { value: String(initial - 200) } } as unknown as Event);
    const afterDecrease = harness.resizeState.getColumnWidth("name");
    expect(afterDecrease).not.toBe(afterIncrease);
    expect(afterDecrease).toBeGreaterThanOrEqual(min);
    expect(afterDecrease).toBeLessThanOrEqual(max);
    expect(onResize.mock.calls.length).toBeGreaterThanOrEqual(2);

    onBlur();
    expect(onResizeEnd).toHaveBeenCalledTimes(1);
    expect(harness.resizeState.resizingColumn).toBeNull();

    harness.cleanup();
  });

  it("reports width values on resize end even when no movement occurs", () => {
    const onResizeStart = vi.fn();
    const onResizeEnd = vi.fn();
    const harness = createResizeHarness({ onResizeStart, onResizeEnd });

    callKeydown(harness.aria.resizerProps.onKeydown, "Enter");
    callKeydown(harness.aria.resizerProps.onKeydown, "Escape");

    expect(onResizeStart).toHaveBeenCalledTimes(1);
    expect(onResizeEnd).toHaveBeenCalledTimes(1);
    const startMap = onResizeStart.mock.calls[0]?.[0] as Map<Key, ColumnSize>;
    const widthMap = onResizeEnd.mock.calls[0]?.[0] as Map<Key, ColumnSize>;
    expect(startMap).toBeInstanceOf(Map);
    expect(widthMap).toBeInstanceOf(Map);
    expect(widthMap.get("name")).toBe(startMap.get("name"));

    harness.cleanup();
  });

  it("handles mouse press start/end resize lifecycle", () => {
    const onResizeStart = vi.fn();
    const onResizeEnd = vi.fn();
    const harness = createResizeHarness({ onResizeStart, onResizeEnd });
    const target = document.createElement("div");
    const onPointerdown = harness.aria.resizerProps.onPointerdown as
      | ((event: PointerEvent) => void)
      | undefined;
    const onMousedown = harness.aria.resizerProps.onMousedown as
      | ((event: MouseEvent) => void)
      | undefined;

    if (onPointerdown) {
      onPointerdown(createPointerLikeEvent("pointerdown", target, { pointerId: 77 }));
      document.dispatchEvent(
        createPointerLikeEvent("pointerup", target, { pointerId: 77 })
      );
    } else {
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

    expect(onResizeStart.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(harness.state.isKeyboardNavigationDisabled).toBe(true);
    expect(harness.resizeState.resizingColumn).toBe("name");

    (harness.aria.inputProps.onBlur as () => void)();
    expect(onResizeEnd.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(harness.state.isKeyboardNavigationDisabled).toBe(false);
    expect(harness.resizeState.resizingColumn).toBeNull();

    harness.cleanup();
  });

  it("returns focus to trigger ref when resize ends", () => {
    const trigger = document.createElement("button");
    const outside = document.createElement("button");
    document.body.appendChild(trigger);
    document.body.appendChild(outside);
    const harness = createResizeHarness({
      triggerRef: { current: trigger },
    });

    trigger.focus();
    callKeydown(harness.aria.resizerProps.onKeydown, "Enter");
    outside.focus();
    expect(document.activeElement).toBe(outside);

    (harness.aria.inputProps.onBlur as () => void)();
    expect(document.activeElement).toBe(trigger);

    harness.cleanup();
    trigger.remove();
    outside.remove();
  });
});
