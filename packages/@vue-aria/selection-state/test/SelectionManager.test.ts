import { describe, expect, it, vi } from "vitest";
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

  it("uses toggle selection for touch/virtual select interactions in replace mode", () => {
    const state = useMultipleSelectionState({
      selectionMode: "multiple",
      selectionBehavior: "replace",
    });
    const manager = new SelectionManager(makeCollection() as any, state);
    const toggleSelection = vi.spyOn(manager, "toggleSelection");
    const replaceSelection = vi.spyOn(manager, "replaceSelection");

    manager.select("a", { pointerType: "touch" });
    manager.select("b", { pointerType: "virtual" });

    expect(toggleSelection).toHaveBeenNthCalledWith(1, "a");
    expect(toggleSelection).toHaveBeenNthCalledWith(2, "b");
    expect(replaceSelection).not.toHaveBeenCalled();
    expect(manager.selectedKeys.has("a")).toBe(true);
    expect(manager.selectedKeys.has("b")).toBe(true);
    expect(manager.selectedKeys.size).toBe(2);
  });

  it("uses replace selection for mouse select interactions in replace mode", () => {
    const state = useMultipleSelectionState({
      selectionMode: "multiple",
      selectionBehavior: "replace",
    });
    const manager = new SelectionManager(makeCollection() as any, state);
    const toggleSelection = vi.spyOn(manager, "toggleSelection");
    const replaceSelection = vi.spyOn(manager, "replaceSelection");

    manager.select("a", { pointerType: "mouse" });
    manager.select("b", { pointerType: "mouse" });

    expect(toggleSelection).not.toHaveBeenCalled();
    expect(replaceSelection).toHaveBeenNthCalledWith(1, "a");
    expect(replaceSelection).toHaveBeenNthCalledWith(2, "b");
    expect(manager.selectedKeys.has("b")).toBe(true);
    expect(manager.selectedKeys.size).toBe(1);
  });

  it("reads disabled and link metadata from collection item props", () => {
    const collection = makeCollection() as any;
    collection.getItem("a").props = { href: "/docs" };
    collection.getItem("b").props = { isDisabled: true };

    const state = useMultipleSelectionState({
      selectionMode: "multiple",
      disabledKeys: ["c"],
      disabledBehavior: "all",
    });
    const manager = new SelectionManager(collection, state);

    expect(manager.isLink("a")).toBe(true);
    expect(manager.getItemProps("a")).toEqual({ href: "/docs" });
    expect(manager.isDisabled("b")).toBe(true);
    expect(manager.isDisabled("c")).toBe(true);
    expect(manager.canSelectItem("b")).toBe(false);
  });

  it("creates derived managers that share state and preserve options", () => {
    const state = useMultipleSelectionState({ selectionMode: "multiple" });
    const layoutDelegate = {
      getKeyRange: vi.fn(() => ["a", "b"]),
    };

    const manager = new SelectionManager(makeCollection() as any, state, {
      allowsCellSelection: true,
      layoutDelegate,
    });
    manager.replaceSelection("a");

    const derived = manager.withCollection(makeCollection() as any);
    derived.extendSelection("b");

    expect(derived.selectedKeys.has("a")).toBe(true);
    expect(derived.selectedKeys.has("b")).toBe(true);
    expect(layoutDelegate.getKeyRange).toHaveBeenCalled();
  });
});
