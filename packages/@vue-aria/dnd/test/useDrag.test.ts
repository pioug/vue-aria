import { describe, expect, it, vi } from "vitest";
import { useDrag } from "../src";
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
});
