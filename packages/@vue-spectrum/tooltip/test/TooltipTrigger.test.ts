import { mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import { Tooltip, TooltipTrigger } from "../src";

async function flushOverlay(): Promise<void> {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

function mountTooltipTrigger(
  props: Record<string, unknown> = {}
) {
  return mount(TooltipTrigger, {
    attachTo: document.body,
    props,
    slots: {
      default: () => [
        h("button", { "aria-label": "trigger" }, "Trigger"),
        h(Tooltip, null, () => "Helpful information."),
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
});
