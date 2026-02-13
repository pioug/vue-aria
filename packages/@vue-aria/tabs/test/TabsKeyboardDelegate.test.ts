import { describe, expect, it } from "vitest";
import type { Key } from "@vue-aria/collections";
import { TabsKeyboardDelegate } from "../src/TabsKeyboardDelegate";

function createCollection(
  keys: Key[],
  itemDisabledKeys: Set<Key> = new Set()
) {
  return {
    getFirstKey: () => keys[0] ?? null,
    getLastKey: () => keys[keys.length - 1] ?? null,
    getKeyAfter(key: Key) {
      const index = keys.indexOf(key);
      return index >= 0 && index < keys.length - 1 ? keys[index + 1] : null;
    },
    getKeyBefore(key: Key) {
      const index = keys.indexOf(key);
      return index > 0 ? keys[index - 1] : null;
    },
    getItem(key: Key) {
      return {
        props: {
          isDisabled: itemDisabledKeys.has(key),
        },
      };
    },
  };
}

describe("TabsKeyboardDelegate", () => {
  it("navigates and wraps in horizontal ltr mode", () => {
    const collection = createCollection(["a", "b", "c"]);
    const delegate = new TabsKeyboardDelegate(
      collection,
      "ltr",
      "horizontal",
      new Set()
    );

    expect(delegate.getKeyRightOf("a")).toBe("b");
    expect(delegate.getKeyLeftOf("a")).toBe("c");
    expect(delegate.getKeyAbove("a")).toBeNull();
    expect(delegate.getKeyBelow("a")).toBeNull();
  });

  it("reverses left/right navigation in horizontal rtl mode", () => {
    const collection = createCollection(["a", "b", "c"]);
    const delegate = new TabsKeyboardDelegate(
      collection,
      "rtl",
      "horizontal",
      new Set()
    );

    expect(delegate.getKeyRightOf("a")).toBe("c");
    expect(delegate.getKeyLeftOf("a")).toBe("b");
  });

  it("skips disabled tabs from disabledKeys and item props", () => {
    const collection = createCollection(["a", "b", "c", "d"], new Set<Key>(["d"]));
    const delegate = new TabsKeyboardDelegate(
      collection,
      "ltr",
      "horizontal",
      new Set<Key>(["b"])
    );

    expect(delegate.getFirstKey()).toBe("a");
    expect(delegate.getLastKey()).toBe("c");
    expect(delegate.getNextKey("a")).toBe("c");
    expect(delegate.getPreviousKey("c")).toBe("a");
  });

  it("uses up/down navigation in vertical mode", () => {
    const collection = createCollection(["a", "b", "c"]);
    const delegate = new TabsKeyboardDelegate(
      collection,
      "ltr",
      "vertical",
      new Set()
    );

    expect(delegate.getKeyBelow("a")).toBe("b");
    expect(delegate.getKeyAbove("b")).toBe("a");
    expect(delegate.getKeyRightOf("a")).toBe("b");
    expect(delegate.getKeyLeftOf("b")).toBe("a");
  });
});
