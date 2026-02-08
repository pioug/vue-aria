import { afterEach, describe, expect, it, vi } from "vitest";
import {
  beginDragging,
  endDragging,
  getRegisteredDropItems,
  getRegisteredDropTargets,
  isValidDropTarget,
  isVirtualDragging,
  registerDropItem,
  registerDropTarget,
  useDragSession,
} from "../src/DragManager";

function setRect(
  element: HTMLElement,
  rect: { x: number; y: number; width: number; height: number }
): void {
  Object.defineProperty(element, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      x: rect.x,
      y: rect.y,
      left: rect.x,
      top: rect.y,
      width: rect.width,
      height: rect.height,
      right: rect.x + rect.width,
      bottom: rect.y + rect.height,
      toJSON: () => ({}),
    }),
  });
}

function isA11yHidden(element: HTMLElement): boolean {
  return element.getAttribute("aria-hidden") === "true" || element.hasAttribute("inert");
}

describe("DragManager", () => {
  afterEach(() => {
    endDragging();
    (getRegisteredDropTargets() as Map<HTMLElement, unknown>).clear();
    (getRegisteredDropItems() as Map<HTMLElement, unknown>).clear();
    document.body.innerHTML = "";
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

  it("throws when starting a drag session while another is active", () => {
    beginDragging({ id: "drag-1" });
    expect(() => beginDragging({ id: "drag-2" })).toThrow(
      "Cannot begin dragging while already dragging"
    );
  });

  it("supports keyboard drop target navigation and dropping", () => {
    const dragElement = document.createElement("button");
    const firstTarget = document.createElement("button");
    const secondTarget = document.createElement("button");
    document.body.append(dragElement, firstTarget, secondTarget);
    setRect(dragElement, { x: 0, y: 0, width: 40, height: 20 });
    setRect(firstTarget, { x: 50, y: 0, width: 40, height: 20 });
    setRect(secondTarget, { x: 100, y: 0, width: 40, height: 20 });

    const onFirstEnter = vi.fn();
    const onFirstExit = vi.fn();
    const onSecondEnter = vi.fn();
    const onSecondDrop = vi.fn();
    const onDragEnd = vi.fn();

    registerDropTarget({
      element: firstTarget,
      onDropEnter: onFirstEnter,
      onDropExit: onFirstExit,
      getDropOperation: () => "copy",
    });

    registerDropTarget({
      element: secondTarget,
      onDropEnter: onSecondEnter,
      onDrop: onSecondDrop,
      getDropOperation: () => "copy",
    });

    beginDragging({
      dragTarget: {
        element: dragElement,
        items: [{ "text/plain": "hello" }],
        allowedDropOperations: ["copy", "move"],
        onDragEnd,
      },
    });

    expect(onFirstEnter).toHaveBeenCalledTimes(1);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    expect(onFirstExit).toHaveBeenCalledTimes(1);
    expect(onSecondEnter).toHaveBeenCalledTimes(1);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    expect(onSecondDrop).toHaveBeenCalledTimes(1);
    expect(onSecondDrop).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "drop",
        dropOperation: "copy",
      }),
      null
    );
    expect(onDragEnd).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "dragend",
        dropOperation: "copy",
      })
    );
    expect(isVirtualDragging()).toBe(false);
  });

  it("cancels a managed drag session on Escape", () => {
    const dragElement = document.createElement("button");
    document.body.append(dragElement);
    setRect(dragElement, { x: 0, y: 0, width: 40, height: 20 });

    const onDragEnd = vi.fn();
    beginDragging({
      dragTarget: {
        element: dragElement,
        items: [{ "text/plain": "hello" }],
        allowedDropOperations: ["copy"],
        onDragEnd,
      },
    });

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

    expect(onDragEnd).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "dragend",
        dropOperation: "cancel",
      })
    );
    expect(isVirtualDragging()).toBe(false);
  });

  it("reports whether an element is inside a registered drop target", () => {
    const container = document.createElement("div");
    const child = document.createElement("span");
    container.append(child);
    document.body.append(container);

    const unregister = registerDropTarget({
      element: container,
      getDropOperation: () => "copy",
    });

    expect(isValidDropTarget(container)).toBe(true);
    expect(isValidDropTarget(child)).toBe(true);
    expect(isValidDropTarget(document.createElement("div"))).toBe(false);

    unregister();
  });

  it("uses registered drop items as active targets when available", () => {
    const dragElement = document.createElement("button");
    const dropElement = document.createElement("button");
    const dropItemElement = document.createElement("button");
    dropElement.append(dropItemElement);
    document.body.append(dragElement, dropElement);
    setRect(dragElement, { x: 0, y: 0, width: 40, height: 20 });
    setRect(dropElement, { x: 50, y: 0, width: 40, height: 20 });
    setRect(dropItemElement, { x: 55, y: 2, width: 36, height: 16 });

    const onDropTargetEnter = vi.fn();
    const onDrop = vi.fn();
    const onDragEnd = vi.fn();

    registerDropTarget({
      element: dropElement,
      onDropTargetEnter,
      onDrop,
      getDropOperation: () => "copy",
    });

    registerDropItem({
      element: dropItemElement,
      target: { type: "item", key: "a", dropPosition: "on" },
      getDropOperation: () => "copy",
    });

    beginDragging({
      dragTarget: {
        element: dragElement,
        items: [{ "text/plain": "hello" }],
        allowedDropOperations: ["copy"],
        onDragEnd,
      },
    });

    expect(onDropTargetEnter).toHaveBeenCalledWith({
      type: "item",
      key: "a",
      dropPosition: "on",
    });

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    expect(onDrop).toHaveBeenCalledWith(
      expect.objectContaining({ type: "drop", dropOperation: "copy" }),
      { type: "item", key: "a", dropPosition: "on" }
    );
    expect(onDragEnd).toHaveBeenCalledWith(
      expect.objectContaining({ dropOperation: "copy" })
    );
  });

  it("supports activating the current drop target with Alt+Enter", () => {
    const dragElement = document.createElement("button");
    const dropElement = document.createElement("button");
    const activateButton = document.createElement("button");
    dropElement.append(activateButton);
    document.body.append(dragElement, dropElement);
    setRect(dragElement, { x: 0, y: 0, width: 40, height: 20 });
    setRect(dropElement, { x: 50, y: 0, width: 40, height: 20 });
    setRect(activateButton, { x: 55, y: 2, width: 36, height: 16 });

    const onDropActivate = vi.fn();
    const onDrop = vi.fn();
    const onDragEnd = vi.fn();

    registerDropTarget({
      element: dropElement,
      activateButtonRef: activateButton,
      onDropActivate,
      onDrop,
      getDropOperation: () => "copy",
    });

    beginDragging({
      dragTarget: {
        element: dragElement,
        items: [{ "text/plain": "hello" }],
        allowedDropOperations: ["copy"],
        onDragEnd,
      },
    });

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", altKey: true, bubbles: true })
    );

    expect(onDropActivate).toHaveBeenCalledTimes(1);
    expect(onDrop).not.toHaveBeenCalled();
    expect(isVirtualDragging()).toBe(true);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onDragEnd).toHaveBeenCalledWith(
      expect.objectContaining({ dropOperation: "copy" })
    );
    expect(isVirtualDragging()).toBe(false);
  });

  it("hides non-drop content from screen readers during managed dragging", () => {
    const dragElement = document.createElement("button");
    const dropElement = document.createElement("button");
    const otherElement = document.createElement("div");
    document.body.append(dragElement, dropElement, otherElement);
    setRect(dragElement, { x: 0, y: 0, width: 40, height: 20 });
    setRect(dropElement, { x: 50, y: 0, width: 40, height: 20 });

    registerDropTarget({
      element: dropElement,
      getDropOperation: () => "copy",
    });

    beginDragging({
      dragTarget: {
        element: dragElement,
        items: [{ "text/plain": "hello" }],
        allowedDropOperations: ["copy"],
      },
    });

    expect(isA11yHidden(otherElement)).toBe(true);
    expect(isA11yHidden(dropElement)).toBe(false);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

    expect(isA11yHidden(otherElement)).toBe(false);
  });
});
