import { describe, expect, it } from "vitest";
import { ListCollection } from "../src/ListCollection";

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

describe("ListCollection", () => {
  it("maps keys and traversal", () => {
    const collection = new ListCollection([node("a"), node("b"), node("c")]);

    expect(collection.getFirstKey()).toBe("a");
    expect(collection.getLastKey()).toBe("c");
    expect(collection.getKeyAfter("a")).toBe("b");
    expect(collection.getKeyBefore("c")).toBe("b");
    expect(collection.getItem("b")?.key).toBe("b");
  });
});
