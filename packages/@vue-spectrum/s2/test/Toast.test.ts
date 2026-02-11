import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ToastContainer as SpectrumToastContainer,
  ToastQueue as SpectrumToastQueue,
  clearToastQueue,
} from "@vue-spectrum/toast";
import { ToastContainer, ToastQueue } from "../src";

async function flushToasts(): Promise<void> {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

describe("@vue-spectrum/s2 Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearToastQueue();
  });

  afterEach(() => {
    clearToastQueue();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("re-exports ToastContainer and ToastQueue", () => {
    expect(ToastContainer).toBe(SpectrumToastContainer);
    expect(ToastQueue).toBe(SpectrumToastQueue);
  });

  it("renders queued toasts with ToastContainer", async () => {
    const component = defineComponent({
      name: "S2ToastHarness",
      setup() {
        return () => h(ToastContainer);
      },
    });
    const wrapper = mount(component, { attachTo: document.body });

    ToastQueue.positive("Toast message");
    await flushToasts();

    expect(document.body.querySelector("[role=\"alertdialog\"]")).not.toBeNull();
    wrapper.unmount();
  });
});
