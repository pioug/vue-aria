import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSelectableItem } from "../src/useSelectableItem";
import type { Key, MultipleSelectionManager } from "@vue-aria/selection-state";

const open = vi.fn();

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
});
