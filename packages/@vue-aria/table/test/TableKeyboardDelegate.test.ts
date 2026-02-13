import { describe, expect, it } from "vitest";
import { TableKeyboardDelegate } from "../src/TableKeyboardDelegate";
import { createTableCollection } from "./helpers";

function createLayoutDelegate() {
  return {
    getItemRect: () => ({ x: 0, y: 0, width: 100, height: 30 }),
    getVisibleRect: () => ({ x: 0, y: 0, width: 300, height: 300 }),
    getContentSize: () => ({ width: 300, height: 300 }),
  };
}

function createDelegate() {
  const collection = createTableCollection();
  return new TableKeyboardDelegate({
    collection,
    disabledKeys: new Set(),
    direction: "ltr",
    collator: new Intl.Collator("en-US", { usage: "search", sensitivity: "base" }),
    layoutDelegate: createLayoutDelegate(),
    ref: { current: document.createElement("table") },
  });
}

describe("TableKeyboardDelegate", () => {
  it("moves from a column header down into the first row cell", () => {
    const delegate = createDelegate();

    expect(delegate.getKeyBelow("name")).toBe("row-1-name");
    expect(delegate.getKeyBelow("type")).toBe("row-1-type");
  });

  it("moves from a row cell up to the corresponding column header", () => {
    const delegate = createDelegate();

    expect(delegate.getKeyAbove("row-1-name")).toBe("name");
    expect(delegate.getKeyAbove("row-2-type")).toBe("row-1-type");
  });

  it("wraps horizontal navigation across header columns", () => {
    const delegate = createDelegate();

    expect(delegate.getKeyRightOf("type")).toBe("name");
    expect(delegate.getKeyLeftOf("name")).toBe("type");
  });

  it("searches by row header text and returns cell key when starting from cell", () => {
    const delegate = createDelegate();

    expect(delegate.getKeyForSearch("pi")).toBe("row-1");
    expect(delegate.getKeyForSearch("sq", "row-1-type")).toBe("row-2-name");
  });
});
