import { afterEach, describe, expect, it, vi } from "vitest";
import { useDrag } from "../src";
import { endDragging, isVirtualDragging } from "../src/DragManager";
import { setGlobalDropEffect } from "../src/utils";
import {
  DataTransferItemMock,
  DataTransferMock,
  DragEventMock,
} from "./mocks";

interface DragHandlers {
  draggable: boolean;
  onDragstart: (event: DragEvent) => void;
  onDrag: (event: DragEvent) => void;
  onDragend: (event: DragEvent) => void;
}

describe("useDrag", () => {
  afterEach(() => {
    endDragging();
    setGlobalDropEffect(undefined);
  });

  it("writes drag items and fires drag start callback", () => {
    const onDragStart = vi.fn();
    const { dragProps, isDragging } = useDrag({
      getItems: () => [
        {
          "text/plain": "hello world",
        },
      ],
      onDragStart,
    });

    const handlers = dragProps as unknown as DragHandlers;
    const dataTransfer = new DataTransferMock();
    handlers.onDragstart(
      new DragEventMock("dragstart", {
        dataTransfer,
        clientX: 10,
        clientY: 12,
      }) as unknown as DragEvent
    );

    expect(isDragging.value).toBe(true);
    expect([...dataTransfer.items]).toEqual([
      new DataTransferItemMock("text/plain", "hello world"),
    ]);
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragStart).toHaveBeenCalledWith({
      type: "dragstart",
      x: 10,
      y: 12,
    });
  });

  it("maps allowed drop operations to effectAllowed", () => {
    const { dragProps } = useDrag({
      getItems: () => [
        {
          "text/plain": "hello world",
        },
      ],
      getAllowedDropOperations: () => ["copy", "move"],
    });

    const handlers = dragProps as unknown as DragHandlers;
    const dataTransfer = new DataTransferMock();

    handlers.onDragstart(
      new DragEventMock("dragstart", {
        dataTransfer,
      }) as unknown as DragEvent
    );

    expect(dataTransfer.effectAllowed).toBe("copyMove");
  });

  it("fires drag move only when coordinates change", () => {
    const onDragMove = vi.fn();
    const { dragProps } = useDrag({
      getItems: () => [
        {
          "text/plain": "hello world",
        },
      ],
      onDragMove,
    });

    const handlers = dragProps as unknown as DragHandlers;
    const dataTransfer = new DataTransferMock();

    handlers.onDragstart(
      new DragEventMock("dragstart", {
        dataTransfer,
        clientX: 0,
        clientY: 0,
      }) as unknown as DragEvent
    );

    handlers.onDrag(
      new DragEventMock("drag", {
        dataTransfer,
        clientX: 0,
        clientY: 0,
      }) as unknown as DragEvent
    );
    handlers.onDrag(
      new DragEventMock("drag", {
        dataTransfer,
        clientX: 5,
        clientY: 3,
      }) as unknown as DragEvent
    );

    expect(onDragMove).toHaveBeenCalledTimes(1);
    expect(onDragMove).toHaveBeenCalledWith({
      type: "dragmove",
      x: 5,
      y: 3,
    });
  });

  it("maps dragend dropEffect to dropOperation", () => {
    const onDragEnd = vi.fn();
    const { dragProps, isDragging } = useDrag({
      getItems: () => [
        {
          "text/plain": "hello world",
        },
      ],
      onDragEnd,
    });

    const handlers = dragProps as unknown as DragHandlers;
    const dataTransfer = new DataTransferMock();

    handlers.onDragstart(
      new DragEventMock("dragstart", {
        dataTransfer,
        clientX: 1,
        clientY: 2,
      }) as unknown as DragEvent
    );

    dataTransfer.dropEffect = "copy";
    handlers.onDragend(
      new DragEventMock("dragend", {
        dataTransfer,
        clientX: 3,
        clientY: 4,
      }) as unknown as DragEvent
    );

    expect(isDragging.value).toBe(false);
    expect(onDragEnd).toHaveBeenCalledTimes(1);
    expect(onDragEnd).toHaveBeenCalledWith({
      type: "dragend",
      x: 3,
      y: 4,
      dropOperation: "copy",
    });
  });

  it("prefers global drop effect when ending native drag", () => {
    const onDragEnd = vi.fn();
    const { dragProps } = useDrag({
      getItems: () => [{ "text/plain": "hello world" }],
      onDragEnd,
    });

    const handlers = dragProps as unknown as DragHandlers;
    const dataTransfer = new DataTransferMock();
    handlers.onDragstart(
      new DragEventMock("dragstart", {
        dataTransfer,
        clientX: 1,
        clientY: 2,
      }) as unknown as DragEvent
    );

    dataTransfer.dropEffect = "none";
    setGlobalDropEffect("move");
    handlers.onDragend(
      new DragEventMock("dragend", {
        dataTransfer,
        clientX: 3,
        clientY: 4,
      }) as unknown as DragEvent
    );

    expect(onDragEnd).toHaveBeenCalledWith({
      type: "dragend",
      x: 3,
      y: 4,
      dropOperation: "move",
    });
  });

  it("does not start dragging when disabled", () => {
    const onDragStart = vi.fn();
    const { dragProps, isDragging } = useDrag({
      getItems: () => [
        {
          "text/plain": "hello world",
        },
      ],
      isDisabled: true,
      onDragStart,
    });

    const handlers = dragProps as unknown as DragHandlers;
    const dataTransfer = new DataTransferMock();
    const event = new DragEventMock("dragstart", {
      dataTransfer,
      clientX: 9,
      clientY: 9,
    }) as unknown as DragEvent;

    handlers.onDragstart(event);

    expect(event.defaultPrevented).toBe(true);
    expect(isDragging.value).toBe(false);
    expect(onDragStart).not.toHaveBeenCalled();
    expect([...dataTransfer.items]).toHaveLength(0);
  });

  it("moves handlers to dragButtonProps when hasDragButton is true", () => {
    const onDragStart = vi.fn();
    const { dragProps, dragButtonProps } = useDrag({
      getItems: () => [
        {
          "text/plain": "hello world",
        },
      ],
      hasDragButton: true,
      onDragStart,
    });

    expect((dragProps as Record<string, unknown>).onDragstart).toBeUndefined();

    const buttonHandlers = dragButtonProps as unknown as DragHandlers;
    expect(typeof buttonHandlers.onDragstart).toBe("function");

    const dataTransfer = new DataTransferMock();
    buttonHandlers.onDragstart(
      new DragEventMock("dragstart", {
        dataTransfer,
        clientX: 4,
        clientY: 6,
      }) as unknown as DragEvent
    );

    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragStart).toHaveBeenCalledWith({
      type: "dragstart",
      x: 4,
      y: 6,
    });
  });

  it("uses preview renderer to set drag image", () => {
    const previewElement = document.createElement("div");
    Object.defineProperty(previewElement, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        x: 0,
        y: 0,
        width: 20,
        height: 9,
        left: 0,
        top: 0,
        right: 20,
        bottom: 9,
        toJSON: () => ({}),
      }),
    });

    const currentTarget = document.createElement("div");
    Object.defineProperty(currentTarget, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        x: 0,
        y: 0,
        width: 40,
        height: 40,
        left: 0,
        top: 0,
        right: 40,
        bottom: 40,
        toJSON: () => ({}),
      }),
    });

    const preview = vi.fn((items, callback) => {
      expect(items).toEqual([
        {
          "text/plain": "hello world",
        },
      ]);
      callback(previewElement, 5, 6);
    });

    const { dragProps } = useDrag({
      getItems: () => [
        {
          "text/plain": "hello world",
        },
      ],
      preview,
    });

    const handlers = dragProps as unknown as DragHandlers;
    const dataTransfer = new DataTransferMock();
    const event = new DragEventMock("dragstart", {
      dataTransfer,
      clientX: 8,
      clientY: 7,
    }) as unknown as DragEvent;
    Object.defineProperty(event, "currentTarget", {
      configurable: true,
      value: currentTarget,
    });
    Object.defineProperty(event, "target", {
      configurable: true,
      value: currentTarget,
    });

    handlers.onDragstart(event);

    expect(preview).toHaveBeenCalledTimes(1);
    expect((dataTransfer as unknown as { dragImage?: { node: Element; x: number; y: number } }).dragImage).toEqual({
      node: previewElement,
      x: 5,
      y: 6,
    });
    expect(previewElement.style.height).toBe("10px");
  });

  it("starts managed dragging from Enter key interactions", () => {
    const onDragStart = vi.fn();
    const onDragEnd = vi.fn();
    const { dragProps, isDragging } = useDrag({
      getItems: () => [{ "text/plain": "hello world" }],
      onDragStart,
      onDragEnd,
    });

    const target = document.createElement("button");
    document.body.appendChild(target);
    Object.defineProperty(target, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        x: 10,
        y: 20,
        left: 10,
        top: 20,
        width: 100,
        height: 40,
        right: 110,
        bottom: 60,
        toJSON: () => ({}),
      }),
    });

    const keydown = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
    Object.defineProperty(keydown, "target", { configurable: true, value: target });
    Object.defineProperty(keydown, "currentTarget", { configurable: true, value: target });
    const keyup = new KeyboardEvent("keyup", { key: "Enter", bubbles: true });
    Object.defineProperty(keyup, "target", { configurable: true, value: target });
    Object.defineProperty(keyup, "currentTarget", { configurable: true, value: target });

    const handlers = dragProps as Record<string, (event: KeyboardEvent) => void>;
    handlers.onKeydownCapture?.(keydown);
    handlers.onKeyupCapture?.(keyup);

    expect(onDragStart).toHaveBeenCalledWith({
      type: "dragstart",
      x: 60,
      y: 40,
    });
    expect(isDragging.value).toBe(true);
    expect(isVirtualDragging()).toBe(true);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onDragEnd).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "dragend",
        dropOperation: "cancel",
      })
    );
    expect(isDragging.value).toBe(false);
  });
});
