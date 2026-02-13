import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { useListBox } from "../src/useListBox";
import type { ListState } from "../src/types";

function createCollection() {
  const keys = ["a", "b"] as const;
  return {
    getItem(key: string) {
      return { key, index: keys.indexOf(key as any), props: {} } as any;
    },
    getFirstKey() {
      return keys[0];
    },
    getLastKey() {
      return keys[keys.length - 1];
    },
    getKeyBefore(key: string) {
      const idx = keys.indexOf(key as any);
      return idx > 0 ? keys[idx - 1] : null;
    },
    getKeyAfter(key: string) {
      const idx = keys.indexOf(key as any);
      return idx >= 0 && idx < keys.length - 1 ? keys[idx + 1] : null;
    },
  };
}

function createManager(selectionMode: "single" | "multiple" = "single") {
  const collection = createCollection();
  return {
    selectionMode,
    selectionBehavior: "toggle",
    disallowEmptySelection: false,
    selectedKeys: new Set<string>(),
    isEmpty: true,
    isSelectAll: false,
    firstSelectedKey: null,
    lastSelectedKey: null,
    disabledKeys: new Set<string>(),
    disabledBehavior: "all",
    isFocused: false,
    focusedKey: null,
    collection,
    isSelected: () => false,
    isSelectionEqual: () => false,
    extendSelection: () => {},
    toggleSelection: () => {},
    replaceSelection: () => {},
    setSelectedKeys: () => {},
    selectAll: () => {},
    clearSelection: () => {},
    toggleSelectAll: () => {},
    select: () => {},
    canSelectItem: () => true,
    isDisabled: () => false,
    isLink: () => false,
    getItemProps: () => ({}),
    setFocused: () => {},
    setFocusedKey: () => {},
  } as any;
}

describe("useListBox", () => {
  it("returns listbox props and multiselectable for multiple mode", () => {
    const manager = createManager("multiple");
    const state: ListState<unknown> = {
      collection: manager.collection,
      disabledKeys: new Set(),
      selectionManager: manager,
    };

    const ref = { current: document.createElement("div") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const scope = effectScope();
    let listBoxProps: Record<string, unknown> = {};
    scope.run(() => {
      ({ listBoxProps } = useListBox({ "aria-label": "List" }, state, ref));
    });

    expect(listBoxProps.role).toBe("listbox");
    expect(listBoxProps["aria-multiselectable"]).toBe("true");

    scope.stop();
    ref.current?.remove();
  });
});
