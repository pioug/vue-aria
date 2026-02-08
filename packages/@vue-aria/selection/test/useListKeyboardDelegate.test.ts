import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { useListKeyboardDelegate } from "../src";

const items = [
  { key: "a", textValue: "Apple" },
  { key: "b", textValue: "Banana", isDisabled: true },
  { key: "c", textValue: "Cherry" },
];

describe("useListKeyboardDelegate", () => {
  it("navigates around disabled keys vertically", () => {
    const delegate = useListKeyboardDelegate({
      collection: items,
    });

    expect(delegate.getFirstKey?.()).toBe("a");
    expect(delegate.getLastKey?.()).toBe("c");
    expect(delegate.getKeyBelow?.("a")).toBe("c");
    expect(delegate.getKeyAbove?.("c")).toBe("a");
  });

  it("supports horizontal navigation with rtl direction", () => {
    const delegate = useListKeyboardDelegate({
      collection: items,
      orientation: "horizontal",
      direction: "rtl",
    });

    expect(delegate.getKeyLeftOf?.("a")).toBe("c");
    expect(delegate.getKeyRightOf?.("c")).toBe("a");
    expect(delegate.getKeyAbove?.("a")).toBeNull();
  });

  it("supports typeahead search with dynamic collection", () => {
    const collection = ref([...items]);
    const delegate = useListKeyboardDelegate({
      collection,
    });

    expect(delegate.getKeyForSearch?.("c")).toBe("c");
    expect(delegate.getKeyForSearch?.("b")).toBeNull();

    collection.value = [
      { key: "d", textValue: "Date" },
      { key: "e", textValue: "Elderberry" },
    ];

    expect(delegate.getFirstKey?.()).toBe("d");
    expect(delegate.getKeyForSearch?.("e")).toBe("e");
  });
});
