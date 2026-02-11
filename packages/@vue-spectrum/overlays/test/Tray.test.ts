import { fireEvent, render } from "@testing-library/vue";
import { h, nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import { Tray } from "../src";

describe("Tray", () => {
  it("renders nothing if isOpen is not set", () => {
    const tree = render(Tray, {
      slots: {
        default: () => h("div", { role: "dialog" }, "contents"),
      },
    });

    expect(tree.queryByRole("dialog")).toBeNull();
    expect(document.documentElement.style.overflow).not.toBe("hidden");
  });

  it("renders when isOpen is true", async () => {
    const tree = render(Tray, {
      props: {
        isOpen: true,
      },
      slots: {
        default: () => h("div", { role: "dialog" }, "contents"),
      },
    });

    await nextTick();
    expect(tree.getByRole("dialog")).toBeTruthy();
    expect(document.documentElement.style.overflow).toBe("hidden");
  });

  it("hides when pressing Escape", async () => {
    const onOpenChange = vi.fn();
    const tree = render(Tray, {
      props: {
        isOpen: true,
        onOpenChange,
      },
      slots: {
        default: () => h("div", { role: "dialog" }, "contents"),
      },
    });

    await nextTick();
    fireEvent.keyDown(tree.getByTestId("tray"), { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("hides when clicking outside", async () => {
    const onOpenChange = vi.fn();
    render(Tray, {
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
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("includes hidden dismiss buttons and closes on dismiss button press", async () => {
    const onOpenChange = vi.fn();
    const tree = render(Tray, {
      props: {
        isOpen: true,
        onOpenChange,
      },
    });

    await nextTick();
    const dismissButtons = tree.getAllByRole("button", { name: "Dismiss" });
    expect(dismissButtons).toHaveLength(2);

    await fireEvent.click(dismissButtons[0] as Element);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("applies fixed height class", async () => {
    const tree = render(Tray, {
      props: {
        isOpen: true,
        isFixedHeight: true,
      },
      slots: {
        default: () => h("div", { role: "dialog" }, "contents"),
      },
    });

    await nextTick();
    const tray = tree.getByTestId("tray");
    expect(tray.getAttribute("class") ?? "").toContain("spectrum-Tray--fixedHeight");
  });
});
