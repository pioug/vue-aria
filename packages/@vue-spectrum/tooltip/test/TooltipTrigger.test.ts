import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";
import { Tooltip } from "../src/Tooltip";
import { TooltipTrigger } from "../src/TooltipTrigger";

function getTooltip(): HTMLElement | null {
  return document.body.querySelector('[role="tooltip"]');
}

function createWrapper(props: Record<string, unknown> = {}) {
  return mount(TooltipTrigger as any, {
    props: {
      ...props,
    },
    slots: {
      default: () => [
        h("button", { "aria-label": "trigger", "data-testid": "trigger" }, "Trigger"),
        h(Tooltip as any, null, {
          default: () => "Helpful information.",
        }),
      ],
    },
    attachTo: document.body,
  });
}

describe("TooltipTrigger", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("opens for focus", async () => {
    const onOpenChange = vi.fn();
    const wrapper = createWrapper({ delay: 0, onOpenChange });

    const button = wrapper.get('[data-testid="trigger"]');
    await button.trigger("focus");
    await nextTick();

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(getTooltip()).toBeTruthy();

    await button.trigger("blur");
    await nextTick();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(getTooltip()).toBeNull();
  });

  it("is closed if the trigger is pressed", async () => {
    const onOpenChange = vi.fn();
    const wrapper = createWrapper({ delay: 0, onOpenChange });

    const button = wrapper.get('[data-testid="trigger"]');
    await button.trigger("focus");
    await nextTick();
    expect(getTooltip()).toBeTruthy();

    await button.trigger("pointerdown");
    await nextTick();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(getTooltip()).toBeNull();
  });

  it("does not close on press when shouldCloseOnPress is false", async () => {
    const wrapper = createWrapper({ delay: 0, shouldCloseOnPress: false });

    const button = wrapper.get('[data-testid="trigger"]');
    await button.trigger("focus");
    await nextTick();
    expect(getTooltip()).toBeTruthy();

    await button.trigger("pointerdown");
    await nextTick();
    expect(getTooltip()).toBeTruthy();
  });

  it("closes when Escape is pressed", async () => {
    const wrapper = createWrapper({ delay: 0 });
    const button = wrapper.get('[data-testid="trigger"]');

    await button.trigger("focus");
    await nextTick();
    expect(getTooltip()).toBeTruthy();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await nextTick();
    expect(getTooltip()).toBeNull();
  });

  it("supports controlled open state", async () => {
    const wrapper = createWrapper({ isOpen: true });
    await nextTick();
    expect(getTooltip()).toBeTruthy();
  });
});
