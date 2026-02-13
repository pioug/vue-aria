import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
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
});
