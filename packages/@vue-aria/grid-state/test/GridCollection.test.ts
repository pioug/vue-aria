import { describe, expect, it } from "vitest";
import { GridCollection, type GridNode } from "../src/GridCollection";

function cell(
  key: string,
  index: number,
  props: Record<string, unknown> = {}
): GridNode<unknown> {
  return {
    type: "cell",
    key,
    value: null,
    level: 1,
    hasChildNodes: false,
    childNodes: [],
    rendered: key,
    textValue: key,
    index,
    parentKey: null,
    prevKey: null,
    nextKey: null,
    firstChildKey: null,
    lastChildKey: null,
    props,
  };
}

describe("GridCollection", () => {
  it("builds row/cell key lookup and navigation links", () => {
    const collection = new GridCollection({
      columnCount: 2,
      items: [
        {
          type: "item",
          key: "row-1",
          childNodes: [cell("r1c1", 0), cell("r1c2", 1)],
        },
      ],
    });

    expect(collection.getFirstKey()).toBe("row-1");
    expect(collection.getItem("row-1")?.type).toBe("item");
    expect(collection.getItem("r1c1")?.nextKey).toBe("r1c2");
    expect(collection.getItem("r1c2")?.prevKey).toBe("r1c1");
    expect(collection.getItem("r1c1")?.parentKey).toBe("row-1");
  });

  it("computes colSpan-derived colIndex for rows with colSpan cells", () => {
    const collection = new GridCollection({
      columnCount: 3,
      items: [
        {
          type: "item",
          key: "row-1",
          childNodes: [
            cell("r1c1", 0, { colSpan: 2 }),
            cell("r1c2", 1),
          ],
        },
      ],
    });

    expect(collection.getItem("r1c1")?.colSpan).toBe(2);
    expect(collection.getItem("r1c1")?.colIndex).toBe(0);
    expect(collection.getItem("r1c2")?.colIndex).toBe(2);
  });
});
