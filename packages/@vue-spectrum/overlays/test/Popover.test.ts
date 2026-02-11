import { fireEvent, render } from "@testing-library/vue";
import { describe, expect, it, vi } from "vitest";
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
});
