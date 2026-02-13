import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSelectableItem } from "../src/useSelectableItem";
import type { Key, MultipleSelectionManager } from "@vue-aria/selection-state";
import { useCollectionId } from "../src/utils";
import { openLink } from "@vue-aria/utils";
import { effectScope, type EffectScope } from "vue";

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

vi.mock("@vue-aria/interactions", async () => {
  const actual = await vi.importActual<typeof import("@vue-aria/interactions")>("@vue-aria/interactions");
  return {
    ...actual,
    focusSafely: vi.fn(),
  };
});
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
    setSelectionBehavior: vi.fn(),
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

const activeScopes: EffectScope[] = [];
const originalPointerEvent = globalThis.PointerEvent;

function runSelectableItem(options: Parameters<typeof useSelectableItem>[0]) {
  const scope = effectScope();
  activeScopes.push(scope);
  return scope.run(() => useSelectableItem(options))!;
}

function setEventTarget<T extends object>(event: T, target: EventTarget | null): T {
  if (!target) {
    return event;
  }

  Object.defineProperty(event, "currentTarget", { value: target, configurable: true });
  if (!("target" in event) || (event as { target?: unknown }).target == null) {
    Object.defineProperty(event, "target", { value: target, configurable: true });
  }

  return event;
}

function triggerMouseDown(itemProps: Record<string, unknown>, target: EventTarget | null, init: MouseEventInit = {}) {
  const onMousedown = itemProps.onMousedown as ((event: MouseEvent) => void) | undefined;
  if (!onMousedown) {
    return;
  }

  const event = {
    type: "mousedown",
    button: init.button ?? 0,
    currentTarget: target,
    target,
    shiftKey: init.shiftKey ?? false,
    ctrlKey: init.ctrlKey ?? false,
    metaKey: init.metaKey ?? false,
    altKey: init.altKey ?? false,
    clientX: 0,
    clientY: 0,
    stopPropagation: vi.fn(),
    preventDefault: vi.fn(),
  } as unknown as MouseEvent;

  onMousedown(event);
}

function triggerMouseUp(itemProps: Record<string, unknown>, target: EventTarget | null, init: MouseEventInit = {}) {
  const onMouseup = itemProps.onMouseup as ((event: MouseEvent) => void) | undefined;
  if (!onMouseup) {
    return;
  }

  const event = {
    type: "mouseup",
    button: init.button ?? 0,
    currentTarget: target,
    target,
    shiftKey: init.shiftKey ?? false,
    ctrlKey: init.ctrlKey ?? false,
    metaKey: init.metaKey ?? false,
    altKey: init.altKey ?? false,
    clientX: 0,
    clientY: 0,
    stopPropagation: vi.fn(),
    preventDefault: vi.fn(),
  } as unknown as MouseEvent;

  onMouseup(event);
}

function triggerClick(
  itemProps: Record<string, unknown>,
  target: EventTarget | null,
  init: MouseEventInit & { pointerType?: string } = {}
) {
  const onClick = itemProps.onClick as ((event: MouseEvent) => void) | undefined;
  if (!onClick) {
    return;
  }

  const { pointerType, ...mouseInit } = init;
  const event = {
    type: "click",
    button: mouseInit.button ?? 0,
    currentTarget: target,
    target,
    shiftKey: mouseInit.shiftKey ?? false,
    ctrlKey: mouseInit.ctrlKey ?? false,
    metaKey: mouseInit.metaKey ?? false,
    altKey: mouseInit.altKey ?? false,
    clientX: 0,
    clientY: 0,
    stopPropagation: vi.fn(),
    preventDefault: vi.fn(),
  } as unknown as MouseEvent;
  if (pointerType) {
    Object.defineProperty(event, "pointerType", { value: pointerType, configurable: true });
  }

  onClick(event);
  return event;
}

function triggerMousePress(
  itemProps: Record<string, unknown>,
  target: EventTarget | null,
  init: MouseEventInit & { pointerType?: string } = {}
) {
  triggerMouseDown(itemProps, target, init);
  return triggerClick(itemProps, target, init);
}

function triggerKeyPress(
  itemProps: Record<string, unknown>,
  target: EventTarget | null,
  key: string,
  init: KeyboardEventInit = {}
) {
  const onKeydown = itemProps.onKeydown as ((event: KeyboardEvent) => void) | undefined;
  const onKeyup = itemProps.onKeyup as ((event: KeyboardEvent) => void) | undefined;

  const keydown = {
    type: "keydown",
    key,
    code: init.code,
    repeat: init.repeat ?? false,
    currentTarget: target,
    target,
    shiftKey: init.shiftKey ?? false,
    ctrlKey: init.ctrlKey ?? false,
    metaKey: init.metaKey ?? false,
    altKey: init.altKey ?? false,
    stopPropagation: vi.fn(),
    preventDefault: vi.fn(),
  } as unknown as KeyboardEvent;
  onKeydown?.(keydown);

  const keyup = {
    type: "keyup",
    key,
    code: init.code,
    repeat: init.repeat ?? false,
    currentTarget: target,
    target,
    shiftKey: init.shiftKey ?? false,
    ctrlKey: init.ctrlKey ?? false,
    metaKey: init.metaKey ?? false,
    altKey: init.altKey ?? false,
    stopPropagation: vi.fn(),
    preventDefault: vi.fn(),
  } as unknown as KeyboardEvent;
  onKeyup?.(keyup);

  return { keydown, keyup };
}

function installPointerEvent() {
  class MockPointerEvent extends MouseEvent {
    pointerType: string;
    pointerId: number;

    constructor(type: string, init: MouseEventInit & { pointerType?: string; pointerId?: number } = {}) {
      super(type, init);
      this.pointerType = init.pointerType ?? "mouse";
      this.pointerId = init.pointerId ?? 1;
    }
  }

  (globalThis as { PointerEvent?: typeof PointerEvent }).PointerEvent =
    MockPointerEvent as unknown as typeof PointerEvent;
}

function triggerPointerDown(itemProps: Record<string, unknown>, target: EventTarget | null, pointerType: string) {
  const onPointerdown = itemProps.onPointerdown as ((event: PointerEvent) => void) | undefined;
  if (!onPointerdown) {
    return;
  }

  const event = setEventTarget(
    new PointerEvent("pointerdown", { bubbles: true, button: 0, pointerId: 1, pointerType } as PointerEventInit),
    target
  );
  onPointerdown(event);
}

function triggerPointerPress(itemProps: Record<string, unknown>, target: EventTarget | null, pointerType: string) {
  triggerPointerDown(itemProps, target, pointerType);
  triggerClick(itemProps, target, { pointerType });
}

describe("useSelectableItem", () => {
  beforeEach(() => {
    open.mockReset();
    moveVirtualFocus.mockReset();
    openLink.isOpening = false;
  });

  afterEach(() => {
    while (activeScopes.length > 0) {
      activeScopes.pop()?.stop();
    }

    (globalThis as { PointerEvent?: typeof PointerEvent }).PointerEvent = originalPointerEvent;
    vi.useRealTimers();
  });

  it("replaces selection on click in replace mode", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };

    const { itemProps } = runSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
    });

    triggerMousePress(itemProps, ref.current);

    expect(manager.replaceSelection).toHaveBeenCalledWith("a");
  });

  it("toggles selection when ctrl-clicking", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };

    const { itemProps } = runSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
    });

    triggerMousePress(itemProps, ref.current, { ctrlKey: true });

    expect(manager.toggleSelection).toHaveBeenCalledWith("a");
  });

  it("selects on mousedown by default and does not reselection on click", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };

    const { itemProps } = runSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
    });

    triggerMouseDown(itemProps, ref.current);
    triggerClick(itemProps, ref.current);

    expect(manager.replaceSelection).toHaveBeenCalledTimes(1);
    expect(manager.replaceSelection).toHaveBeenCalledWith("a");
  });

  it("defers selection to click when shouldSelectOnPressUp is enabled", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };

    const { itemProps } = runSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      shouldSelectOnPressUp: true,
    });

    triggerMouseDown(itemProps, ref.current);
    expect(manager.replaceSelection).not.toHaveBeenCalled();

    triggerClick(itemProps, ref.current);

    expect(manager.replaceSelection).toHaveBeenCalledTimes(1);
    expect(manager.replaceSelection).toHaveBeenCalledWith("a");
  });

  it("selects on mouseup when press-up selection allows different press origin", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };

    const { itemProps } = runSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      shouldSelectOnPressUp: true,
      allowsDifferentPressOrigin: true,
    });

    expect(manager.replaceSelection).not.toHaveBeenCalled();

    triggerMouseUp(itemProps, ref.current);
    expect(manager.replaceSelection).toHaveBeenCalledTimes(1);
    expect(manager.replaceSelection).toHaveBeenCalledWith("a");

    triggerClick(itemProps, ref.current);
    expect(manager.replaceSelection).toHaveBeenCalledTimes(1);
  });

  it("toggles selection for touch/virtual pointer interactions", () => {
    installPointerEvent();
    const manager = createManager();
    const ref = { current: document.createElement("div") };

    const { itemProps } = runSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
    });

    triggerPointerPress(itemProps, ref.current, "touch");
    triggerPointerPress(itemProps, ref.current, "virtual");

    expect(manager.toggleSelection).toHaveBeenCalledTimes(2);
    expect(manager.toggleSelection).toHaveBeenNthCalledWith(1, "a");
    expect(manager.toggleSelection).toHaveBeenNthCalledWith(2, "a");
  });

  it.each(["touch", "virtual"] as const)(
    "uses toggle mode across items for %s pointer interactions in replace behavior",
    (pointerType) => {
      installPointerEvent();
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
      const first = runSelectableItem({
        selectionManager: manager,
        key: "i1",
        ref: firstRef,
      });
      const third = runSelectableItem({
        selectionManager: manager,
        key: "i3",
        ref: thirdRef,
      });

      triggerPointerPress(first.itemProps, firstRef.current, pointerType);
      triggerPointerPress(third.itemProps, thirdRef.current, pointerType);

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

    const { itemProps, hasAction } = runSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      onAction,
    });

    expect(hasAction).toBe(true);

    triggerMousePress(itemProps, ref.current);

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

    const { itemProps } = runSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      linkBehavior: "selection",
    });

    triggerMousePress(itemProps, ref.current);

    expect(open).toHaveBeenCalledWith(ref.current, expect.anything(), "/docs", { source: "test" });
    expect(manager.setSelectedKeys).toHaveBeenCalledWith(selectedKeys);
    expect(manager.replaceSelection).not.toHaveBeenCalled();
    expect(manager.toggleSelection).not.toHaveBeenCalled();
  });

  it("opens link without selection when link behavior is override", () => {
    const manager = createManager({
      isLink: vi.fn(() => true),
      getItemProps: vi.fn(() => ({ href: "/docs", routerOptions: { source: "test" } })),
    });
    const ref = { current: document.createElement("a") };

    const { itemProps } = runSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      linkBehavior: "override",
    });

    triggerMousePress(itemProps, ref.current);

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

    const { itemProps } = runSelectableItem({
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

  it("does not prevent native link click when openLink is already opening", () => {
    const manager = createManager({
      isLink: vi.fn(() => true),
      getItemProps: vi.fn(() => ({ href: "/docs" })),
    });
    const ref = { current: document.createElement("a") };

    const { itemProps } = runSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
    });

    openLink.isOpening = true;
    const onClick = itemProps.onClick as (event: MouseEvent) => void;
    const event = {
      shiftKey: false,
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      preventDefault: vi.fn(),
    } as unknown as MouseEvent;
    onClick(event);

    expect((event.preventDefault as any).mock.calls.length).toBe(0);
  });

  it("does nothing for link selection when link behavior is none", () => {
    const manager = createManager({
      isLink: vi.fn(() => true),
    });
    const ref = { current: document.createElement("a") };

    const { itemProps } = runSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      linkBehavior: "none",
    });

    triggerMousePress(itemProps, ref.current);

    expect(open).not.toHaveBeenCalled();
    expect(manager.replaceSelection).not.toHaveBeenCalled();
    expect(manager.toggleSelection).not.toHaveBeenCalled();
    expect(manager.extendSelection).not.toHaveBeenCalled();
  });

  it("handles Enter and Space keyboard selection paths", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };

    const { itemProps } = runSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
    });

    triggerKeyPress(itemProps, ref.current, "Enter");
    triggerKeyPress(itemProps, ref.current, " ");

    expect(manager.replaceSelection).toHaveBeenCalledTimes(2);
    expect(manager.replaceSelection).toHaveBeenNthCalledWith(1, "a");
    expect(manager.replaceSelection).toHaveBeenNthCalledWith(2, "a");
  });

  it("runs secondary action on Enter and double click in replace selection mode", () => {
    const onAction = vi.fn();
    const manager = createManager({
      selectionBehavior: "replace",
      canSelectItem: vi.fn(() => true),
    });
    const ref = { current: document.createElement("div") };

    const { itemProps, hasAction } = runSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      onAction,
    });

    expect(hasAction).toBe(true);

    triggerKeyPress(itemProps, ref.current, "Enter");

    const onDoubleClick = itemProps.onDoubleClick as (event: MouseEvent) => void;
    triggerMouseDown(itemProps, ref.current);
    onDoubleClick(new MouseEvent("dblclick", { bubbles: true }));

    expect(onAction).toHaveBeenCalledTimes(2);
    expect(manager.replaceSelection).toHaveBeenCalledTimes(1);
  });

  it("runs secondary double-click action only for mouse modality", () => {
    installPointerEvent();
    const onAction = vi.fn();
    const manager = createManager({
      selectionBehavior: "replace",
      canSelectItem: vi.fn(() => true),
    });
    const ref = { current: document.createElement("div") };

    const { itemProps } = runSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      onAction,
    });

    triggerPointerPress(itemProps, ref.current, "touch");
    onAction.mockClear();

    const onDoubleClick = itemProps.onDoubleClick as (event: MouseEvent) => void;
    onDoubleClick(new MouseEvent("dblclick", { bubbles: true }));
    expect(onAction).toHaveBeenCalledTimes(0);

    triggerPointerDown(itemProps, ref.current, "mouse");
    onDoubleClick(new MouseEvent("dblclick", { bubbles: true }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("forces action behavior when UNSTABLE_itemBehavior is action", () => {
    const onAction = vi.fn();
    const manager = createManager({
      selectionBehavior: "replace",
    });
    const ref = { current: document.createElement("div") };

    const { itemProps, allowsSelection, hasAction } = runSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      onAction,
      UNSTABLE_itemBehavior: "action",
    });

    expect(allowsSelection).toBe(false);
    expect(hasAction).toBe(true);

    triggerMousePress(itemProps, ref.current);

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

    const { itemProps } = runSelectableItem({
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

    runSelectableItem({
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

    const { itemProps } = runSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      shouldUseVirtualFocus: true,
    });

    triggerMouseDown(itemProps, ref.current);

    expect(manager.setFocused).toHaveBeenCalledWith(true);
    expect(manager.setFocusedKey).toHaveBeenCalledWith("a");
  });

  it("prevents mousedown focus transfer when virtual focus is enabled", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };

    const { itemProps } = runSelectableItem({
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

    const first = runSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      id: "custom-item-id",
    });
    const second = runSelectableItem({
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

  it("chains collection-provided event handlers with local item handlers", () => {
    const onCollectionClick = vi.fn();
    const onCollectionKeydown = vi.fn();
    const onCollectionMousedown = vi.fn();
    const manager = createManager({
      getItemProps: vi.fn(() => ({
        onClick: onCollectionClick,
        onKeydown: onCollectionKeydown,
        onMousedown: onCollectionMousedown,
      })),
    });
    const ref = { current: document.createElement("div") };

    const { itemProps } = runSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
    });

    triggerMousePress(itemProps, ref.current);
    triggerKeyPress(itemProps, ref.current, " ");

    expect(onCollectionMousedown).toHaveBeenCalledTimes(1);
    expect(onCollectionClick).toHaveBeenCalledTimes(1);
    expect(onCollectionKeydown).toHaveBeenCalledTimes(1);
    expect(manager.replaceSelection).toHaveBeenCalledTimes(2);
  });

  it("switches to toggle selection behavior on touch long press", () => {
    vi.useFakeTimers();
    installPointerEvent();
    const manager = createManager({
      selectionBehavior: "replace",
      canSelectItem: vi.fn(() => true),
    });
    const ref = { current: document.createElement("div") };

    const { itemProps } = runSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      onAction: vi.fn(),
    });

    triggerPointerDown(itemProps, ref.current, "touch");

    vi.advanceTimersByTime(500);

    expect(manager.toggleSelection).toHaveBeenCalledWith("a");
    expect(manager.setSelectionBehavior).toHaveBeenCalledWith("toggle");
    expect(manager.replaceSelection).not.toHaveBeenCalled();

    triggerClick(itemProps, ref.current, { pointerType: "touch" });
    expect(manager.replaceSelection).not.toHaveBeenCalled();
  });

  it("cancels touch long press when touch ends before threshold", () => {
    vi.useFakeTimers();
    installPointerEvent();
    const manager = createManager({
      selectionBehavior: "replace",
      canSelectItem: vi.fn(() => true),
    });
    const ref = { current: document.createElement("div") };

    const { itemProps } = runSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      onAction: vi.fn(),
    });

    triggerPointerDown(itemProps, ref.current, "touch");
    triggerClick(itemProps, ref.current, { pointerType: "touch" });
    vi.advanceTimersByTime(500);

    expect(manager.toggleSelection).not.toHaveBeenCalled();
    expect(manager.setSelectionBehavior).not.toHaveBeenCalled();
  });

  it("prevents drag start after touch interaction when long-press selection is enabled", () => {
    installPointerEvent();
    const manager = createManager({
      selectionBehavior: "replace",
      canSelectItem: vi.fn(() => true),
    });
    const ref = { current: document.createElement("div") };

    const { itemProps } = runSelectableItem({
      selectionManager: manager,
      key: "a",
      ref,
      onAction: vi.fn(),
    });

    triggerPointerDown(itemProps, ref.current, "touch");

    const onDragstartCapture = itemProps.onDragstartCapture as (event: DragEvent) => void;
    const dragEvent = { preventDefault: vi.fn() } as unknown as DragEvent;
    onDragstartCapture(dragEvent);

    expect((dragEvent.preventDefault as any).mock.calls.length).toBe(1);
  });
});
