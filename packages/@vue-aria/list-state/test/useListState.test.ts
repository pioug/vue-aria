import { effectScope } from "vue";
import { describe, expect, it } from "vitest";
import { useListState } from "../src/useListState";

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
});
