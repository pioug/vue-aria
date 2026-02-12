import { mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import { UNSAFE_PortalProvider } from "@vue-aria/overlays";
import { Tooltip, TooltipTrigger } from "../src";

async function flushOverlay(): Promise<void> {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

function mountTooltipTrigger(
  props: Record<string, unknown> = {},
  tooltipProps: Record<string, unknown> = {}
) {
  return mount(TooltipTrigger, {
    attachTo: document.body,
    props: {
      delay: 0,
      closeDelay: 0,
      ...props,
    },
    slots: {
      default: () => [
        h("button", { "aria-label": "trigger" }, "Trigger"),
        h(Tooltip, tooltipProps, () => "Helpful information."),
      ],
    },
  });
}

describe("TooltipTrigger", () => {
  it("opens for focus", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mountTooltipTrigger({
      onOpenChange,
    });

    const button = wrapper.get("button");
    (button.element as HTMLButtonElement).focus();
    await flushOverlay();

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();

    (button.element as HTMLButtonElement).blur();
    await flushOverlay();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();

    wrapper.unmount();
  });

  it("opens for hover", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mountTooltipTrigger({
      onOpenChange,
    });

    const button = wrapper.get("button");
    await button.trigger("pointerenter", { pointerType: "mouse" });
    await flushOverlay();

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();

    await button.trigger("pointerleave", { pointerType: "mouse" });
    await flushOverlay();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();

    wrapper.unmount();
  });

  it("opens for hover after delay", async () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    const wrapper = mountTooltipTrigger({
      onOpenChange,
      delay: 350,
    });

    try {
      const button = wrapper.get("button");
      await button.trigger("pointerenter", { pointerType: "mouse" });
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();

      vi.advanceTimersByTime(349);
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();

      vi.advanceTimersByTime(1);
      await flushOverlay();
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();
    } finally {
      wrapper.unmount();
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    }
  });

  it("uses a default hover delay when delay is omitted", async () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    const wrapper = mount(TooltipTrigger, {
      attachTo: document.body,
      props: {
        onOpenChange,
      },
      slots: {
        default: () => [
          h("button", { "aria-label": "trigger" }, "Trigger"),
          h(Tooltip, () => "Helpful information."),
        ],
      },
    });

    try {
      const button = wrapper.get("button");
      await button.trigger("pointerenter", { pointerType: "mouse" });
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();

      vi.advanceTimersByTime(1499);
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();

      vi.advanceTimersByTime(1);
      await flushOverlay();

      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();
    } finally {
      wrapper.unmount();
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    }
  });

  it("uses a default close delay when closeDelay is omitted", async () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    const wrapper = mount(TooltipTrigger, {
      attachTo: document.body,
      props: {
        delay: 0,
        onOpenChange,
      },
      slots: {
        default: () => [
          h("button", { "aria-label": "trigger" }, "Trigger"),
          h(Tooltip, () => "Helpful information."),
        ],
      },
    });

    try {
      const button = wrapper.get("button");
      await button.trigger("pointerenter", { pointerType: "mouse" });
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();

      await button.trigger("pointerleave", { pointerType: "mouse" });
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();

      vi.advanceTimersByTime(499);
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();

      vi.advanceTimersByTime(1);
      await flushOverlay();

      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();
    } finally {
      wrapper.unmount();
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    }
  });

  it("respects custom closeDelay values", async () => {
    vi.useFakeTimers();
    const wrapper = mountTooltipTrigger({
      closeDelay: 350,
    });

    try {
      const button = wrapper.get("button");
      await button.trigger("pointerenter", { pointerType: "mouse" });
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();

      await button.trigger("pointerleave", { pointerType: "mouse" });
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();

      vi.advanceTimersByTime(349);
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();

      vi.advanceTimersByTime(1);
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();
    } finally {
      wrapper.unmount();
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    }
  });

  it("reopens immediately during cooldown and waits again after cooldown", async () => {
    vi.useFakeTimers();
    const wrapper = mount(TooltipTrigger, {
      attachTo: document.body,
      props: {
        closeDelay: 0,
      },
      slots: {
        default: () => [
          h("button", { "aria-label": "trigger" }, "Trigger"),
          h(Tooltip, () => "Helpful information."),
        ],
      },
    });

    try {
      const button = wrapper.get("button");
      await button.trigger("pointerenter", { pointerType: "mouse" });
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();

      vi.advanceTimersByTime(1500);
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();

      await button.trigger("pointerleave", { pointerType: "mouse" });
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();

      await button.trigger("pointerenter", { pointerType: "mouse" });
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();

      await button.trigger("pointerleave", { pointerType: "mouse" });
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();

      vi.advanceTimersByTime(500);
      await flushOverlay();

      await button.trigger("pointerenter", { pointerType: "mouse" });
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();

      vi.advanceTimersByTime(1499);
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();

      vi.advanceTimersByTime(1);
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();
    } finally {
      wrapper.unmount();
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    }
  });

  it("does not warm up a second trigger when the first is left during warmup", async () => {
    vi.useFakeTimers();
    const Root = {
      render() {
        return h("div", null, [
          h(
            TooltipTrigger,
            {
              closeDelay: 0,
            },
            {
              default: () => [
                h("button", { "aria-label": "first trigger" }, "First"),
                h(Tooltip, () => "First tooltip"),
              ],
            }
          ),
          h(
            TooltipTrigger,
            {
              closeDelay: 0,
            },
            {
              default: () => [
                h("button", { "aria-label": "second trigger" }, "Second"),
                h(Tooltip, () => "Second tooltip"),
              ],
            }
          ),
        ]);
      },
    };

    const wrapper = mount(Root, {
      attachTo: document.body,
    });

    try {
      const firstButton = wrapper.get("[aria-label=\"first trigger\"]");
      const secondButton = wrapper.get("[aria-label=\"second trigger\"]");

      await firstButton.trigger("pointerenter", { pointerType: "mouse" });
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();

      vi.advanceTimersByTime(750);
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();

      await firstButton.trigger("pointerleave", { pointerType: "mouse" });
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();

      await secondButton.trigger("pointerenter", { pointerType: "mouse" });
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();

      vi.advanceTimersByTime(1499);
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();

      vi.advanceTimersByTime(1);
      await flushOverlay();
      const tooltip = document.body.querySelector("[role=\"tooltip\"]");
      expect(tooltip).not.toBeNull();
      expect(tooltip?.textContent).toContain("Second tooltip");
    } finally {
      wrapper.unmount();
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    }
  });

  it("does not open when hover leaves before delayed open", async () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    const wrapper = mountTooltipTrigger({
      onOpenChange,
      delay: 350,
    });

    try {
      const button = wrapper.get("button");
      await button.trigger("pointerenter", { pointerType: "mouse" });
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();

      vi.advanceTimersByTime(175);
      await flushOverlay();
      await button.trigger("pointerleave", { pointerType: "mouse" });
      await flushOverlay();

      vi.advanceTimersByTime(350);
      await flushOverlay();

      expect(onOpenChange).not.toHaveBeenCalledWith(true);
      expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();
    } finally {
      wrapper.unmount();
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    }
  });

  it("opens immediately for focus while delayed hover open is pending", async () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    const wrapper = mountTooltipTrigger({
      onOpenChange,
      delay: 350,
    });

    try {
      const button = wrapper.get("button");
      await button.trigger("pointerenter", { pointerType: "mouse" });
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();

      vi.advanceTimersByTime(175);
      await flushOverlay();

      (button.element as HTMLButtonElement).focus();
      await flushOverlay();

      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();
    } finally {
      wrapper.unmount();
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    }
  });

  it("can be keyboard force closed", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mountTooltipTrigger({
      onOpenChange,
    });

    const button = wrapper.get("button");
    (button.element as HTMLButtonElement).focus();
    await flushOverlay();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await flushOverlay();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();

    wrapper.unmount();
  });

  it("can be keyboard force closed from anywhere", async () => {
    const onOpenChange = vi.fn();
    const Root = {
      render() {
        return h("div", null, [
          h(
            TooltipTrigger,
            {
              onOpenChange,
              delay: 0,
            },
            {
              default: () => [
                h("button", { "aria-label": "trigger" }, "Trigger"),
                h(Tooltip, () => "Helpful information."),
              ],
            }
          ),
          h("input", { type: "text", "aria-label": "outside input" }),
        ]);
      },
    };

    const wrapper = mount(Root, {
      attachTo: document.body,
    });

    const button = wrapper.get("button");
    await button.trigger("pointerenter", { pointerType: "mouse" });
    await flushOverlay();
    expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();

    const outsideInput = wrapper.get("input");
    (outsideInput.element as HTMLInputElement).focus();
    await flushOverlay();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await flushOverlay();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();

    wrapper.unmount();
  });

  it("closes when the page scrolls", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mountTooltipTrigger({
      onOpenChange,
    });

    const button = wrapper.get("button");
    await button.trigger("pointerenter", { pointerType: "mouse" });
    await flushOverlay();
    expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();

    window.dispatchEvent(new Event("scroll"));
    await flushOverlay();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();

    wrapper.unmount();
  });

  it("hides when hover leaves even if focused", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mountTooltipTrigger({
      onOpenChange,
    });

    const button = wrapper.get("button");
    (button.element as HTMLButtonElement).focus();
    await flushOverlay();
    expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();

    await button.trigger("pointerenter", { pointerType: "mouse" });
    await flushOverlay();
    expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();

    await button.trigger("pointerleave", { pointerType: "mouse" });
    await flushOverlay();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();

    wrapper.unmount();
  });

  it("hides when focus leaves even if hovered", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mountTooltipTrigger({
      onOpenChange,
    });

    const button = wrapper.get("button");
    (button.element as HTMLButtonElement).focus();
    await flushOverlay();
    expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();

    await button.trigger("pointerenter", { pointerType: "mouse" });
    await flushOverlay();
    expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();

    (button.element as HTMLButtonElement).blur();
    await flushOverlay();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();

    wrapper.unmount();
  });

  it("is closed if the trigger is clicked", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mountTooltipTrigger({
      onOpenChange,
    });

    const button = wrapper.get("button");
    await button.trigger("pointerenter", { pointerType: "mouse" });
    await flushOverlay();

    await button.trigger("click");
    await flushOverlay();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();

    wrapper.unmount();
  });

  it("applies overlay positioning styles and requested placement", async () => {
    const wrapper = mountTooltipTrigger({}, { placement: "bottom" });
    const button = wrapper.get("button");

    await button.trigger("pointerenter", { pointerType: "mouse" });
    await flushOverlay();

    const tooltip = document.body.querySelector("[role=\"tooltip\"]") as HTMLElement | null;
    expect(tooltip).not.toBeNull();
    expect(tooltip?.className).toContain("spectrum-Tooltip--bottom");
    expect(tooltip?.style.position.length).toBeGreaterThan(0);
    expect(tooltip?.style.zIndex).toBe("100000");

    wrapper.unmount();
  });

  it("does not close on press when shouldCloseOnPress is false", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mountTooltipTrigger({
      onOpenChange,
      shouldCloseOnPress: false,
    });

    const button = wrapper.get("button");
    await button.trigger("pointerenter", { pointerType: "mouse" });
    await flushOverlay();
    expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();

    await button.trigger("click");
    await flushOverlay();

    expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    wrapper.unmount();
  });

  it("does not close on keyboard press when shouldCloseOnPress is false", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mountTooltipTrigger({
      onOpenChange,
      shouldCloseOnPress: false,
    });

    const button = wrapper.get("button");
    (button.element as HTMLButtonElement).focus();
    await flushOverlay();
    expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();

    await button.trigger("keydown", { key: "Enter" });
    await button.trigger("keyup", { key: "Enter" });
    await flushOverlay();

    expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    wrapper.unmount();
  });

  it("supports controlled open state", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mountTooltipTrigger({
      isOpen: true,
      onOpenChange,
    });

    try {
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();

      const button = wrapper.get("button");
      await button.trigger("click");
      await flushOverlay();

      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();
    } finally {
      wrapper.unmount();
    }
  });

  it("supports controlled hidden state", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mountTooltipTrigger({
      isOpen: false,
      onOpenChange,
    });

    try {
      const button = wrapper.get("button");
      (button.element as HTMLButtonElement).focus();
      await flushOverlay();

      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();
    } finally {
      wrapper.unmount();
    }
  });

  it("supports uncontrolled defaultOpen", async () => {
    const wrapper = mountTooltipTrigger({
      defaultOpen: true,
    });

    try {
      await flushOverlay();
      expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();
    } finally {
      wrapper.unmount();
    }
  });

  it("does not open when disabled", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mountTooltipTrigger({
      isDisabled: true,
      onOpenChange,
    });

    try {
      const button = wrapper.get("button");
      (button.element as HTMLButtonElement).focus();
      await button.trigger("pointerenter", { pointerType: "mouse" });
      await flushOverlay();

      expect(onOpenChange).not.toHaveBeenCalledWith(true);
      expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();
    } finally {
      wrapper.unmount();
    }
  });

  it("opens only on focus when trigger is set to focus", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mountTooltipTrigger({
      trigger: "focus",
      onOpenChange,
    });

    try {
      const button = wrapper.get("button");
      await button.trigger("pointerenter", { pointerType: "mouse" });
      await flushOverlay();

      expect(document.body.querySelector("[role=\"tooltip\"]")).toBeNull();
      expect(onOpenChange).not.toHaveBeenCalledWith(true);

      (button.element as HTMLButtonElement).focus();
      await flushOverlay();

      expect(document.body.querySelector("[role=\"tooltip\"]")).not.toBeNull();
      expect(onOpenChange).toHaveBeenCalledWith(true);
    } finally {
      wrapper.unmount();
    }
  });

  it("keeps only one tooltip visible across multiple triggers", async () => {
    const Root = {
      render() {
        return h("div", null, [
          h(
            TooltipTrigger,
            {
              delay: 0,
            },
            {
              default: () => [
                h("button", { "aria-label": "first trigger" }, "First"),
                h(Tooltip, () => "First tooltip"),
              ],
            }
          ),
          h(
            TooltipTrigger,
            {
              delay: 0,
            },
            {
              default: () => [
                h("button", { "aria-label": "second trigger" }, "Second"),
                h(Tooltip, () => "Second tooltip"),
              ],
            }
          ),
        ]);
      },
    };

    const wrapper = mount(Root, {
      attachTo: document.body,
    });

    const firstButton = wrapper.get("[aria-label=\"first trigger\"]");
    await firstButton.trigger("pointerenter", { pointerType: "mouse" });
    await flushOverlay();

    let tooltips = document.body.querySelectorAll("[role=\"tooltip\"]");
    expect(tooltips).toHaveLength(1);
    expect(tooltips[0]?.textContent).toContain("First tooltip");

    const secondButton = wrapper.get("[aria-label=\"second trigger\"]");
    await secondButton.trigger("pointerenter", { pointerType: "mouse" });
    await flushOverlay();

    tooltips = document.body.querySelectorAll("[role=\"tooltip\"]");
    expect(tooltips).toHaveLength(1);
    expect(tooltips[0]?.textContent).toContain("Second tooltip");

    wrapper.unmount();
  });

  it("renders tooltip content in portal container from UNSAFE_PortalProvider", async () => {
    const customContainer = document.createElement("div");
    customContainer.setAttribute("data-testid", "custom-container");
    document.body.appendChild(customContainer);

    const wrapper = mount(
      {
        render() {
          return h(
            UNSAFE_PortalProvider,
            {
              getContainer: () => customContainer,
            },
            {
              default: () =>
                h(
                  TooltipTrigger,
                  {
                    delay: 0,
                    closeDelay: 0,
                  },
                  {
                    default: () => [
                      h("button", { "aria-label": "trigger" }, "Trigger"),
                      h(Tooltip, () => h("div", { "data-testid": "content" }, "hello")),
                    ],
                  }
                ),
            }
          );
        },
      },
      {
        attachTo: document.body,
      }
    );

    try {
      const button = wrapper.get("button");
      (button.element as HTMLButtonElement).focus();
      await flushOverlay();

      const content = document.body.querySelector("[data-testid=\"content\"]");
      expect(content).not.toBeNull();
      expect(content?.closest("[data-testid=\"custom-container\"]")).toBe(customContainer);
    } finally {
      wrapper.unmount();
      customContainer.remove();
    }
  });

  it("allows nested UNSAFE_PortalProvider with null to clear parent portal container", async () => {
    const customContainer = document.createElement("div");
    customContainer.setAttribute("data-testid", "custom-container");
    document.body.appendChild(customContainer);

    const wrapper = mount(
      {
        render() {
          return h(
            UNSAFE_PortalProvider,
            {
              getContainer: () => customContainer,
            },
            {
              default: () =>
                h(
                  UNSAFE_PortalProvider,
                  {
                    getContainer: null,
                  },
                  {
                    default: () =>
                      h(
                        TooltipTrigger,
                        {
                          delay: 0,
                          closeDelay: 0,
                        },
                        {
                          default: () => [
                            h("button", { "aria-label": "trigger" }, "Trigger"),
                            h(Tooltip, () => h("div", { "data-testid": "content" }, "hello")),
                          ],
                        }
                      ),
                  }
                ),
            }
          );
        },
      },
      {
        attachTo: document.body,
      }
    );

    try {
      const button = wrapper.get("button");
      (button.element as HTMLButtonElement).focus();
      await flushOverlay();

      const content = document.body.querySelector("[data-testid=\"content\"]");
      expect(content).not.toBeNull();
      expect(content?.closest("[data-testid=\"custom-container\"]")).not.toBe(customContainer);
    } finally {
      wrapper.unmount();
      customContainer.remove();
    }
  });
});
