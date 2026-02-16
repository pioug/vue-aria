import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useSingleSelectListState } from "../src/useSingleSelectListState";

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

describe("useSingleSelectListState", () => {
  it("tracks selected key and selected item", () => {
    const scope = effectScope();
    let state: any = null;

    scope.run(() => {
      state = useSingleSelectListState({
        defaultSelectedKey: "a",
        items: [node("a"), node("b")],
      });
    });

    expect(state?.selectedKey).toBe("a");
    expect(state?.selectedItem?.key).toBe("a");

    state?.setSelectedKey("b");
    expect(state?.selectedKey).toBe("b");

    scope.stop();
  });

  it("fires onSelectionChange when replacing with the same key", () => {
    const onSelectionChange = vi.fn();
    const scope = effectScope();
    let state: any = null;

    scope.run(() => {
      state = useSingleSelectListState({
        selectedKey: "a",
        onSelectionChange,
        items: [node("a"), node("b")],
      });
    });

    state.selectionManager.replaceSelection("a");
    expect(onSelectionChange).toHaveBeenCalledWith("a");

    scope.stop();
  });

  it("supports plain items with extractor functions", () => {
    const scope = effectScope();
    let state: any = null;

    scope.run(() => {
      state = useSingleSelectListState({
        defaultSelectedKey: "2",
        items: [
          { code: "1", label: "One" },
          { code: "2", label: "Two" },
        ],
        getKey: (item) => item.code,
        getTextValue: (item) => item.label,
      });
    });

    expect(state?.selectedKey).toBe("2");
    expect(state?.selectedItem?.textValue).toBe("Two");

    scope.stop();
  });
});
