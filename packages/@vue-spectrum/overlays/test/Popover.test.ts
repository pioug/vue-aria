import { fireEvent, render } from "@testing-library/vue";
import { h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_SPECTRUM_THEME_CLASS_MAP, Provider } from "@vue-spectrum/provider";
import { Popover } from "../src";

function createTrigger(): HTMLButtonElement {
  const trigger = document.createElement("button");
  trigger.textContent = "Trigger";
  document.body.append(trigger);
  return trigger;
}

describe("Popover", () => {
  it("renders an open popover and arrow by default", () => {
    const trigger = createTrigger();

    try {
      const tree = render(Popover, {
        props: {
          isOpen: true,
          triggerRef: trigger,
          placement: "bottom",
        },
        slots: {
          default: () => "Popover content",
        },
      });

      const popover = tree.getByTestId("popover");
      expect(popover.textContent).toContain("Popover content");
      expect(popover.getAttribute("class") ?? "").toContain("spectrum-Popover--bottom");
      expect(tree.getByTestId("popover-arrow")).toBeTruthy();
      expect(tree.getByTestId("popover-underlay")).toBeTruthy();
    } finally {
      trigger.remove();
    }
  });

  it("calls onOpenChange(false) on Escape", async () => {
    const trigger = createTrigger();
    const onOpenChange = vi.fn();

    try {
      const tree = render(Popover, {
        props: {
          isOpen: true,
          triggerRef: trigger,
          onOpenChange,
        },
        slots: {
          default: () => "Popover content",
        },
      });

      await fireEvent.keyDown(tree.getByTestId("popover"), { key: "Escape" });
      expect(onOpenChange).toHaveBeenCalledWith(false);
    } finally {
      trigger.remove();
    }
  });

  it("calls onOpenChange(false) when clicking the underlay", async () => {
    const trigger = createTrigger();
    const onOpenChange = vi.fn();

    try {
      const tree = render(Popover, {
        props: {
          isOpen: true,
          triggerRef: trigger,
          onOpenChange,
        },
        slots: {
          default: () => "Popover content",
        },
      });

      await fireEvent.mouseDown(tree.getByTestId("popover-underlay"));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    } finally {
      trigger.remove();
    }
  });

  it("calls onOpenChange(false) when focus leaves the popover", async () => {
    const trigger = createTrigger();
    const outside = document.createElement("button");
    outside.textContent = "Outside";
    document.body.append(outside);
    const onOpenChange = vi.fn();

    try {
      const tree = render(Popover, {
        props: {
          isOpen: true,
          triggerRef: trigger,
          onOpenChange,
        },
        slots: {
          default: () => h("input", { "aria-label": "popover-input" }),
        },
      });

      const input = tree.getByLabelText("popover-input");
      await fireEvent.focusIn(input);
      await fireEvent.focusOut(input, { relatedTarget: outside });

      expect(onOpenChange).toHaveBeenCalledWith(false);
    } finally {
      trigger.remove();
      outside.remove();
    }
  });

  it("does not render an underlay when non-modal", () => {
    const trigger = createTrigger();

    try {
      const tree = render(Popover, {
        props: {
          isOpen: true,
          isNonModal: true,
          triggerRef: trigger,
        },
        slots: {
          default: () => "Popover content",
        },
      });

      expect(tree.queryByTestId("popover-underlay")).toBeNull();
    } finally {
      trigger.remove();
    }
  });

  it("hides the arrow when hideArrow is true", () => {
    const trigger = createTrigger();

    try {
      const tree = render(Popover, {
        props: {
          isOpen: true,
          hideArrow: true,
          triggerRef: trigger,
        },
        slots: {
          default: () => "Popover content",
        },
      });

      expect(tree.queryByTestId("popover-arrow")).toBeNull();
    } finally {
      trigger.remove();
    }
  });

  it("includes hidden dismiss buttons and closes on dismiss press", async () => {
    const trigger = createTrigger();
    const onOpenChange = vi.fn();

    try {
      const tree = render(Popover, {
        props: {
          isOpen: true,
          triggerRef: trigger,
          onOpenChange,
        },
        slots: {
          default: () => "Popover content",
        },
      });

      const dismissButtons = tree.getAllByRole("button", { name: "Dismiss" });
      expect(dismissButtons).toHaveLength(2);

      await fireEvent.click(dismissButtons[0] as Element);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    } finally {
      trigger.remove();
    }
  });

  it("localizes hidden dismiss button labels from provider locale", () => {
    const trigger = createTrigger();

    try {
      const tree = render(Provider, {
        props: {
          theme: DEFAULT_SPECTRUM_THEME_CLASS_MAP,
          locale: "fr-FR",
        },
        slots: {
          default: () =>
            h(
              Popover,
              {
                isOpen: true,
                triggerRef: trigger,
              },
              {
                default: () => "Popover content",
              }
            ),
        },
      });

      const dismissButtons = tree.getAllByRole("button", { name: "Rejeter" });
      expect(dismissButtons).toHaveLength(2);
    } finally {
      trigger.remove();
    }
  });
});
