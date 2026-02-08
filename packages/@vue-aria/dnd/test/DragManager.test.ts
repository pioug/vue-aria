import { afterEach, describe, expect, it } from "vitest";
import {
  beginDragging,
  endDragging,
  getRegisteredDropItems,
  getRegisteredDropTargets,
  isVirtualDragging,
  registerDropItem,
  registerDropTarget,
  useDragSession,
} from "../src/DragManager";

describe("DragManager", () => {
  afterEach(() => {
    endDragging();
    (getRegisteredDropTargets() as Map<HTMLElement, unknown>).clear();
    (getRegisteredDropItems() as Map<HTMLElement, unknown>).clear();
  });

  it("tracks virtual dragging state", () => {
    const session = useDragSession();

    expect(session.value).toBeNull();
    expect(isVirtualDragging()).toBe(false);

    beginDragging({ id: "drag-1" });

    expect(isVirtualDragging()).toBe(true);
    expect(session.value).toEqual({ id: "drag-1" });

    endDragging();

    expect(isVirtualDragging()).toBe(false);
    expect(session.value).toBeNull();
  });

  it("registers and unregisters drop targets", () => {
    const element = document.createElement("div");

    const unregister = registerDropTarget({
      element,
      preventFocusOnDrop: true,
      getDropOperation: () => "copy",
    });

    expect(getRegisteredDropTargets().get(element)).toEqual({
      element,
      preventFocusOnDrop: true,
      getDropOperation: expect.any(Function),
    });

    unregister();
    expect(getRegisteredDropTargets().has(element)).toBe(false);
  });

  it("registers and unregisters drop items", () => {
    const element = document.createElement("div");

    const unregister = registerDropItem({
      element,
      target: {
        type: "root",
      },
      getDropOperation: () => "move",
    });

    expect(getRegisteredDropItems().get(element)).toEqual({
      element,
      target: {
        type: "root",
      },
      getDropOperation: expect.any(Function),
    });

    unregister();
    expect(getRegisteredDropItems().has(element)).toBe(false);
  });
});
