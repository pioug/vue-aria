import type { Node as CollectionNode } from "@vue-aria/collections";
import { effectScope } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listMap } from "../src/utils";

const { useSelectableItemMock, isFocusVisibleMock, focusSafelyMock } = vi.hoisted(() => ({
  useSelectableItemMock: vi.fn(() => ({
    itemProps: {
      tabIndex: 0,
    },
    isPressed: false,
    isSelected: false,
    isFocused: false,
    isDisabled: false,
    allowsSelection: true,
    hasAction: true,
  })),
  isFocusVisibleMock: vi.fn(() => false),
  focusSafelyMock: vi.fn((element: HTMLElement) => {
    element.focus();
  }),
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
    isFocusVisible: isFocusVisibleMock,
  };
});

vi.mock("@vue-aria/focus", async () => {
  const actual = await vi.importActual<typeof import("@vue-aria/focus")>("@vue-aria/focus");
  return {
    ...actual,
    focusSafely: focusSafelyMock,
  };
});

import { useGridListItem } from "../src/useGridListItem";

function createNode(overrides: Partial<CollectionNode<unknown>> = {}): CollectionNode<unknown> {
  return {
    type: "item",
    key: "item-1",
    value: null,
    level: 0,
    hasChildNodes: false,
    rendered: "Item 1",
    textValue: "Item 1",
    index: 0,
    parentKey: null,
    prevKey: null,
    nextKey: null,
    firstChildKey: null,
    lastChildKey: null,
    props: {},
    colSpan: null,
    colIndex: null,
    childNodes: [],
    ...overrides,
  };
}

function createListState(overrides: Record<string, unknown> = {}) {
  return {
    collection: {
      getChildren: vi.fn(() => []),
      getKeys: vi.fn(() => [][Symbol.iterator]()),
      getItem: vi.fn(() => null),
      [Symbol.iterator]: function * iterator() {},
    },
    selectionManager: {
      selectionMode: "single",
      focusedKey: null,
      isLink: vi.fn(() => false),
      isSelected: vi.fn(() => true),
      canSelectItem: vi.fn(() => true),
      isDisabled: vi.fn(() => false),
      setFocusedKey: vi.fn(),
    },
    ...overrides,
  };
}

function createTreeState(node: CollectionNode<unknown>) {
  const siblingA = createNode({ key: "child-a", textValue: "Child A", level: 1, parentKey: node.key, index: 0 });
  const siblingB = createNode({ key: "child-b", textValue: "Child B", level: 1, parentKey: node.key, index: 1 });
  const map = new Map<any, CollectionNode<unknown>>([
    [node.key, node],
    [siblingA.key, siblingA],
    [siblingB.key, siblingB],
  ]);

  return createListState({
    collection: {
      getChildren: vi.fn((key: string) => (key === node.key ? [siblingA, siblingB] : [])),
      getKeys: vi.fn(() => [node.key, siblingA.key, siblingB.key][Symbol.iterator]()),
      getItem: vi.fn((key: string) => map.get(key) ?? null),
      [Symbol.iterator]: function * iterator() {
        yield node;
        yield siblingA;
        yield siblingB;
      },
    },
    expandedKeys: new Set<string>(),
    toggleKey: vi.fn(),
    selectionManager: {
      selectionMode: "none",
      focusedKey: node.key,
      isLink: vi.fn(() => false),
      isSelected: vi.fn(() => false),
      canSelectItem: vi.fn(() => true),
      isDisabled: vi.fn(() => false),
      setFocusedKey: vi.fn(),
      setFocused: vi.fn(),
    },
  });
}

function runInScope<T>(factory: () => T): T {
  const scope = effectScope();
  try {
    return scope.run(factory)!;
  } finally {
    scope.stop();
  }
}

describe("useGridListItem", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    useSelectableItemMock.mockReset();
    useSelectableItemMock.mockReturnValue({
      itemProps: {
        tabIndex: 0,
      },
      isPressed: false,
      isSelected: false,
      isFocused: false,
      isDisabled: false,
      allowsSelection: true,
      hasAction: true,
    });
    isFocusVisibleMock.mockReset();
    isFocusVisibleMock.mockReturnValue(false);
    focusSafelyMock.mockClear();
  });

  it("wires selectable item options and merged row semantics", () => {
    const onAction = vi.fn();
    const onNodeAction = vi.fn();
    const state = createListState();
    listMap.set(state as object, {
      id: "list-id",
      onAction,
      keyboardNavigationBehavior: "arrow",
      shouldSelectOnPressUp: true,
    });

    const node = createNode({
      key: "item 1",
      props: {
        onAction: onNodeAction,
      },
    });
    const rowElement = document.createElement("div");
    document.body.appendChild(rowElement);
    const ref = { current: rowElement as HTMLElement | null };

    const { rowProps, gridCellProps, descriptionProps } = runInScope(() =>
      useGridListItem(
        {
          node,
        },
        state as any,
        ref
      )
    );

    const selectableCall = ((useSelectableItemMock as any).mock.calls[0]?.[0]) as any;
    expect(selectableCall.key).toBe("item 1");
    expect(selectableCall.shouldSelectOnPressUp).toBe(true);

    const forwardedAction = selectableCall.onAction as (() => void) | undefined;
    forwardedAction?.();
    expect(onNodeAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith("item 1");

    expect(rowProps.role).toBe("row");
    expect(rowProps.id).toBe("list-id-item1");
    expect(gridCellProps.role).toBe("gridcell");
    expect(gridCellProps["aria-colindex"]).toBe(1);
    expect(descriptionProps.id).toBeUndefined();

    rowElement.remove();
  });

  it("computes virtualized row index with section entries removed", () => {
    const section = createNode({ type: "section", key: "section", textValue: "Section", index: 0 });
    const itemA = createNode({ key: "item-a", textValue: "Item A", index: 0 });
    const itemB = createNode({ key: "item-b", textValue: "Item B", index: 1 });
    const keyOrder = ["section", "item-a", "item-b"];
    const map = new Map([
      ["section", section],
      ["item-a", itemA],
      ["item-b", itemB],
    ]);
    const state = createListState({
      collection: {
        getChildren: vi.fn(() => []),
        getKeys: vi.fn(() => keyOrder[Symbol.iterator]()),
        getItem: vi.fn((key: string) => map.get(key) ?? null),
        [Symbol.iterator]: function * iterator() {
          yield section;
          yield itemA;
          yield itemB;
        },
      },
    });
    listMap.set(state as object, {
      id: "list-id",
      keyboardNavigationBehavior: "arrow",
    });

    const rowElement = document.createElement("div");
    document.body.appendChild(rowElement);
    const { rowProps } = runInScope(() =>
      useGridListItem(
        {
          node: itemB,
          isVirtualized: true,
        },
        state as any,
        { current: rowElement as HTMLElement | null }
      )
    );

    expect(rowProps["aria-rowindex"]).toBe(2);
    rowElement.remove();
  });

  it("toggles tree expansion with arrow keys when row itself is focused", () => {
    const node = createNode({
      key: "parent",
      level: 0,
    });
    const state = createTreeState(node);
    listMap.set(state as object, {
      id: "tree-id",
      keyboardNavigationBehavior: "arrow",
    });

    const rowElement = document.createElement("div");
    rowElement.tabIndex = 0;
    document.body.appendChild(rowElement);
    const { rowProps } = runInScope(() =>
      useGridListItem(
        {
          node,
        },
        state as any,
        { current: rowElement as HTMLElement | null }
      )
    );

    const onKeydownCapture = rowProps.onKeydownCapture as (event: KeyboardEvent) => void;
    rowElement.addEventListener("keydown", onKeydownCapture as EventListener, true);

    rowElement.focus();
    rowElement.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
    expect((state as any).toggleKey).toHaveBeenCalledWith("parent");

    (state as any).expandedKeys = new Set(["parent"]);
    rowElement.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }));
    expect((state as any).toggleKey).toHaveBeenCalledWith("parent");

    rowElement.removeEventListener("keydown", onKeydownCapture as EventListener, true);
    rowElement.remove();
  });

  it("updates focused key when child receives focus and focus visibility is off", () => {
    const setFocusedKey = vi.fn();
    const state = createListState({
      selectionManager: {
        selectionMode: "single",
        focusedKey: null,
        isLink: vi.fn(() => false),
        isSelected: vi.fn(() => false),
        canSelectItem: vi.fn(() => true),
        isDisabled: vi.fn(() => false),
        setFocusedKey,
      },
    });
    listMap.set(state as object, {
      id: "list-id",
      keyboardNavigationBehavior: "arrow",
    });

    const rowElement = document.createElement("div");
    const child = document.createElement("button");
    rowElement.appendChild(child);
    document.body.appendChild(rowElement);

    const { rowProps } = runInScope(() =>
      useGridListItem(
        {
          node: createNode(),
        },
        state as any,
        { current: rowElement as HTMLElement | null }
      )
    );

    const onFocus = rowProps.onFocus as (event: FocusEvent) => void;
    onFocus({ target: child, currentTarget: rowElement } as any);
    expect(setFocusedKey).toHaveBeenCalledWith("item-1");

    isFocusVisibleMock.mockReturnValue(true);
    onFocus({ target: child, currentTarget: rowElement } as any);
    expect(setFocusedKey).toHaveBeenCalledTimes(1);

    rowElement.remove();
  });
});
