import { describe, expect, it } from "vitest";
import { getScrollParents } from "../src/getScrollParents";

describe("getScrollParents", () => {
  it("collects scrollable ancestors", () => {
    const root = document.createElement("div");
    root.style.overflow = "auto";

    const parent = document.createElement("div");
    parent.style.overflowY = "scroll";

    const child = document.createElement("div");

    root.appendChild(parent);
    parent.appendChild(child);
    document.body.appendChild(root);

    const parents = getScrollParents(child);

    expect(parents).toEqual([parent, root]);

    root.remove();
  });
});
