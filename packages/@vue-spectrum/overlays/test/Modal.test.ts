import { fireEvent, render } from "@testing-library/vue";
import { h, nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "../src";

describe("Modal", () => {
  it("renders nothing if isOpen is not set", () => {
    const tree = render(Modal, {
      slots: {
        default: () => h("div", { role: "dialog" }, "contents"),
      },
    });

    expect(tree.queryByRole("dialog")).toBeNull();
    expect(document.documentElement.style.overflow).not.toBe("hidden");
  });

  it("renders when isOpen is true", async () => {
    const tree = render(Modal, {
      props: {
        isOpen: true,
      },
      slots: {
        default: () => h("div", { role: "dialog" }, "contents"),
      },
    });

    await nextTick();
    const dialog = tree.getByRole("dialog");
    expect(dialog).toBeTruthy();
    expect(document.documentElement.style.overflow).toBe("hidden");
  });

  it("hides when pressing Escape", async () => {
    const onOpenChange = vi.fn();
    const tree = render(Modal, {
      props: {
        isOpen: true,
        onOpenChange,
      },
      slots: {
        default: () => h("div", { role: "dialog" }, "contents"),
      },
    });

    await nextTick();
    fireEvent.keyDown(tree.getByTestId("modal"), { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not hide when clicking outside by default", async () => {
    const onOpenChange = vi.fn();
    render(Modal, {
      props: {
        isOpen: true,
        onOpenChange,
      },
      slots: {
        default: () => h("div", { role: "dialog" }, "contents"),
      },
    });

    await nextTick();
    await fireEvent.pointerDown(document.body);
    await fireEvent.click(document.body);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("hides when clicking outside if dismissable", async () => {
    const onOpenChange = vi.fn();
    render(Modal, {
      props: {
        isOpen: true,
        isDismissable: true,
        onOpenChange,
      },
      slots: {
        default: () => h("div", { role: "dialog" }, "contents"),
      },
    });

    await nextTick();
    await fireEvent.pointerDown(document.body);
    await fireEvent.click(document.body);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("applies fullscreen type class", async () => {
    const tree = render(Modal, {
      props: {
        isOpen: true,
        type: "fullscreen",
      },
      slots: {
        default: () => h("div", { role: "dialog" }, "contents"),
      },
    });

    await nextTick();
    const modal = tree.getByTestId("modal");
    expect(modal.getAttribute("class") ?? "").toContain(
      "spectrum-Modal--fullscreen"
    );
  });
});
