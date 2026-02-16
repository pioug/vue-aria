import { describe, expect, it } from "vitest";
import {
  DIRECTORY_DRAG_TYPE,
  isDirectoryDropItem,
  isFileDropItem,
  isTextDropItem,
  isSetEqual,
  ListDropTargetDelegate,
  useClipboard,
  useDrop,
  useDropIndicator,
  useDraggableCollection,
  useDraggableItem,
  useDrag,
  useDroppableCollection,
  useDroppableItem,
} from "../src";

describe("Dnd", () => {
  it("re-exports core dnd hooks and helpers", () => {
    expect(typeof DIRECTORY_DRAG_TYPE).toBe("symbol");
    expect(typeof isDirectoryDropItem).toBe("function");
    expect(typeof isFileDropItem).toBe("function");
    expect(typeof isTextDropItem).toBe("function");
    expect(typeof isSetEqual).toBe("function");
    expect(typeof ListDropTargetDelegate).toBe("function");
    expect(typeof useClipboard).toBe("function");
    expect(typeof useDrop).toBe("function");
    expect(typeof useDropIndicator).toBe("function");
    expect(typeof useDraggableCollection).toBe("function");
    expect(typeof useDraggableItem).toBe("function");
    expect(typeof useDrag).toBe("function");
    expect(typeof useDroppableCollection).toBe("function");
    expect(typeof useDroppableItem).toBe("function");
  });
});
