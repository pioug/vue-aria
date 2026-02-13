import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import type { ListState } from "../src/types";

vi.mock("@vue-aria/utils", async () => {
  const actual = await vi.importActual<any>("@vue-aria/utils");
  return {
    ...actual,
    isMac: () => true,
    isWebKit: () => true,
  };
});

const { listData } = await import("../src/utils");
const { useOption } = await import("../src/useOption");

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

describe("useOption macOS webkit behavior", () => {
  it("omits aria label/description mappings", () => {
    const manager = createManager();
    const state: ListState<unknown> = {
      collection: manager.collection,
      disabledKeys: new Set(),
      selectionManager: manager,
    };

    listData.set(state as ListState<unknown>, {
      id: "list-id",
      linkBehavior: "override",
    });

    const ref = { current: document.createElement("div") as HTMLElement | null };
    document.body.appendChild(ref.current as HTMLElement);

    const scope = effectScope();
    let optionProps: Record<string, unknown> = {};
    scope.run(() => {
      ({ optionProps } = useOption({ key: "a", "aria-label": "Label A" }, state, ref));
    });

    expect(optionProps["aria-label"]).toBeUndefined();
    expect(optionProps["aria-labelledby"]).toBeUndefined();
    expect(optionProps["aria-describedby"]).toBeUndefined();

    scope.stop();
    ref.current?.remove();
  });
});
