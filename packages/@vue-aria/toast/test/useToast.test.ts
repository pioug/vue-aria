import { mount } from "@vue/test-utils";
import { defineComponent, effectScope, h, nextTick, reactive, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useToast, useToastRegion } from "../src";

describe("useToast", () => {
  const run = (props: Record<string, unknown>, state: { close: (key: unknown) => void }) => {
    const scope = effectScope();
    const result = scope.run(() => useToast(props as any, state as any, { current: document.createElement("div") }))!;
    return {
      result,
      cleanup() {
        scope.stop();
      },
    };
  };

  it("handles defaults", () => {
    const close = vi.fn();
    const { result, cleanup } = run(
      { toast: { key: "toast-1" } },
      { close }
    );
    const { closeButtonProps, toastProps, contentProps, titleProps } = result;

    expect(toastProps.role).toBe("alertdialog");
    expect(contentProps.role).toBe("alert");
    expect(closeButtonProps["aria-label"]).toBe("Close");
    expect(typeof closeButtonProps.onPress).toBe("function");
    expect(titleProps.id).toBe(toastProps["aria-labelledby"]);
    cleanup();
  });

  it("handles close button", () => {
    const close = vi.fn();
    const { result, cleanup } = run({ toast: { key: 1 } }, { close });
    const { closeButtonProps } = result;
    (closeButtonProps.onPress as () => void)();

    expect(close).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledWith(1);
    cleanup();
  });

  it("passes through data attributes", () => {
    const close = vi.fn();
    const { result, cleanup } = run({ toast: { key: "toast-1" }, "data-test-id": "toast" }, { close });
    const { toastProps } = result;
    expect(toastProps["data-test-id"]).toBe("toast");
    cleanup();
  });

  it("resets and pauses timers when toast timeout is configured", async () => {
    const close = vi.fn();
    const reset = vi.fn();
    const pause = vi.fn();
    const timer = { reset, pause };
    const { cleanup } = run({ toast: { key: "toast-1", timer, timeout: 3000 } }, { close });

    await nextTick();
    expect(reset).toHaveBeenCalledTimes(1);
    expect(reset).toHaveBeenCalledWith(3000);

    cleanup();
    expect(pause).toHaveBeenCalledTimes(1);
  });

  it("handles single-toast lifecycle focus transitions", async () => {
    type ToastItem = { key: number; content: string };
    const queue: ToastItem[] = [];
    let nextKey = 0;
    let latestRegionProps: { onFocus?: (event: FocusEvent) => void } | null = null;
    let regionElement: HTMLElement | null = null;

    const ToastItemView = defineComponent({
      name: "ToastItemView",
      props: {
        toast: { type: Object, required: true },
        state: { type: Object, required: true },
      },
      setup(props) {
        const toastRef = ref<HTMLElement | null>(null);
        const refAdapter = {
          get current() {
            return toastRef.value;
          },
          set current(value: Element | null) {
            toastRef.value = value as HTMLElement | null;
          },
        };
        const { toastProps, contentProps, titleProps, closeButtonProps } = useToast(
          { toast: props.toast as any },
          props.state as any,
          refAdapter
        );

        return () =>
          h("div", { ...toastProps, ref: toastRef }, [
            h("div", { ...contentProps }, [h("div", { ...titleProps }, (props.toast as ToastItem).content)]),
            h("button", { onClick: closeButtonProps.onPress as (() => void) | undefined }, "x"),
          ]);
      },
    });

    const App = defineComponent({
      name: "ToastSingleFlowApp",
      setup() {
        const containerRef = ref<HTMLElement | null>(null);
        const refAdapter = {
          get current() {
            return containerRef.value;
          },
          set current(value: HTMLElement | null) {
            containerRef.value = value;
            regionElement = containerRef.value;
          },
        };
        const state = reactive({
          visibleToasts: [] as ToastItem[],
          close(key: number) {
            if (state.visibleToasts[0]?.key !== key) {
              return;
            }

            const nextToast = queue.shift();
            state.visibleToasts = nextToast ? [nextToast] : [];
          },
          pauseAll: vi.fn(),
          resumeAll: vi.fn(),
        });

        const addToast = () => {
          const toast: ToastItem = { key: ++nextKey, content: `Mmmmm toast ${nextKey}x` };
          if (state.visibleToasts.length > 0) {
            queue.unshift(state.visibleToasts[0]);
          }
          state.visibleToasts = [toast];
        };

        const { regionProps } = useToastRegion({}, state as any, refAdapter);
        latestRegionProps = regionProps;

        return () =>
          h("div", [
            h("button", { "data-testid": "add-toast", onClick: addToast }, "Add toast"),
            h(
              "div",
              { ...regionProps, ref: containerRef },
              state.visibleToasts.map((toast) => h(ToastItemView, { key: toast.key, toast, state }))
            ),
          ]);
      },
    });

    const wrapper = mount(App, { attachTo: document.body });
    const addButton = wrapper.get('[data-testid="add-toast"]').element as HTMLButtonElement;
    addButton.focus();

    await wrapper.get('[data-testid="add-toast"]').trigger("click");
    await wrapper.get('[data-testid="add-toast"]').trigger("click");
    await nextTick();

    let toast = wrapper.get('[role="alertdialog"]');
    expect(toast.text()).toContain("Mmmmm toast 2x");

    const focusEvent = new FocusEvent("focus", { relatedTarget: addButton });
    Object.defineProperty(focusEvent, "currentTarget", { value: toast.element.parentElement });
    Object.defineProperty(focusEvent, "target", { value: toast.element });
    (latestRegionProps as { onFocus?: (event: FocusEvent) => void } | null)?.onFocus?.(focusEvent);

    const closeButton = toast.get("button");
    closeButton.element.focus();
    await closeButton.trigger("click");
    await nextTick();

    toast = wrapper.get('[role="alertdialog"]');
    expect(toast.text()).toContain("Mmmmm toast 1x");
    expect(document.activeElement).toBe(toast.element);

    const finalCloseButton = toast.get("button");
    finalCloseButton.element.focus();
    await finalCloseButton.trigger("click");
    await nextTick();

    expect(wrapper.find('[role="alertdialog"]').exists()).toBe(false);
    expect(document.activeElement).toBe(addButton);

    wrapper.unmount();
    regionElement = null;
  });
});
