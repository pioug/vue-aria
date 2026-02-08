import { afterEach, describe, expect, it } from "vitest";
import {
  beginDragging,
  endDragging,
  isVirtualDragging,
  useDragSession,
} from "../src/DragManager";

describe("DragManager", () => {
  afterEach(() => {
    endDragging();
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
});
