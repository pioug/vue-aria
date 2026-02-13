import { beforeEach, describe, expect, it, vi } from "vitest";
import { gridMap } from "../src/utils";

const { useSelectableItemMock, focusSafelyMock, isFocusVisibleMock } = vi.hoisted(() => ({
  useSelectableItemMock: vi.fn(() => ({
    itemProps: { tabIndex: 0 },
    isPressed: false,
  })),
  focusSafelyMock: vi.fn((element: HTMLElement) => {
    element.focus();
  }),
  isFocusVisibleMock: vi.fn(() => false),
}));

vi.mock("@vue-aria/selection", async () => {
  const actual = await vi.importActual<typeof import("@vue-aria/selection")>(
    "@vue-aria/selection"
  );
  return {
    ...actual,
    useSelectableItem: useSelectableItemMock,
  };
});

vi.mock("@vue-aria/interactions", async () => {
  const actual = await vi.importActual<typeof import("@vue-aria/interactions")>(
    "@vue-aria/interactions"
  );
  return {
    ...actual,
    focusSafely: focusSafelyMock,
    isFocusVisible: isFocusVisibleMock,
  };
});

import { useGridCell } from "../src/useGridCell";

function createState(overrides: Record<string, unknown> = {}) {
  return {
    collection: {
      size: 3,
    },
    isKeyboardNavigationDisabled: false,
    selectionManager: {
      childFocusStrategy: "first",
      setFocusedKey: vi.fn(),
    },
    ...overrides,
  };
}

function createNode(overrides: Record<string, unknown> = {}) {
  return {
    key: "cell-1",
    index: 0,
    colSpan: 2,
    colIndex: 1,
    ...overrides,
  };
}

function registerGridData(
  state: ReturnType<typeof createState>,
  overrides: Record<string, unknown> = {}
) {
  gridMap.set(state as any, {
    keyboardDelegate: {
      getKeyLeftOf: vi.fn(() => "cell-1"),
      getKeyRightOf: vi.fn(() => "cell-1"),
    } as any,
    actions: {},
    ...overrides,
  });
}

describe("useGridCell", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    useSelectableItemMock.mockReset();
    useSelectableItemMock.mockReturnValue({
      itemProps: { tabIndex: 0 },
      isPressed: false,
    });
    focusSafelyMock.mockClear();
    isFocusVisibleMock.mockReset();
    isFocusVisibleMock.mockReturnValue(false);
  });

  it("maps selectable behavior and aria props for a grid cell", () => {
    const state = createState();
    const node = createNode();
    const onCellAction = vi.fn();
    const onAction = vi.fn();
    registerGridData(state, { actions: { onCellAction } });

    const ref = { current: document.createElement("div") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const { gridCellProps, isPressed } = useGridCell(
      { node: node as any, onAction },
      state as any,
      ref
    );

    const selectableCall = ((useSelectableItemMock as any).mock.calls[0]?.[0]) as any;
    expect(selectableCall.key).toBe("cell-1");
    expect(selectableCall.ref).toBe(ref);
    expect(selectableCall.isVirtualized).toBeUndefined();
    expect(typeof selectableCall.focus).toBe("function");
    selectableCall.onAction();
    expect(onCellAction).toHaveBeenCalledWith("cell-1");
    expect(onAction).not.toHaveBeenCalled();

    expect(gridCellProps.role).toBe("gridcell");
    expect(gridCellProps["aria-colspan"]).toBe(2);
    expect(gridCellProps["aria-colindex"]).toBe(2);
    expect(gridCellProps.colSpan).toBe(2);
    expect(typeof gridCellProps.onKeydownCapture).toBe("function");
    expect(typeof gridCellProps.onFocus).toBe("function");
    expect(isPressed).toBe(false);

    ref.current?.remove();
  });

  it("uses virtualized colindex and legacy onAction fallback", () => {
    const state = createState();
    const node = createNode({ colIndex: null, index: 4 });
    registerGridData(state);
    const onAction = vi.fn();
    const ref = { current: document.createElement("div") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const { gridCellProps } = useGridCell(
      {
        node: node as any,
        isVirtualized: true,
        onAction,
      },
      state as any,
      ref
    );

    const selectableCall = ((useSelectableItemMock as any).mock.calls[0]?.[0]) as any;
    selectableCall.onAction();
    expect(onAction).toHaveBeenCalledTimes(1);

    expect(gridCellProps.colSpan).toBeUndefined();
    expect(gridCellProps["aria-colindex"]).toBe(5);

    ref.current?.remove();
  });

  it("sets focused key when a child receives focus and focus ring is not visible", () => {
    const setFocusedKey = vi.fn();
    const state = createState({
      selectionManager: {
        childFocusStrategy: "first",
        setFocusedKey,
      },
    });
    registerGridData(state);

    const refElement = document.createElement("div");
    const child = document.createElement("button");
    refElement.appendChild(child);
    document.body.appendChild(refElement);

    const { gridCellProps } = useGridCell(
      { node: createNode() as any },
      state as any,
      { current: refElement }
    );

    const onFocus = gridCellProps.onFocus as (event: FocusEvent) => void;
    onFocus({ target: child, currentTarget: refElement } as any);
    expect(setFocusedKey).toHaveBeenCalledWith("cell-1");

    isFocusVisibleMock.mockReturnValue(true);
    onFocus({ target: child, currentTarget: refElement } as any);
    expect(setFocusedKey).toHaveBeenCalledTimes(1);

    refElement.remove();
  });

  it("moves focus to the first focusable child when the cell itself receives focus", () => {
    const state = createState();
    registerGridData(state);
    const refElement = document.createElement("div");
    refElement.tabIndex = 0;
    const first = document.createElement("button");
    const second = document.createElement("button");
    refElement.append(first, second);
    document.body.appendChild(refElement);

    const raf = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback: FrameRequestCallback): number => {
        callback(performance.now());
        return 1;
      });

    const { gridCellProps } = useGridCell(
      { node: createNode() as any, focusMode: "child" },
      state as any,
      { current: refElement }
    );

    refElement.focus();
    const onFocus = gridCellProps.onFocus as (event: FocusEvent) => void;
    onFocus({ target: refElement, currentTarget: refElement } as any);

    expect(focusSafelyMock).toHaveBeenCalledWith(first);
    expect(document.activeElement).toBe(first);

    raf.mockRestore();
    refElement.remove();
  });

  it("handles ArrowRight within cell focusables before leaving the cell", () => {
    const state = createState();
    registerGridData(state);
    const parent = document.createElement("div");
    const refElement = document.createElement("div");
    const first = document.createElement("button");
    const second = document.createElement("button");
    refElement.append(first, second);
    parent.appendChild(refElement);
    document.body.appendChild(parent);

    const { gridCellProps } = useGridCell(
      { node: createNode() as any, focusMode: "child" },
      state as any,
      { current: refElement }
    );
    const onKeydownCapture = gridCellProps.onKeydownCapture as (event: KeyboardEvent) => void;
    refElement.addEventListener("keydown", onKeydownCapture as EventListener, true);

    const parentKeydown = vi.fn();
    parent.addEventListener("keydown", parentKeydown);
    first.focus();
    first.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));

    expect(document.activeElement).toBe(second);
    expect(parentKeydown).not.toHaveBeenCalled();

    refElement.removeEventListener("keydown", onKeydownCapture as EventListener, true);
    parent.remove();
  });

  it("redispatches ArrowRight to the row container when no in-cell target exists", () => {
    const state = createState();
    registerGridData(state, {
      keyboardDelegate: {
        getKeyLeftOf: vi.fn(() => "cell-1"),
        getKeyRightOf: vi.fn(() => "cell-2"),
      },
    });
    const parent = document.createElement("div");
    const refElement = document.createElement("div");
    const onlyButton = document.createElement("button");
    refElement.appendChild(onlyButton);
    parent.appendChild(refElement);
    document.body.appendChild(parent);

    const { gridCellProps } = useGridCell(
      { node: createNode() as any, focusMode: "child" },
      state as any,
      { current: refElement }
    );
    const onKeydownCapture = gridCellProps.onKeydownCapture as (event: KeyboardEvent) => void;
    refElement.addEventListener("keydown", onKeydownCapture as EventListener, true);

    const keys: string[] = [];
    parent.addEventListener("keydown", (event) => keys.push((event as KeyboardEvent).key));
    onlyButton.focus();
    onlyButton.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true })
    );

    expect(keys).toEqual(["ArrowRight"]);

    refElement.removeEventListener("keydown", onKeydownCapture as EventListener, true);
    parent.remove();
  });

  it("applies temporary tabIndex removal on pointerdown when selecting on press up", () => {
    const state = createState();
    registerGridData(state);
    useSelectableItemMock.mockReturnValue({
      itemProps: { tabIndex: 0 },
      isPressed: false,
    });
    const refElement = document.createElement("div");
    refElement.tabIndex = 0;
    document.body.appendChild(refElement);

    const raf = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback: FrameRequestCallback): number => {
        callback(performance.now());
        return 1;
      });

    const { gridCellProps } = useGridCell(
      { node: createNode() as any, shouldSelectOnPressUp: true },
      state as any,
      { current: refElement }
    );

    refElement.setAttribute("tabindex", "0");
    const removeAttribute = vi.spyOn(refElement, "removeAttribute");
    const setAttribute = vi.spyOn(refElement, "setAttribute");
    const onPointerdown = gridCellProps.onPointerdown as (event: PointerEvent) => void;
    onPointerdown({ currentTarget: refElement } as any);

    expect(removeAttribute).toHaveBeenCalledWith("tabindex");
    expect(setAttribute).toHaveBeenCalledWith("tabindex", "0");

    raf.mockRestore();
    refElement.remove();
  });

  it("preserves existing pointerdown handler from selectable item props", () => {
    const state = createState();
    registerGridData(state);
    const pointerDown = vi.fn();
    useSelectableItemMock.mockReturnValue({
      itemProps: {
        tabIndex: 0,
        onPointerdown: pointerDown,
      } as any,
      isPressed: false,
    });

    const refElement = document.createElement("div");
    document.body.appendChild(refElement);
    const { gridCellProps } = useGridCell(
      { node: createNode() as any, shouldSelectOnPressUp: true },
      state as any,
      { current: refElement }
    );

    expect(gridCellProps.onPointerdown).toBe(pointerDown);
    refElement.remove();
  });
});
