import { filterDOMProps } from "@vue-aria/utils";
import { ToastQueue as StatelyToastQueue, useToastQueue } from "@vue-aria/toast-state";
import { computed, defineComponent, h } from "vue";
import { Toast } from "./Toast";
import { Toaster } from "./Toaster";
import type { SpectrumToastContainerProps, SpectrumToastOptions, SpectrumToastValue } from "./types";

export type CloseFunction = () => void;

function wrapInViewTransition(fn: () => void): void {
  if (typeof document !== "undefined" && "startViewTransition" in document) {
    (document as Document & { startViewTransition: (cb: () => void) => { ready: Promise<void> } })
      .startViewTransition(() => {
        fn();
      })
      .ready.catch(() => {});
    return;
  }

  fn();
}

let globalToastQueue: StatelyToastQueue<SpectrumToastValue> | null = null;
function getGlobalToastQueue(): StatelyToastQueue<SpectrumToastValue> {
  if (!globalToastQueue) {
    globalToastQueue = new StatelyToastQueue({
      maxVisibleToasts: Number.POSITIVE_INFINITY,
      wrapUpdate: (fn) => wrapInViewTransition(fn),
    });
  }

  return globalToastQueue;
}

// For tests. Intentionally not exported from package index.
export function clearToastQueue(): void {
  globalToastQueue = null;
}

/**
 * Root container for queued spectrum toasts.
 */
export const ToastContainer = defineComponent({
  name: "SpectrumToastContainer",
  inheritAttrs: false,
  props: {
    placement: {
      type: String as () => SpectrumToastContainerProps["placement"],
      required: false,
      default: undefined,
    },
    ariaLabel: {
      type: String,
      required: false,
    },
    ariaLabelledby: {
      type: String,
      required: false,
    },
  },
  setup(props) {
    const state = useToastQueue(getGlobalToastQueue());

    const placementMeta = computed(() => {
      const placements = (props.placement ?? "bottom").split(" ");
      return {
        placement: placements[placements.length - 1],
        isCentered: placements.length === 1,
      };
    });

    return () => {
      if (state.visibleToasts.length === 0) {
        return null;
      }

      return h(
        Toaster as any,
        {
          state,
          placement: props.placement,
          ariaLabel: props.ariaLabel,
          ariaLabelledby: props.ariaLabelledby,
        },
        {
          default: () =>
            h(
              "ol",
              {
                class: "spectrum-ToastContainer-list",
              },
              state.visibleToasts.map((toast, index) => {
                const shouldFade = placementMeta.value.isCentered && index !== 0;
                return h(
                  "li",
                  {
                    key: String(toast.key),
                    class: "spectrum-ToastContainer-listitem",
                    style: {
                      viewTransitionName: String(toast.key),
                      viewTransitionClass: [
                        "toast",
                        placementMeta.value.placement,
                        { fadeOnly: shouldFade },
                      ],
                    },
                  },
                  [h(Toast as any, { toast, state })]
                );
              })
            ),
        }
      );
    };
  },
});

function addToast(children: string, variant: SpectrumToastValue["variant"], options: SpectrumToastOptions = {}) {
  if (typeof CustomEvent !== "undefined" && typeof window !== "undefined") {
    const event = new CustomEvent("react-spectrum-toast", {
      cancelable: true,
      bubbles: true,
      detail: {
        children,
        variant,
        options,
      },
    });

    const shouldContinue = window.dispatchEvent(event);
    if (!shouldContinue) {
      return () => {};
    }
  }

  const value: SpectrumToastValue = {
    children,
    variant,
    actionLabel: options.actionLabel,
    onAction: options.onAction,
    shouldCloseOnAction: options.shouldCloseOnAction,
    ...filterDOMProps(options),
  };

  const timeout = options.timeout && !options.onAction ? Math.max(options.timeout, 5000) : undefined;
  const queue = getGlobalToastQueue();
  const key = queue.add(value, { timeout, onClose: options.onClose });
  return () => queue.close(key);
}

const SpectrumToastQueue = {
  neutral(children: string, options: SpectrumToastOptions = {}): CloseFunction {
    return addToast(children, "neutral", options);
  },
  positive(children: string, options: SpectrumToastOptions = {}): CloseFunction {
    return addToast(children, "positive", options);
  },
  negative(children: string, options: SpectrumToastOptions = {}): CloseFunction {
    return addToast(children, "negative", options);
  },
  info(children: string, options: SpectrumToastOptions = {}): CloseFunction {
    return addToast(children, "info", options);
  },
};

export { SpectrumToastQueue as ToastQueue };
