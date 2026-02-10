import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ToastContainer,
  ToastQueue,
  clearToastQueue,
  type SpectrumToastOptions,
} from "../src";

type ToastVariant = "neutral" | "positive" | "negative" | "info";

async function flushToasts(): Promise<void> {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

function mountToastContainer(containerProps: Record<string, unknown> = {}) {
  const component = defineComponent({
    name: "ToastContainerHarness",
    setup() {
      return () => h(ToastContainer, containerProps);
    },
  });

  return mount(component, { attachTo: document.body });
}

function queueToast(
  variant: ToastVariant = "neutral",
  options: SpectrumToastOptions = {}
): void {
  ToastQueue[variant]("Toast is default", options);
}

function clickElement(selector: string): void {
  const element = document.body.querySelector<HTMLElement>(selector);
  if (!element) {
    throw new Error(`Missing element: ${selector}`);
  }

  element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

describe("ToastContainer", () => {
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

  it("renders and dismisses a toast", async () => {
    const wrapper = mountToastContainer();

    queueToast();
    await flushToasts();

    const region = document.body.querySelector("[role=\"region\"]");
    expect(region).not.toBeNull();
    expect(region?.getAttribute("aria-label")).toBe("1 notification");

    const toast = document.body.querySelector("[role=\"alertdialog\"]");
    expect(toast).not.toBeNull();

    const closeButton = document.body.querySelector(
      "[data-testid=\"rsp-Toast-closeButton\"]"
    );
    expect(closeButton).not.toBeNull();
    expect(closeButton?.getAttribute("aria-label")).toBe("Close");

    clickElement("[data-testid=\"rsp-Toast-closeButton\"]");
    await flushToasts();

    expect(document.body.querySelector("[role=\"alertdialog\"]")).toBeNull();
    wrapper.unmount();
  });

  it("supports test id and action button props", async () => {
    const wrapper = mountToastContainer();

    queueToast("neutral", {
      "data-testid": "toast-container",
      actionLabel: "Update",
    });
    await flushToasts();

    expect(document.body.querySelector("[data-testid=\"toast-container\"]")).not.toBeNull();
    expect(
      document.body.querySelector("[data-testid=\"rsp-Toast-secondaryButton\"]")
    ).not.toBeNull();
    expect(
      document.body.querySelector("[data-testid=\"rsp-Toast-closeButton\"]")
    ).not.toBeNull();

    wrapper.unmount();
  });

  it("labels status icon by variant", async () => {
    const wrapper = mountToastContainer();

    queueToast("positive");
    await flushToasts();

    const icon = document.body.querySelector("[role=\"img\"]");
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute("aria-label")).toBe("Success");

    const toast = document.body.querySelector("[role=\"alertdialog\"]");
    const title = document.body.querySelector(".spectrum-Toast-content");
    expect(toast?.getAttribute("aria-labelledby")).toBe(title?.id);

    wrapper.unmount();
  });

  it("removes a toast via timeout using a 5-second minimum", async () => {
    const wrapper = mountToastContainer();

    queueToast("neutral", { timeout: 1000 });
    await flushToasts();
    expect(document.body.querySelector("[role=\"alertdialog\"]")).not.toBeNull();

    vi.advanceTimersByTime(2000);
    await flushToasts();
    expect(document.body.querySelector("[role=\"alertdialog\"]")).not.toBeNull();

    vi.advanceTimersByTime(3500);
    await flushToasts();
    expect(document.body.querySelector("[role=\"alertdialog\"]")).toBeNull();

    wrapper.unmount();
  });

  it("supports action handlers and optional close-on-action", async () => {
    const onAction = vi.fn();
    const onClose = vi.fn();
    const wrapper = mountToastContainer();

    queueToast("neutral", {
      actionLabel: "Action",
      onAction,
      onClose,
    });
    await flushToasts();

    clickElement("[data-testid=\"rsp-Toast-secondaryButton\"]");
    await flushToasts();

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    expect(document.body.querySelector("[role=\"alertdialog\"]")).not.toBeNull();

    wrapper.unmount();
  });

  it("closes toast when shouldCloseOnAction is enabled", async () => {
    const onAction = vi.fn();
    const onClose = vi.fn();
    const wrapper = mountToastContainer();

    queueToast("neutral", {
      actionLabel: "Action",
      onAction,
      onClose,
      shouldCloseOnAction: true,
    });
    await flushToasts();

    clickElement("[data-testid=\"rsp-Toast-secondaryButton\"]");
    await flushToasts();

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(document.body.querySelector("[role=\"alertdialog\"]")).toBeNull();

    wrapper.unmount();
  });

  it("supports custom toast events", async () => {
    const wrapper = mountToastContainer();
    const onToast = vi.fn((event: Event) => {
      event.preventDefault();
    });

    window.addEventListener("react-spectrum-toast", onToast as EventListener);
    queueToast();
    await flushToasts();

    expect(document.body.querySelector("[role=\"alertdialog\"]")).toBeNull();
    expect(onToast).toHaveBeenCalledTimes(1);

    window.removeEventListener("react-spectrum-toast", onToast as EventListener);
    wrapper.unmount();
  });

  it("supports custom aria-labels and a single active container", async () => {
    const component = defineComponent({
      name: "ToastContainerPairHarness",
      setup() {
        return () =>
          h("div", null, [
            h(ToastContainer, { "aria-label": "Toasts" }),
            h(ToastContainer),
          ]);
      },
    });
    const wrapper = mount(component, { attachTo: document.body });

    queueToast();
    await flushToasts();

    const regions = document.body.querySelectorAll("[role=\"region\"]");
    expect(regions).toHaveLength(1);
    expect(regions[0]?.getAttribute("aria-label")).toBe("Toasts");

    wrapper.unmount();
  });
});
