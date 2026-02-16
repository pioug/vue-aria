import { describe, expect, it } from "vitest";
import { BaseCollection, ItemNode } from "../src/BaseCollection";

function item(key: string, text: string) {
  const node = new ItemNode<string>(key) as any;
  node.textValue = text;
  return node as ItemNode<string>;
}

describe("BaseCollection", () => {
  it("tracks item count and key navigation", () => {
    const c = new BaseCollection<string>();
    const a = item("a", "alpha") as any;
    const b = item("b", "beta") as any;
    const d = item("d", "delta") as any;

    a.nextKey = "b";
    b.prevKey = "a";
    b.nextKey = "d";
    d.prevKey = "b";

    c.addNode(a);
    c.addNode(b);
    c.addNode(d);
    c.commit("a", "d");

    expect(c.size).toBe(3);
    expect(c.getFirstKey()).toBe("a");
    expect(c.getLastKey()).toBe("d");
    expect(c.getKeyAfter("a")).toBe("b");
    expect(c.getKeyBefore("d")).toBe("b");
  });

  it("filters item nodes by text value", () => {
    const c = new BaseCollection<string>();
    const a = item("a", "apple") as any;
    const b = item("b", "banana") as any;

    a.nextKey = "b";
    b.prevKey = "a";

    c.addNode(a);
    c.addNode(b);
    c.commit("a", "b");

    const filtered = c.filter((text) => text.startsWith("a"));

    expect(filtered.size).toBe(1);
    expect(filtered.getFirstKey()).toBe("a");
    expect(filtered.getLastKey()).toBe("a");
  });
});
