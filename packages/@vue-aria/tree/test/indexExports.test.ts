import { describe, expect, it } from "vitest";
import { useTree, useTreeItem } from "../src/index";
import { useTree as useTreeDirect } from "../src/useTree";
import { useTreeItem as useTreeItemDirect } from "../src/useTreeItem";

describe("@vue-aria/tree index exports", () => {
  it("re-exports tree hooks", () => {
    expect(useTree).toBe(useTreeDirect);
    expect(useTreeItem).toBe(useTreeItemDirect);
  });
});
