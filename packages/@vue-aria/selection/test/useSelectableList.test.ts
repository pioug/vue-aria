import { describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { useSelectableList } from "../src/useSelectableList";
import type { Key, MultipleSelectionManager } from "@vue-aria/selection-state";

vi.mock("@vue-aria/i18n", async () => {
  return {
    useLocale: () => ref({ locale: "en-US", direction: "ltr" }),
    useCollator: () => new Intl.Collator("en-US", { usage: "search", sensitivity: "base" }),
  };
});

function createManager(): MultipleSelectionManager {
  const manager: MultipleSelectionManager = {
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
  };

  return manager;
}

describe("useSelectableList", () => {
  it("returns listProps and default keyboard delegate behavior", () => {
    const manager = createManager();
    const ref = { current: document.createElement("div") };
    const collection = {
      getItem: () => null,
      getFirstKey: () => "a",
      getLastKey: () => "b",
      getKeyBefore: () => null,
      getKeyAfter: () => null,
    };

    const scope = effectScope();
    const { listProps } = scope.run(() =>
      useSelectableList({
        selectionManager: manager,
        collection,
        disabledKeys: new Set<Key>(),
        ref,
      })
    )!;

    try {
      expect(listProps).toBeTruthy();
      expect(listProps.tabIndex).toBe(0);
      expect(typeof listProps.onKeydown).toBe("function");
    } finally {
      scope.stop();
    }
  });
});
