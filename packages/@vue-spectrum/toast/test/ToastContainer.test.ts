import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, type PropType } from "vue";
import { ToastContainer, ToastQueue } from "../src";
import { clearToastQueue } from "../src/ToastContainer";
import type { SpectrumToastOptions } from "../src/types";

const RenderToastButton = defineComponent({
  name: "RenderToastButton",
  props: {
    variant: {
      type: String as () => "neutral" | "positive" | "negative" | "info" | undefined,
      required: false,
      default: "neutral",
    },
    actionLabel: {
      type: String,
      required: false,
    },
    onAction: {
      type: Function as PropType<(() => void) | undefined>,
      required: false,
    },
    onClose: {
      type: Function as PropType<(() => void) | undefined>,
      required: false,
    },
    shouldCloseOnAction: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    timeout: {
      type: Number as () => number | undefined,
      required: false,
      default: undefined,
    },
    optionData: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      required: false,
      default: undefined,
    },
  },
  setup(props) {
    return () =>
      h(
        "button",
        {
          "data-testid": "show-toast",
          onClick: () =>
            (ToastQueue as Record<string, (children: string, options?: SpectrumToastOptions) => void>)[
              props.variant ?? "neutral"
            ]("Toast is default", {
              actionLabel: props.actionLabel,
              onAction: props.onAction,
              onClose: props.onClose,
              shouldCloseOnAction: props.shouldCloseOnAction,
              timeout: props.timeout,
              ...(props.optionData ?? {}),
            }),
        },
        "Show Default Toast"
      );
  },
});

const mountedWrappers: Array<{ unmount: () => void }> = [];

function renderComponent(children?: ReturnType<typeof h>) {
  const wrapper = mount(
    defineComponent({
      setup() {
        return () =>
          h("div", [
            h(ToastContainer as any),
            children ?? h(RenderToastButton as any),
          ]);
      },
    }),
    { attachTo: document.body }
  );
  mountedWrappers.push(wrapper);
  return wrapper;
}

describe("ToastContainer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearToastQueue();
  });

  afterEach(() => {
    for (const wrapper of mountedWrappers.splice(0, mountedWrappers.length)) {
      wrapper.unmount();
    }
    vi.runAllTimers();
    vi.useRealTimers();
    clearToastQueue();
    document.body.innerHTML = "";
  });

  it("renders a button that triggers a toast", async () => {
    const wrapper = renderComponent();
    await nextTick();
    expect(document.body.querySelector('[role="alertdialog"]')).toBeNull();

    await wrapper.get('[data-testid="show-toast"]').trigger("click");
    vi.advanceTimersByTime(100);
    await nextTick();

    const region = document.body.querySelector('[role="region"]');
    expect(region?.getAttribute("aria-label")).toContain("notification");

    const toast = document.body.querySelector('[role="alertdialog"]');
    const alert = toast?.querySelector('[role="alert"]');
    expect(toast).toBeTruthy();
    expect(alert).toBeTruthy();

    const closeButton = toast?.querySelector('[data-testid="rsp-Toast-closeButton"]');
    expect(closeButton).toBeTruthy();
    (closeButton as HTMLElement).click();
    await nextTick();

    expect(document.body.querySelector('[role="alertdialog"]')).toBeNull();
  });

  it("supports data-testid option props", async () => {
    const wrapper = renderComponent(h(RenderToastButton as any, { actionLabel: "Update", optionData: { "data-testid": "toast-container" } }));
    await nextTick();
    await wrapper.get('[data-testid="show-toast"]').trigger("click");
    await nextTick();

    expect(document.body.querySelector('[data-testid="toast-container"]')).toBeTruthy();
    expect(document.body.querySelector('[data-testid="rsp-Toast-secondaryButton"]')).toBeTruthy();
    expect(document.body.querySelector('[data-testid="rsp-Toast-closeButton"]')).toBeTruthy();
  });

  it("labels icon by variant", async () => {
    const wrapper = renderComponent(h(RenderToastButton as any, { variant: "positive" }));
    await nextTick();
    await wrapper.get('[data-testid="show-toast"]').trigger("click");
    await nextTick();

    const toast = document.body.querySelector('[role="alertdialog"]');
    const alert = toast?.querySelector('[role="alert"]');
    const icon = alert?.querySelector('[role="img"]');
    expect(icon?.getAttribute("aria-label")).toBe("Success");

    const title = alert?.querySelector(".spectrum-Toast-content");
    expect(toast?.getAttribute("aria-labelledby")).toBe(title?.id ?? null);
  });

  it("removes a toast via timeout", async () => {
    const wrapper = renderComponent(h(RenderToastButton as any, { timeout: 5000 }));
    await nextTick();
    await wrapper.get('[data-testid="show-toast"]').trigger("click");
    await nextTick();

    expect(document.body.querySelector('[role="alertdialog"]')).toBeTruthy();
    vi.advanceTimersByTime(5000);
    await nextTick();
    expect(document.body.querySelector('[role="alertdialog"]')).toBeNull();
  });

  it("supports actions without forced close", async () => {
    const onAction = vi.fn();
    const onClose = vi.fn();
    const wrapper = renderComponent(
      h(RenderToastButton as any, {
        actionLabel: "Action",
        onAction,
        onClose,
      })
    );
    await nextTick();
    await wrapper.get('[data-testid="show-toast"]').trigger("click");
    await nextTick();

    const actionButton = document.body.querySelector('[data-testid="rsp-Toast-secondaryButton"]');
    (actionButton as HTMLElement).click();
    await nextTick();
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(0);
    expect(document.body.querySelector('[role="alertdialog"]')).toBeTruthy();
  });

  it("supports action-triggered close", async () => {
    const onAction = vi.fn();
    const onClose = vi.fn();
    const wrapper = renderComponent(
      h(RenderToastButton as any, {
        actionLabel: "Action",
        onAction,
        onClose,
        shouldCloseOnAction: true,
      })
    );
    await nextTick();
    await wrapper.get('[data-testid="show-toast"]').trigger("click");
    await nextTick();

    const actionButton = document.body.querySelector('[data-testid="rsp-Toast-secondaryButton"]');
    (actionButton as HTMLElement).click();
    await nextTick();
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(document.body.querySelector('[role="alertdialog"]')).toBeNull();
  });

  it("supports programmatically closing toasts", async () => {
    let close: (() => void) | null = null;
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h("div", [
              h(ToastContainer as any),
              h("button", {
                "data-testid": "toggle-toast",
                onClick: () => {
                  if (close) {
                    close();
                    close = null;
                  } else {
                    close = ToastQueue.positive("Toast is done!");
                  }
                },
              }, close ? "Hide Toast" : "Show Toast"),
            ]);
        },
      }),
      { attachTo: document.body }
    );
    mountedWrappers.push(wrapper);
    await nextTick();

    await wrapper.get('[data-testid="toggle-toast"]').trigger("click");
    await nextTick();
    expect(document.body.querySelector('[role="alertdialog"]')).toBeTruthy();

    await wrapper.get('[data-testid="toggle-toast"]').trigger("click");
    await nextTick();
    expect(document.body.querySelector('[role="alertdialog"]')).toBeNull();
  });

  it("supports custom toast events", async () => {
    const onToast = vi.fn((event: Event) => event.preventDefault());
    window.addEventListener("react-spectrum-toast", onToast as EventListener);

    const wrapper = renderComponent();
    await nextTick();
    await wrapper.get('[data-testid="show-toast"]').trigger("click");
    await nextTick();

    expect(document.body.querySelector('[role="alert"]')).toBeNull();
    expect(onToast).toHaveBeenCalledTimes(1);
    window.removeEventListener("react-spectrum-toast", onToast as EventListener);
  });

  it("supports custom aria-label", async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h("div", [
              h(ToastContainer as any, { "aria-label": "Toasts" }),
              h(RenderToastButton as any),
            ]);
        },
      }),
      { attachTo: document.body }
    );
    mountedWrappers.push(wrapper);
    await nextTick();

    await wrapper.get('[data-testid="show-toast"]').trigger("click");
    await nextTick();
    const region = document.body.querySelector('[role="region"]');
    expect(region?.getAttribute("aria-label")).toBe("Toasts");
  });
});
