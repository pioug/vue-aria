import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { cleanup, render } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import type { ClipboardProps } from "../src";
import { useClipboard } from "../src";
import {
  ClipboardEventMock,
  DataTransferItemMock,
  DataTransferMock,
} from "./mocks";

function renderCopyable(overrides: Partial<ClipboardProps> = {}) {
  const options: ClipboardProps = {
    getItems: () => [
      {
        "text/plain": "hello world",
      },
    ],
    ...overrides,
  };

  const Copyable = defineComponent({
    setup() {
      const { clipboardProps } = useClipboard(options);
      return () => h("div", { tabIndex: 0, role: "button", ...clipboardProps }, "Copy");
    },
  });

  return render(Copyable);
}

describe("useClipboard", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeAll(() => {
    user = userEvent.setup({ delay: null });
  });

  afterEach(() => {
    cleanup();
  });

  it("copies items to the clipboard", async () => {
    const onCopy = vi.fn();
    const view = renderCopyable({ onCopy });
    const button = view.getByRole("button");

    await user.tab();
    expect(document.activeElement).toBe(button);

    const clipboardData = new DataTransferMock();
    const allowDefault = button.dispatchEvent(
      new ClipboardEventMock("beforecopy", { clipboardData })
    );
    expect(allowDefault).toBe(false);

    button.dispatchEvent(new ClipboardEventMock("copy", { clipboardData }));
    expect([...clipboardData.items]).toEqual([
      new DataTransferItemMock("text/plain", "hello world"),
    ]);

    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it("only enables copying when focused", () => {
    const onCopy = vi.fn();
    const view = renderCopyable({ onCopy });
    const button = view.getByRole("button");

    const clipboardData = new DataTransferMock();
    const allowDefault = button.dispatchEvent(
      new ClipboardEventMock("beforecopy", { clipboardData })
    );
    expect(allowDefault).toBe(true);

    button.dispatchEvent(new ClipboardEventMock("copy", { clipboardData }));
    expect([...clipboardData.items]).toHaveLength(0);
    expect(onCopy).not.toHaveBeenCalled();
  });

  it("does not enable copying when getItems is missing", async () => {
    const onCopy = vi.fn();
    const view = renderCopyable({ getItems: null, onCopy });
    const button = view.getByRole("button");

    await user.tab();
    expect(document.activeElement).toBe(button);

    const clipboardData = new DataTransferMock();
    const allowDefault = button.dispatchEvent(
      new ClipboardEventMock("beforecopy", { clipboardData })
    );
    expect(allowDefault).toBe(true);

    button.dispatchEvent(new ClipboardEventMock("copy", { clipboardData }));
    expect([...clipboardData.items]).toHaveLength(0);
    expect(onCopy).not.toHaveBeenCalled();
  });

  it("cuts items to the clipboard", async () => {
    const onCut = vi.fn();
    const view = renderCopyable({ onCut });
    const button = view.getByRole("button");

    await user.tab();
    expect(document.activeElement).toBe(button);

    const clipboardData = new DataTransferMock();
    const allowDefault = button.dispatchEvent(
      new ClipboardEventMock("beforecut", { clipboardData })
    );
    expect(allowDefault).toBe(false);

    button.dispatchEvent(new ClipboardEventMock("cut", { clipboardData }));
    expect([...clipboardData.items]).toEqual([
      new DataTransferItemMock("text/plain", "hello world"),
    ]);

    expect(onCut).toHaveBeenCalledTimes(1);
  });

  it("only enables cutting when focused", () => {
    const onCut = vi.fn();
    const view = renderCopyable({ onCut });
    const button = view.getByRole("button");

    const clipboardData = new DataTransferMock();
    const allowDefault = button.dispatchEvent(
      new ClipboardEventMock("beforecut", { clipboardData })
    );
    expect(allowDefault).toBe(true);

    button.dispatchEvent(new ClipboardEventMock("cut", { clipboardData }));
    expect([...clipboardData.items]).toHaveLength(0);
    expect(onCut).not.toHaveBeenCalled();
  });

  it("does not enable cutting when getItems is missing", async () => {
    const onCut = vi.fn();
    const view = renderCopyable({ getItems: null, onCut });
    const button = view.getByRole("button");

    await user.tab();
    expect(document.activeElement).toBe(button);

    const clipboardData = new DataTransferMock();
    const allowDefault = button.dispatchEvent(
      new ClipboardEventMock("beforecut", { clipboardData })
    );
    expect(allowDefault).toBe(true);

    button.dispatchEvent(new ClipboardEventMock("cut", { clipboardData }));
    expect([...clipboardData.items]).toHaveLength(0);
    expect(onCut).not.toHaveBeenCalled();
  });

  it("does not enable cutting when onCut is missing", async () => {
    const view = renderCopyable();
    const button = view.getByRole("button");

    await user.tab();
    expect(document.activeElement).toBe(button);

    const clipboardData = new DataTransferMock();
    const allowDefault = button.dispatchEvent(
      new ClipboardEventMock("beforecut", { clipboardData })
    );
    expect(allowDefault).toBe(true);

    button.dispatchEvent(new ClipboardEventMock("cut", { clipboardData }));
    expect([...clipboardData.items]).toHaveLength(0);
  });

  it("pastes items from the clipboard", async () => {
    const onPaste = vi.fn();
    const view = renderCopyable({ onPaste });
    const button = view.getByRole("button");

    await user.tab();
    expect(document.activeElement).toBe(button);

    const clipboardData = new DataTransferMock();
    clipboardData.items.add("hello world", "text/plain");

    const allowDefault = button.dispatchEvent(
      new ClipboardEventMock("beforepaste", { clipboardData })
    );
    expect(allowDefault).toBe(false);

    button.dispatchEvent(new ClipboardEventMock("paste", { clipboardData }));

    expect(onPaste).toHaveBeenCalledTimes(1);
    expect(onPaste).toHaveBeenCalledWith([
      {
        kind: "text",
        types: new Set(["text/plain"]),
        getText: expect.any(Function),
      },
    ]);

    expect(await onPaste.mock.calls[0]?.[0][0].getText("text/plain")).toBe("hello world");
  });

  it("only enables pasting when focused", () => {
    const onPaste = vi.fn();
    const view = renderCopyable({ onPaste });
    const button = view.getByRole("button");

    const clipboardData = new DataTransferMock();
    const allowDefault = button.dispatchEvent(
      new ClipboardEventMock("beforepaste", { clipboardData })
    );
    expect(allowDefault).toBe(true);

    button.dispatchEvent(new ClipboardEventMock("paste", { clipboardData }));
    expect(onPaste).not.toHaveBeenCalled();
  });

  it("does not enable pasting when onPaste is missing", async () => {
    const view = renderCopyable();
    const button = view.getByRole("button");

    await user.tab();
    expect(document.activeElement).toBe(button);

    const clipboardData = new DataTransferMock();
    const allowDefault = button.dispatchEvent(
      new ClipboardEventMock("beforepaste", { clipboardData })
    );
    expect(allowDefault).toBe(true);
  });

  describe("data", () => {
    it("works with custom data types", async () => {
      const getItems = () => [
        {
          test: "test data",
        },
      ];

      const onPaste = vi.fn();
      const view = renderCopyable({ getItems, onPaste });
      const button = view.getByRole("button");

      await user.tab();
      expect(document.activeElement).toBe(button);

      const clipboardData = new DataTransferMock();
      button.dispatchEvent(new ClipboardEventMock("copy", { clipboardData }));
      expect([...clipboardData.items]).toEqual([new DataTransferItemMock("test", "test data")]);

      button.dispatchEvent(new ClipboardEventMock("paste", { clipboardData }));
      expect(onPaste).toHaveBeenCalledTimes(1);
      expect(onPaste).toHaveBeenCalledWith([
        {
          kind: "text",
          types: new Set(["test"]),
          getText: expect.any(Function),
        },
      ]);

      expect(await onPaste.mock.calls[0]?.[0][0].getText("test")).toBe("test data");
    });

    it("works with multiple items of the same custom type", async () => {
      const getItems = () => [
        { test: "item 1" },
        { test: "item 2" },
      ];

      const onPaste = vi.fn();
      const view = renderCopyable({ getItems, onPaste });
      const button = view.getByRole("button");

      await user.tab();
      expect(document.activeElement).toBe(button);

      const clipboardData = new DataTransferMock();
      button.dispatchEvent(new ClipboardEventMock("copy", { clipboardData }));
      expect([...clipboardData.items]).toEqual([
        new DataTransferItemMock("test", "item 1"),
        new DataTransferItemMock(
          "application/vnd.react-aria.items+json",
          JSON.stringify([{ test: "item 1" }, { test: "item 2" }])
        ),
      ]);

      button.dispatchEvent(new ClipboardEventMock("paste", { clipboardData }));
      expect(onPaste).toHaveBeenCalledTimes(1);
      expect(onPaste).toHaveBeenCalledWith([
        {
          kind: "text",
          types: new Set(["test"]),
          getText: expect.any(Function),
        },
        {
          kind: "text",
          types: new Set(["test"]),
          getText: expect.any(Function),
        },
      ]);

      expect(await onPaste.mock.calls[0]?.[0][0].getText("test")).toBe("item 1");
      expect(await onPaste.mock.calls[0]?.[0][1].getText("test")).toBe("item 2");
    });

    it("works with items of multiple types", async () => {
      const getItems = () => [
        {
          test: "test data",
          "text/plain": "test data",
        },
      ];

      const onPaste = vi.fn();
      const view = renderCopyable({ getItems, onPaste });
      const button = view.getByRole("button");

      await user.tab();
      expect(document.activeElement).toBe(button);

      const clipboardData = new DataTransferMock();
      button.dispatchEvent(new ClipboardEventMock("copy", { clipboardData }));
      expect([...clipboardData.items]).toEqual([
        new DataTransferItemMock("test", "test data"),
        new DataTransferItemMock("text/plain", "test data"),
        new DataTransferItemMock(
          "application/vnd.react-aria.items+json",
          JSON.stringify([{ test: "test data", "text/plain": "test data" }])
        ),
      ]);

      button.dispatchEvent(new ClipboardEventMock("paste", { clipboardData }));
      expect(onPaste).toHaveBeenCalledTimes(1);
      expect(onPaste).toHaveBeenCalledWith([
        {
          kind: "text",
          types: new Set(["test", "text/plain"]),
          getText: expect.any(Function),
        },
      ]);

      expect(await onPaste.mock.calls[0]?.[0][0].getText("test")).toBe("test data");
      expect(await onPaste.mock.calls[0]?.[0][0].getText("text/plain")).toBe("test data");
    });

    it("works with multiple items of multiple types", async () => {
      const getItems = () => [
        { test: "item 1", "text/plain": "item 1" },
        { test: "item 2", "text/plain": "item 2" },
      ];

      const onPaste = vi.fn();
      const view = renderCopyable({ getItems, onPaste });
      const button = view.getByRole("button");

      await user.tab();
      expect(document.activeElement).toBe(button);

      const clipboardData = new DataTransferMock();
      button.dispatchEvent(new ClipboardEventMock("copy", { clipboardData }));
      expect([...clipboardData.items]).toEqual([
        new DataTransferItemMock("test", "item 1"),
        new DataTransferItemMock("text/plain", "item 1\nitem 2"),
        new DataTransferItemMock(
          "application/vnd.react-aria.items+json",
          JSON.stringify([
            { test: "item 1", "text/plain": "item 1" },
            { test: "item 2", "text/plain": "item 2" },
          ])
        ),
      ]);

      button.dispatchEvent(new ClipboardEventMock("paste", { clipboardData }));
      expect(onPaste).toHaveBeenCalledTimes(1);
      expect(onPaste).toHaveBeenCalledWith([
        {
          kind: "text",
          types: new Set(["test", "text/plain"]),
          getText: expect.any(Function),
        },
        {
          kind: "text",
          types: new Set(["test", "text/plain"]),
          getText: expect.any(Function),
        },
      ]);

      expect(await onPaste.mock.calls[0]?.[0][0].getText("test")).toBe("item 1");
      expect(await onPaste.mock.calls[0]?.[0][0].getText("text/plain")).toBe("item 1");
      expect(await onPaste.mock.calls[0]?.[0][1].getText("test")).toBe("item 2");
      expect(await onPaste.mock.calls[0]?.[0][1].getText("text/plain")).toBe("item 2");
    });

    it("passes action type to getItems for cut", async () => {
      const getItems = (details: { action: "cut" | "copy" }) => [
        {
          [details.action]: "test data",
        },
      ];

      const onCut = vi.fn();
      const view = renderCopyable({ getItems, onCut });
      const button = view.getByRole("button");

      await user.tab();
      expect(document.activeElement).toBe(button);

      const clipboardData = new DataTransferMock();
      button.dispatchEvent(new ClipboardEventMock("cut", { clipboardData }));
      expect([...clipboardData.items]).toEqual([
        new DataTransferItemMock("cut", "test data"),
      ]);
      expect(onCut).toHaveBeenCalledTimes(1);
    });

    it("passes action type to getItems for copy", async () => {
      const getItems = (details: { action: "cut" | "copy" }) => [
        {
          [details.action]: "test data",
        },
      ];

      const onCopy = vi.fn();
      const view = renderCopyable({ getItems, onCopy });
      const button = view.getByRole("button");

      await user.tab();
      expect(document.activeElement).toBe(button);

      const clipboardData = new DataTransferMock();
      button.dispatchEvent(new ClipboardEventMock("copy", { clipboardData }));
      expect([...clipboardData.items]).toEqual([
        new DataTransferItemMock("copy", "test data"),
      ]);
      expect(onCopy).toHaveBeenCalledTimes(1);
    });
  });
});
