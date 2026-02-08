import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useDrop } from "../src";
import {
  DataTransferItemMock,
  DataTransferMock,
  DragEventMock,
} from "./mocks";

interface DropHandlers {
  onDragenter: (event: DragEvent) => void;
  onDragover: (event: DragEvent) => void;
  onDragleave: (event: DragEvent) => void;
  onDrop: (event: DragEvent) => void;
}

function setupTarget(): HTMLElement {
  const target = document.createElement("div");
  document.body.appendChild(target);
  Object.defineProperty(target, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      left: 0,
      top: 0,
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      right: 100,
      bottom: 50,
      toJSON: () => ({}),
    }),
  });
  return target;
}

describe("useDrop", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("performs basic drop lifecycle", async () => {
    const target = setupTarget();
    const onDropEnter = vi.fn();
    const onDropMove = vi.fn();
    const onDrop = vi.fn();

    const { dropProps, isDropTarget } = useDrop({
      ref: ref(target),
      onDropEnter,
      onDropMove,
      onDrop,
    });

    const handlers = dropProps as unknown as DropHandlers;
    const dataTransfer = new DataTransferMock();
    dataTransfer.items.add("hello world", "text/plain");

    handlers.onDragenter(
      new DragEventMock("dragenter", {
        dataTransfer,
        clientX: 1,
        clientY: 1,
      }) as unknown as DragEvent
    );

    expect(isDropTarget.value).toBe(true);
    expect(dataTransfer.dropEffect).toBe("move");
    expect(onDropEnter).toHaveBeenCalledTimes(1);
    expect(onDropEnter).toHaveBeenCalledWith({
      type: "dropenter",
      x: 1,
      y: 1,
    });

    handlers.onDragover(
      new DragEventMock("dragover", {
        dataTransfer,
        clientX: 2,
        clientY: 2,
      }) as unknown as DragEvent
    );

    expect(onDropMove).toHaveBeenCalledTimes(1);
    expect(onDropMove).toHaveBeenCalledWith({
      type: "dropmove",
      x: 2,
      y: 2,
    });

    handlers.onDrop(
      new DragEventMock("drop", {
        dataTransfer,
        clientX: 2,
        clientY: 2,
      }) as unknown as DragEvent
    );

    expect(isDropTarget.value).toBe(false);
    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onDrop).toHaveBeenCalledWith([
      expect.objectContaining({
        type: "drop",
        x: 2,
        y: 2,
        dropOperation: "move",
        items: [
          {
            kind: "text",
            types: new Set(["text/plain"]),
            getText: expect.any(Function),
          },
        ],
      }),
    ][0]);

    expect(await onDrop.mock.calls[0]?.[0].items[0].getText("text/plain")).toBe(
      "hello world"
    );
  });

  it("supports disabled drop targets", () => {
    const target = setupTarget();
    const onDropEnter = vi.fn();

    const { dropProps, isDropTarget } = useDrop({
      ref: ref(target),
      isDisabled: true,
      onDropEnter,
    });

    const handlers = dropProps as unknown as DropHandlers;
    const dataTransfer = new DataTransferMock();

    handlers.onDragenter(
      new DragEventMock("dragenter", { dataTransfer }) as unknown as DragEvent
    );

    expect(isDropTarget.value).toBe(false);
    expect(onDropEnter).not.toHaveBeenCalled();
  });

  it("fires drop move only when coordinates change", () => {
    const target = setupTarget();
    const onDropMove = vi.fn();

    const { dropProps } = useDrop({
      ref: ref(target),
      onDropMove,
    });

    const handlers = dropProps as unknown as DropHandlers;
    const dataTransfer = new DataTransferMock();

    handlers.onDragenter(
      new DragEventMock("dragenter", {
        dataTransfer,
        clientX: 1,
        clientY: 1,
      }) as unknown as DragEvent
    );

    handlers.onDragover(
      new DragEventMock("dragover", {
        dataTransfer,
        clientX: 1,
        clientY: 1,
      }) as unknown as DragEvent
    );

    handlers.onDragover(
      new DragEventMock("dragover", {
        dataTransfer,
        clientX: 2,
        clientY: 2,
      }) as unknown as DragEvent
    );

    expect(onDropMove).toHaveBeenCalledTimes(1);
  });

  it("fires drop exit on leave and drop", () => {
    const target = setupTarget();
    const onDropExit = vi.fn();

    const { dropProps } = useDrop({
      ref: ref(target),
      onDropExit,
    });

    const handlers = dropProps as unknown as DropHandlers;
    const dataTransfer = new DataTransferMock();

    handlers.onDragenter(
      new DragEventMock("dragenter", {
        dataTransfer,
        clientX: 1,
        clientY: 1,
      }) as unknown as DragEvent
    );

    handlers.onDragleave(
      new DragEventMock("dragleave", {
        dataTransfer,
        clientX: 2,
        clientY: 2,
      }) as unknown as DragEvent
    );

    expect(onDropExit).toHaveBeenCalledTimes(1);

    handlers.onDragenter(
      new DragEventMock("dragenter", {
        dataTransfer,
        clientX: 1,
        clientY: 1,
      }) as unknown as DragEvent
    );

    handlers.onDrop(
      new DragEventMock("drop", {
        dataTransfer,
        clientX: 2,
        clientY: 2,
      }) as unknown as DragEvent
    );

    expect(onDropExit).toHaveBeenCalledTimes(2);
  });

  it("respects getDropOperation and getDropOperationForPoint", () => {
    const target = setupTarget();

    const { dropProps } = useDrop({
      ref: ref(target),
      getDropOperation: () => "copy",
      getDropOperationForPoint: (_types, _allowed, x) => (x > 5 ? "link" : "copy"),
    });

    const handlers = dropProps as unknown as DropHandlers;
    const dataTransfer = new DataTransferMock();

    handlers.onDragenter(
      new DragEventMock("dragenter", {
        dataTransfer,
        clientX: 2,
        clientY: 2,
      }) as unknown as DragEvent
    );
    expect(dataTransfer.dropEffect).toBe("copy");

    handlers.onDragover(
      new DragEventMock("dragover", {
        dataTransfer,
        clientX: 8,
        clientY: 2,
      }) as unknown as DragEvent
    );
    expect(dataTransfer.dropEffect).toBe("link");
  });

  it("fires drop activate after timeout", () => {
    vi.useFakeTimers();
    const target = setupTarget();
    const onDropActivate = vi.fn();

    const { dropProps } = useDrop({
      ref: ref(target),
      onDropActivate,
    });

    const handlers = dropProps as unknown as DropHandlers;
    const dataTransfer = new DataTransferMock();

    handlers.onDragenter(
      new DragEventMock("dragenter", {
        dataTransfer,
        clientX: 1,
        clientY: 1,
      }) as unknown as DragEvent
    );

    handlers.onDragover(
      new DragEventMock("dragover", {
        dataTransfer,
        clientX: 2,
        clientY: 2,
      }) as unknown as DragEvent
    );

    vi.advanceTimersByTime(799);
    expect(onDropActivate).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onDropActivate).toHaveBeenCalledTimes(1);
    expect(onDropActivate).toHaveBeenCalledWith({
      type: "dropactivate",
      x: 2,
      y: 2,
    });
  });

  it("moves drag handlers to dropButtonProps when hasDropButton is true", () => {
    const target = setupTarget();

    const { dropProps, dropButtonProps } = useDrop({
      ref: ref(target),
      hasDropButton: true,
    });

    expect(typeof dropProps.onClick).toBe("function");
    expect((dropProps as Record<string, unknown>).onDragenter).toBeUndefined();
    expect(typeof dropButtonProps?.onDragenter).toBe("function");
    expect(typeof dropButtonProps?.onDrop).toBe("function");
  });

  it("reads custom drag payloads on drop", async () => {
    const target = setupTarget();
    const onDrop = vi.fn();

    const { dropProps } = useDrop({
      ref: ref(target),
      onDrop,
    });

    const handlers = dropProps as unknown as DropHandlers;
    const dataTransfer = new DataTransferMock();
    dataTransfer.items.add("first", "custom");
    dataTransfer.items.add("second", "custom");
    dataTransfer.items.add(
      JSON.stringify([{ custom: "first" }, { custom: "second" }]),
      "application/vnd.react-aria.items+json"
    );

    handlers.onDragenter(
      new DragEventMock("dragenter", { dataTransfer }) as unknown as DragEvent
    );
    handlers.onDrop(new DragEventMock("drop", { dataTransfer }) as unknown as DragEvent);

    expect(onDrop).toHaveBeenCalledTimes(1);
    const items = onDrop.mock.calls[0]?.[0].items;
    expect(items).toHaveLength(2);
    expect(await items[0].getText("custom")).toBe("first");
    expect(await items[1].getText("custom")).toBe("second");
  });

  it("keeps native drop effect in sync with allowed operations", () => {
    const target = setupTarget();

    const { dropProps } = useDrop({
      ref: ref(target),
    });

    const handlers = dropProps as unknown as DropHandlers;
    const dataTransfer = new DataTransferMock();
    dataTransfer.effectAllowed = "copy";

    handlers.onDragenter(
      new DragEventMock("dragenter", {
        dataTransfer,
        clientX: 1,
        clientY: 1,
      }) as unknown as DragEvent
    );

    expect(dataTransfer.dropEffect).toBe("copy");

    dataTransfer.effectAllowed = "none";
    handlers.onDragover(
      new DragEventMock("dragover", {
        dataTransfer,
        clientX: 2,
        clientY: 2,
      }) as unknown as DragEvent
    );

    expect(dataTransfer.dropEffect).toBe("none");
  });

  it("preserves first matching item for simple plain-text payloads", () => {
    const target = setupTarget();
    const onDrop = vi.fn();

    const { dropProps } = useDrop({
      ref: ref(target),
      onDrop,
    });

    const handlers = dropProps as unknown as DropHandlers;
    const dataTransfer = new DataTransferMock([
      new DataTransferItemMock("text/plain", "hello world"),
    ]);

    handlers.onDragenter(
      new DragEventMock("dragenter", { dataTransfer }) as unknown as DragEvent
    );
    handlers.onDrop(new DragEventMock("drop", { dataTransfer }) as unknown as DragEvent);

    expect(onDrop).toHaveBeenCalledTimes(1);
  });
});
