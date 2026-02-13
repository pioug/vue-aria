import { describe, expect, it } from "vitest";
import { BaseCollection, ItemNode } from "@vue-aria/collections";
import { SelectionManager } from "../src/SelectionManager";
import { useMultipleSelectionState } from "../src/useMultipleSelectionState";

function makeCollection() {
  const c = new BaseCollection<unknown>();
  const a = new ItemNode<unknown>("a") as any;
  const b = new ItemNode<unknown>("b") as any;
  const cNode = new ItemNode<unknown>("c") as any;

  a.nextKey = "b";
  b.prevKey = "a";
  b.nextKey = "c";
  cNode.prevKey = "b";

  c.addNode(a);
  c.addNode(b);
  c.addNode(cNode);
  c.commit("a", "c");

  return c;
}

describe("SelectionManager", () => {
  it("replaces and toggles selections", () => {
    const state = useMultipleSelectionState({ selectionMode: "multiple" });
    const manager = new SelectionManager(makeCollection() as any, state);

    manager.replaceSelection("a");
    expect(manager.selectedKeys.has("a")).toBe(true);

    manager.toggleSelection("a");
    expect(manager.selectedKeys.has("a")).toBe(false);
  });

  it("selects all and clears", () => {
    const state = useMultipleSelectionState({ selectionMode: "multiple" });
    const manager = new SelectionManager(makeCollection() as any, state);

    manager.selectAll();
    expect(manager.isSelectAll).toBe(true);

    manager.clearSelection();
    expect(manager.isEmpty).toBe(true);
  });
});
