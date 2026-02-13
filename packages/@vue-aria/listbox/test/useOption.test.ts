import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { listData } from "../src/utils";
import { useOption } from "../src/useOption";
import type { ListState } from "../src/types";

function createCollection() {
  const keys = ["a", "b"];
  return {
    getItem(key: string) {
      return {
        key,
        index: keys.indexOf(key),
        props: {},
      } as any;
    },
    getFirstKey() {
      return keys[0];
    },
    getLastKey() {
      return keys[keys.length - 1];
    },
    getKeyBefore(key: string) {
      const idx = keys.indexOf(key);
      return idx > 0 ? keys[idx - 1] : null;
    },
    getKeyAfter(key: string) {
      const idx = keys.indexOf(key);
      return idx >= 0 && idx < keys.length - 1 ? keys[idx + 1] : null;
    },
  };
}

function createManager() {
  const collection = createCollection();
  return {
    selectionMode: "multiple",
    selectionBehavior: "toggle",
    disallowEmptySelection: false,
    selectedKeys: new Set<string>(["a"]),
    isEmpty: false,
    isSelectAll: false,
    firstSelectedKey: "a",
    lastSelectedKey: "a",
    disabledKeys: new Set<string>(),
    disabledBehavior: "all",
    isFocused: true,
    focusedKey: "a",
    collection,
    isSelected: (key: string) => key === "a",
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

describe("useOption", () => {
  it("returns option props with virtualized metadata", () => {
    const manager = createManager();
    const state: ListState<unknown> = {
      collection: manager.collection,
      disabledKeys: new Set(),
      selectionManager: manager,
    };

    listData.set(state as ListState<unknown>, {
      id: "list-id",
      isVirtualized: true,
      shouldUseVirtualFocus: false,
      shouldSelectOnPressUp: false,
      shouldFocusOnHover: false,
      linkBehavior: "override",
    });

    const ref = { current: document.createElement("div") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const scope = effectScope();
    let optionProps: Record<string, unknown> = {};
    scope.run(() => {
      ({ optionProps } = useOption({ key: "a" }, state, ref));
    });

    expect(optionProps.role).toBe("option");
    expect(optionProps["aria-selected"]).toBe(true);
    expect(optionProps["aria-posinset"]).toBe(1);
    expect(optionProps["aria-setsize"]).toBe(2);
    expect(optionProps.id).toBe("list-id-option-a");

    scope.stop();
    ref.current?.remove();
  });
});
