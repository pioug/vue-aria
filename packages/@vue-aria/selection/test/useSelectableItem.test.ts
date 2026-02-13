import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSelectableItem } from "../src/useSelectableItem";
import type { Key, MultipleSelectionManager } from "@vue-aria/selection-state";
import { useCollectionId } from "../src/utils";

const open = vi.fn();
const { moveVirtualFocus } = vi.hoisted(() => ({
  moveVirtualFocus: vi.fn(),
}));

vi.mock("@vue-aria/utils", async () => {
  const actual = await vi.importActual<typeof import("@vue-aria/utils")>("@vue-aria/utils");
  return {
    ...actual,
    useRouter: () => ({ open }),
  };
});

vi.mock("@vue-aria/interactions", () => ({
  focusSafely: vi.fn(),
}));
vi.mock("@vue-aria/focus", () => ({
  moveVirtualFocus,
}));

function createManager(overrides: Partial<MultipleSelectionManager> = {}): MultipleSelectionManager {
  return {
    selectionMode: "multiple",
    selectionBehavior: "replace",
    disallowEmptySelection: false,
    selectedKeys: new Set<Key>(),
    isEmpty: true,
    isSelectAll: false,
    firstSelectedKey: null,
    lastSelectedKey: null,
    disabledKeys: new Set<Key>(),
    disabledBehavior: "all",
    focusedKey: null,
    isFocused: false,
    childFocusStrategy: null,
    collection: {
      getItem: () => null,
      getFirstKey: () => null,
      getKeyAfter: () => null,
      getChildren: function* () {},
    },
    setFocused: vi.fn(),
    setFocusedKey: vi.fn(),
    isSelected: vi.fn(() => false),
    isSelectionEqual: vi.fn(() => false),
    extendSelection: vi.fn(),
    toggleSelection: vi.fn(),
    replaceSelection: vi.fn(),
    setSelectedKeys: vi.fn(),
    selectAll: vi.fn(),
    clearSelection: vi.fn(),
    toggleSelectAll: vi.fn(),
    select: vi.fn(),
    canSelectItem: vi.fn(() => true),
    isDisabled: vi.fn(() => false),
    isLink: vi.fn(() => false),
    getItemProps: vi.fn(() => ({})),
    ...overrides,
  };
}

describe("useSelectableItem", () => {
  beforeEach(() => {
    open.mockReset();
    moveVirtualFocus.mockReset();
  });

  it("replaces selection on click in replace mode", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };

    const { itemProps } = useSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
    });

    const onClick = itemProps.onClick as (event: MouseEvent) => void;
    onClick(new MouseEvent("click", { bubbles: true }));

    expect(manager.replaceSelection).toHaveBeenCalledWith("a");
  });

  it("toggles selection when ctrl-clicking", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };

    const { itemProps } = useSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
    });

    const onClick = itemProps.onClick as (event: MouseEvent) => void;
    onClick(new MouseEvent("click", { bubbles: true, ctrlKey: true }));

    expect(manager.toggleSelection).toHaveBeenCalledWith("a");
  });

  it("selects on mousedown by default and does not reselection on click", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };

    const { itemProps } = useSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
    });

    const onMousedown = itemProps.onMousedown as (event: MouseEvent) => void;
    onMousedown(new MouseEvent("mousedown", { bubbles: true, button: 0 }));

    const onClick = itemProps.onClick as (event: MouseEvent) => void;
    onClick(new MouseEvent("click", { bubbles: true }));

    expect(manager.replaceSelection).toHaveBeenCalledTimes(1);
    expect(manager.replaceSelection).toHaveBeenCalledWith("a");
  });

  it("defers selection to click when shouldSelectOnPressUp is enabled", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };

    const { itemProps } = useSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      shouldSelectOnPressUp: true,
    });

    const onMousedown = itemProps.onMousedown as ((event: MouseEvent) => void) | undefined;
    onMousedown?.(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
    expect(manager.replaceSelection).not.toHaveBeenCalled();

    const onClick = itemProps.onClick as (event: MouseEvent) => void;
    onClick(new MouseEvent("click", { bubbles: true }));

    expect(manager.replaceSelection).toHaveBeenCalledTimes(1);
    expect(manager.replaceSelection).toHaveBeenCalledWith("a");
  });

  it("selects on mouseup when press-up selection allows different press origin", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };

    const { itemProps } = useSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      shouldSelectOnPressUp: true,
      allowsDifferentPressOrigin: true,
    });

    const onMousedown = itemProps.onMousedown as ((event: MouseEvent) => void) | undefined;
    onMousedown?.(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
    expect(manager.replaceSelection).not.toHaveBeenCalled();

    const onMouseup = itemProps.onMouseup as (event: MouseEvent) => void;
    onMouseup(new MouseEvent("mouseup", { bubbles: true, button: 0 }));
    expect(manager.replaceSelection).toHaveBeenCalledTimes(1);
    expect(manager.replaceSelection).toHaveBeenCalledWith("a");

    const onClick = itemProps.onClick as (event: MouseEvent) => void;
    onClick(new MouseEvent("click", { bubbles: true }));
    expect(manager.replaceSelection).toHaveBeenCalledTimes(1);
  });

  it("toggles selection for touch/virtual pointer interactions", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };

    const { itemProps } = useSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
    });

    const onClick = itemProps.onClick as (event: MouseEvent) => void;
    const touchClick = new MouseEvent("click", { bubbles: true });
    Object.defineProperty(touchClick, "pointerType", { value: "touch" });
    onClick(touchClick);

    const virtualClick = new MouseEvent("click", { bubbles: true });
    Object.defineProperty(virtualClick, "pointerType", { value: "virtual" });
    onClick(virtualClick);

    expect(manager.toggleSelection).toHaveBeenCalledTimes(2);
    expect(manager.toggleSelection).toHaveBeenNthCalledWith(1, "a");
    expect(manager.toggleSelection).toHaveBeenNthCalledWith(2, "a");
  });

  it.each(["touch", "virtual"] as const)(
    "uses toggle mode across items for %s pointer interactions in replace behavior",
    (pointerType) => {
      const selectedKeys = new Set<Key>();
      const manager = createManager({
        selectedKeys,
        isSelected: vi.fn((key: Key) => selectedKeys.has(key)),
      });

      manager.toggleSelection = vi.fn((key: Key) => {
        if (selectedKeys.has(key)) {
          selectedKeys.delete(key);
        } else {
          selectedKeys.add(key);
        }
      });

      manager.replaceSelection = vi.fn((key: Key) => {
        selectedKeys.clear();
        selectedKeys.add(key);
      });

      const firstRef = { current: document.createElement("div") };
      const thirdRef = { current: document.createElement("div") };
      const first = useSelectableItem({
        selectionManager: manager,
        key: "i1",
        ref: firstRef,
      });
      const third = useSelectableItem({
        selectionManager: manager,
        key: "i3",
        ref: thirdRef,
      });

      const firstClick = new MouseEvent("click", { bubbles: true });
      Object.defineProperty(firstClick, "pointerType", { value: pointerType });
      (first.itemProps.onClick as (event: MouseEvent) => void)(firstClick);

      const thirdClick = new MouseEvent("click", { bubbles: true });
      Object.defineProperty(thirdClick, "pointerType", { value: pointerType });
      (third.itemProps.onClick as (event: MouseEvent) => void)(thirdClick);

      expect(manager.toggleSelection).toHaveBeenNthCalledWith(1, "i1");
      expect(manager.toggleSelection).toHaveBeenNthCalledWith(2, "i3");
      expect(manager.replaceSelection).not.toHaveBeenCalled();
      expect(selectedKeys).toEqual(new Set<Key>(["i1", "i3"]));
    }
  );

  it("runs primary action when selection is disabled", () => {
    const onAction = vi.fn();
    const manager = createManager({
      selectionMode: "none",
      canSelectItem: vi.fn(() => false),
    });
    const ref = { current: document.createElement("div") };

    const { itemProps, hasAction } = useSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      onAction,
    });

    expect(hasAction).toBe(true);

    const onClick = itemProps.onClick as (event: MouseEvent) => void;
    onClick(new MouseEvent("click", { bubbles: true }));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(open).not.toHaveBeenCalled();
  });

  it("opens links and preserves selected keys for selection link behavior", () => {
    const selectedKeys = new Set<Key>(["a"]);
    const manager = createManager({
      isLink: vi.fn(() => true),
      getItemProps: vi.fn(() => ({ href: "/docs", routerOptions: { source: "test" } })),
      selectedKeys,
    });
    const ref = { current: document.createElement("a") };

    const { itemProps } = useSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      linkBehavior: "selection",
    });

    const onClick = itemProps.onClick as (event: MouseEvent) => void;
    const event = new MouseEvent("click", { bubbles: true });
    onClick(event);

    expect(open).toHaveBeenCalledWith(ref.current, event, "/docs", { source: "test" });
    expect(manager.setSelectedKeys).toHaveBeenCalledWith(selectedKeys);
    expect(manager.replaceSelection).not.toHaveBeenCalled();
    expect(manager.toggleSelection).not.toHaveBeenCalled();
  });

  it("opens link without selection when link behavior is override", () => {
    const manager = createManager({
      isLink: vi.fn(() => true),
    });
    const ref = { current: document.createElement("a") };

    const { itemProps } = useSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      linkBehavior: "override",
    });

    const onClick = itemProps.onClick as (event: MouseEvent) => void;
    onClick(new MouseEvent("click", { bubbles: true }));

    expect(open).toHaveBeenCalledTimes(1);
    expect(manager.replaceSelection).not.toHaveBeenCalled();
    expect(manager.toggleSelection).not.toHaveBeenCalled();
    expect(manager.extendSelection).not.toHaveBeenCalled();
  });

  it("prevents native click navigation for actionable link items", () => {
    const manager = createManager({
      isLink: vi.fn(() => true),
      getItemProps: vi.fn(() => ({ href: "/docs" })),
    });
    const ref = { current: document.createElement("a") };

    const { itemProps } = useSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
    });

    const onClick = itemProps.onClick as (event: MouseEvent) => void;
    const event = {
      shiftKey: false,
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      preventDefault: vi.fn(),
    } as unknown as MouseEvent;
    onClick(event);

    expect((event.preventDefault as any).mock.calls.length).toBe(1);
  });

  it("does nothing for link selection when link behavior is none", () => {
    const manager = createManager({
      isLink: vi.fn(() => true),
    });
    const ref = { current: document.createElement("a") };

    const { itemProps } = useSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      linkBehavior: "none",
    });

    const onClick = itemProps.onClick as (event: MouseEvent) => void;
    onClick(new MouseEvent("click", { bubbles: true }));

    expect(open).not.toHaveBeenCalled();
    expect(manager.replaceSelection).not.toHaveBeenCalled();
    expect(manager.toggleSelection).not.toHaveBeenCalled();
    expect(manager.extendSelection).not.toHaveBeenCalled();
  });

  it("handles Enter and Space keyboard selection paths", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };

    const { itemProps } = useSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
    });

    const onKeydown = itemProps.onKeydown as (event: KeyboardEvent) => void;
    const enter = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
    onKeydown(enter);

    const space = {
      key: " ",
      shiftKey: false,
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent;
    onKeydown(space);

    expect(manager.replaceSelection).toHaveBeenCalledTimes(2);
    expect(manager.replaceSelection).toHaveBeenNthCalledWith(1, "a");
    expect(manager.replaceSelection).toHaveBeenNthCalledWith(2, "a");
    expect((space.preventDefault as any).mock.calls.length).toBe(1);
  });

  it("runs secondary action on Enter and double click in replace selection mode", () => {
    const onAction = vi.fn();
    const manager = createManager({
      selectionBehavior: "replace",
      canSelectItem: vi.fn(() => true),
    });
    const ref = { current: document.createElement("div") };

    const { itemProps, hasAction } = useSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      onAction,
    });

    expect(hasAction).toBe(true);

    const onKeydown = itemProps.onKeydown as (event: KeyboardEvent) => void;
    onKeydown(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    const onDoubleClick = itemProps.onDoubleClick as (event: MouseEvent) => void;
    onDoubleClick(new MouseEvent("dblclick", { bubbles: true }));

    expect(onAction).toHaveBeenCalledTimes(2);
    expect(manager.replaceSelection).not.toHaveBeenCalled();
  });

  it("forces action behavior when UNSTABLE_itemBehavior is action", () => {
    const onAction = vi.fn();
    const manager = createManager({
      selectionBehavior: "replace",
    });
    const ref = { current: document.createElement("div") };

    const { itemProps, allowsSelection, hasAction } = useSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      onAction,
      UNSTABLE_itemBehavior: "action",
    });

    expect(allowsSelection).toBe(false);
    expect(hasAction).toBe(true);

    const onClick = itemProps.onClick as (event: MouseEvent) => void;
    onClick(new MouseEvent("click", { bubbles: true }));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(manager.replaceSelection).not.toHaveBeenCalled();
    expect(manager.toggleSelection).not.toHaveBeenCalled();
    expect(manager.extendSelection).not.toHaveBeenCalled();
  });

  it("prevents mousedown and clears focused key for disabled focused item", () => {
    const manager = createManager({
      focusedKey: "a",
      isDisabled: vi.fn(() => true),
    });
    const ref = { current: document.createElement("div") };

    const { itemProps } = useSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
    });

    expect(manager.setFocusedKey).toHaveBeenCalledWith(null);

    const onMousedown = itemProps.onMousedown as (event: MouseEvent) => void;
    const event = { preventDefault: vi.fn() } as unknown as MouseEvent;
    onMousedown(event);
    expect((event.preventDefault as any).mock.calls.length).toBe(1);
  });

  it("moves virtual focus when the item is focused in virtual focus mode", () => {
    const manager = createManager({
      focusedKey: "a",
      isFocused: true,
    });
    const ref = { current: document.createElement("div") };

    useSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      shouldUseVirtualFocus: true,
    });

    expect(moveVirtualFocus).toHaveBeenCalledWith(ref.current);
  });

  it("sets collection focus state on click when using virtual focus", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };

    const { itemProps } = useSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      shouldUseVirtualFocus: true,
    });

    const onClick = itemProps.onClick as (event: MouseEvent) => void;
    onClick(new MouseEvent("click", { bubbles: true }));

    expect(manager.setFocused).toHaveBeenCalledWith(true);
    expect(manager.setFocusedKey).toHaveBeenCalledWith("a");
  });

  it("prevents mousedown focus transfer when virtual focus is enabled", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };

    const { itemProps } = useSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      shouldUseVirtualFocus: true,
    });

    const onMousedown = itemProps.onMousedown as (event: MouseEvent) => void;
    const event = { preventDefault: vi.fn() } as unknown as MouseEvent;
    onMousedown(event);

    expect((event.preventDefault as any).mock.calls.length).toBe(1);
  });

  it("adds collection metadata attributes and forwards explicit ids", () => {
    const manager = createManager();
    const collectionId = useCollectionId(manager.collection as object);
    const ref = { current: document.createElement("div") };

    const first = useSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      id: "custom-item-id",
    });
    const second = useSelectableItem({
      selectionManager: manager,
      key: "b",
      ref: { current: document.createElement("div") },
    });

    expect(first.itemProps["data-key"]).toBe("a");
    expect(second.itemProps["data-key"]).toBe("b");
    expect(first.itemProps["data-collection"]).toBe(collectionId);
    expect(second.itemProps["data-collection"]).toBe(collectionId);
    expect(first.itemProps.id).toBe("custom-item-id");
  });
});
