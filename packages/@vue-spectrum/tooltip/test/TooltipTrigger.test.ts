import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { Button } from "@vue-spectrum/button";
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

  it("supports Spectrum Button as a trigger composition child", async () => {
    const onOpenChange = vi.fn();
    const wrapper = mount(TooltipTrigger as any, {
      props: {
        delay: 0,
        onOpenChange,
      },
      slots: {
        default: () => [
          h(Button as any, { "aria-label": "trigger", "data-testid": "spectrum-trigger" }, { default: () => "Trigger" }),
          h(Tooltip as any, null, {
            default: () => "Helpful information.",
          }),
        ],
      },
      attachTo: document.body,
    });

    const button = wrapper.get('[data-testid="spectrum-trigger"]');
    await button.trigger("focus");
    await nextTick();
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(getTooltip()).toBeTruthy();

    await button.trigger("blur");
    await nextTick();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(getTooltip()).toBeNull();
  });

  it("supports wrapped trigger components that forward attrs and dom refs", async () => {
    const TriggerWrapper = defineComponent({
      name: "TooltipTriggerWrapper",
      inheritAttrs: false,
      setup(_props, { attrs, slots, expose }) {
        const buttonRef = ref<any>(null);
        expose({
          UNSAFE_getDOMNode: () => {
            return buttonRef.value?.UNSAFE_getDOMNode?.() ?? buttonRef.value?.$el ?? null;
          },
        });

        return () =>
          h(Button as any, { ...attrs, ref: buttonRef }, {
            default: () => slots.default?.(),
          });
      },
    });

    const wrapper = mount(TooltipTrigger as any, {
      props: {
        delay: 0,
      },
      slots: {
        default: () => [
          h(TriggerWrapper as any, { "aria-label": "wrapped trigger", "data-testid": "wrapped-trigger" }, { default: () => "Wrapped" }),
          h(Tooltip as any, null, {
            default: () => "Wrapped tooltip.",
          }),
        ],
      },
      attachTo: document.body,
    });

    const button = wrapper.get('[data-testid="wrapped-trigger"]');
    await button.trigger("focus");
    await nextTick();
    expect(getTooltip()).toBeTruthy();

    await button.trigger("blur");
    await nextTick();
    expect(getTooltip()).toBeNull();
  });
});
