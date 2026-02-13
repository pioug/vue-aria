import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { UNSTABLE_useFilteredListState, useListState } from "../src/useListState";

function node(key: string) {
  return {
    type: "item",
    key,
    value: null,
    level: 0,
    hasChildNodes: false,
    rendered: key,
    textValue: key,
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
  } as any;
}

describe("useListState", () => {
  it("creates list state with selection manager", () => {
    const scope = effectScope();
    let state: any = null;

    scope.run(() => {
      state = useListState({
        items: [node("a"), node("b")],
        selectionMode: "multiple",
      });
    });

    expect(state?.collection.getFirstKey()).toBe("a");
    expect(state?.disabledKeys.size).toBe(0);
    expect(state?.selectionManager.selectionMode).toBe("multiple");

    scope.stop();
  });

  it("filters state collection with UNSTABLE_useFilteredListState", () => {
    const scope = effectScope();
    let state: any = null;
    let filtered: any = null;

    scope.run(() => {
      state = useListState({
        items: [node("apple"), node("banana"), node("pear")],
        selectionMode: "multiple",
      });
      filtered = UNSTABLE_useFilteredListState(
        state,
        (textValue) => textValue.endsWith("a")
      );
    });

    expect(filtered.collection.getItem("banana")?.key).toBe("banana");
    expect(filtered.collection.getItem("apple")).toBeNull();
    expect(filtered.collection.getItem("pear")).toBeNull();

    scope.stop();
  });

  it("builds collection nodes from plain items with key/text extractors", () => {
    const scope = effectScope();
    let state: any = null;

    scope.run(() => {
      state = useListState({
        items: [
          { id: "k-1", label: "Alpha" },
          { id: "k-2", label: "Beta" },
        ],
        getKey: (item) => item.id,
        getTextValue: (item) => item.label.toUpperCase(),
        selectionMode: "multiple",
      });
    });

    expect(state?.collection.getFirstKey()).toBe("k-1");
    expect(state?.collection.getItem("k-2")?.textValue).toBe("BETA");
    expect(state?.collection.getItem("k-1")?.value).toEqual({ id: "k-1", label: "Alpha" });

    scope.stop();
  });
});
