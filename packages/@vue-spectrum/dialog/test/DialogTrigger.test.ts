import { mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import { describe, expect, it } from "vitest";
import { Dialog, DialogTrigger } from "../src";

async function flushOverlay(): Promise<void> {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

function mountDialogTrigger(
  props: Record<string, unknown> = {}
) {
  return mount(DialogTrigger, {
    attachTo: document.body,
    props,
    slots: {
      default: () => [
        h("button", { type: "button" }, "Trigger"),
        h(Dialog, null, () => "contents"),
      ],
    },
  });
}

describe("DialogTrigger", () => {
  it("triggers a modal by default", async () => {
    const wrapper = mountDialogTrigger();

    expect(document.body.querySelector("[role=\"dialog\"]")).toBeNull();

    await wrapper.get("button").trigger("click");
    await flushOverlay();

    expect(document.body.querySelector("[role=\"dialog\"]")).not.toBeNull();
    expect(document.body.querySelector("[data-testid=\"modal\"]")).not.toBeNull();

    wrapper.unmount();
  });

  it("triggers a tray", async () => {
    const wrapper = mountDialogTrigger({
      type: "tray",
    });

    await wrapper.get("button").trigger("click");
    await flushOverlay();

    expect(document.body.querySelector("[role=\"dialog\"]")).not.toBeNull();
    expect(document.body.querySelector("[data-testid=\"tray\"]")).not.toBeNull();

    wrapper.unmount();
  });

  it("triggers a popover", async () => {
    const wrapper = mountDialogTrigger({
      type: "popover",
    });

    await wrapper.get("button").trigger("click");
    await flushOverlay();

    expect(document.body.querySelector("[role=\"dialog\"]")).not.toBeNull();
    expect(document.body.querySelector("[data-testid=\"popover\"]")).not.toBeNull();

    wrapper.unmount();
  });

  it("positions popovers relative to the trigger", async () => {
    const wrapper = mountDialogTrigger({
      type: "popover",
      placement: "top",
    });

    await wrapper.get("button").trigger("click");
    await flushOverlay();

    const popover = document.body.querySelector("[data-testid=\"popover\"]") as HTMLElement;
    expect(popover).not.toBeNull();
    expect(popover.getAttribute("data-placement")).not.toBeNull();
    expect(popover.style.position.length).toBeGreaterThan(0);
    expect(popover.style.zIndex).toBe("100000");

    wrapper.unmount();
  });

  it("hides the dialog when pressing escape", async () => {
    const wrapper = mountDialogTrigger();

    await wrapper.get("button").trigger("click");
    await flushOverlay();
    const overlay = document.body.querySelector("[data-testid=\"modal\"]");
    expect(overlay).not.toBeNull();

    overlay?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await flushOverlay();

    expect(document.body.querySelector("[role=\"dialog\"]")).toBeNull();

    wrapper.unmount();
  });
});
