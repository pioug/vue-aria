import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  type PropType,
} from "vue";
import { filterDOMProps } from "@vue-aria/utils";
import {
  useToastState,
  type ToastOptions,
  type UseToastStateResult,
} from "@vue-aria/toast-state";
import { classNames } from "@vue-spectrum/utils";
import { Toast, type SpectrumToastValue } from "./Toast";
import { Toaster } from "./Toaster";

export type ToastPlacement = "top" | "top end" | "bottom" | "bottom end";

export interface SpectrumToastContainerProps {
  placement?: ToastPlacement | undefined;
  ariaLabel?: string | undefined;
  "aria-label"?: string | undefined;
}

export interface SpectrumToastOptions extends ToastOptions {
  actionLabel?: string | undefined;
  onAction?: (() => void) | undefined;
  shouldCloseOnAction?: boolean | undefined;
  [key: string]: unknown;
}

export type CloseFunction = () => void;

let globalToastState: UseToastStateResult<SpectrumToastValue> | null = null;
const toastProviders = ref<symbol[]>([]);

function getGlobalToastState(): UseToastStateResult<SpectrumToastValue> {
  if (!globalToastState) {
    globalToastState = useToastState<SpectrumToastValue>({
      maxVisibleToasts: Number.POSITIVE_INFINITY,
    });
  }

  return globalToastState;
}

export function clearToastQueue(): void {
  globalToastState?.clear();
  globalToastState = null;
  toastProviders.value = [];
}

function registerToastProvider(id: symbol): void {
  if (toastProviders.value.includes(id)) {
    return;
  }

  toastProviders.value = [...toastProviders.value, id];
}

function unregisterToastProvider(id: symbol): void {
  toastProviders.value = toastProviders.value.filter((entry) => entry !== id);
}

function addToast(
  children: string,
  variant: SpectrumToastValue["variant"],
  options: SpectrumToastOptions = {}
): CloseFunction {
  if (typeof window !== "undefined" && typeof CustomEvent !== "undefined") {
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
    ...filterDOMProps(options as Record<string, unknown>),
  };
  const timeout = options.timeout && !options.onAction
    ? Math.max(options.timeout, 5000)
    : undefined;
  const state = getGlobalToastState();
  const key = state.add(value, { timeout, onClose: options.onClose });

  return () => {
    state.close(key);
  };
}

export const ToastQueue = {
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

export const ToastContainer = defineComponent({
  name: "ToastContainer",
  props: {
    placement: {
      type: String as PropType<ToastPlacement | undefined>,
      default: undefined,
    },
    ariaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-label": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs }) {
    const providerId = Symbol("toast-provider");
    const state = getGlobalToastState();

    onMounted(() => {
      registerToastProvider(providerId);
    });

    onBeforeUnmount(() => {
      unregisterToastProvider(providerId);
    });

    const isActiveToastProvider = computed(
      () => toastProviders.value[0] === providerId
    );

    return () => {
      if (!isActiveToastProvider.value || state.visibleToasts.value.length === 0) {
        return null;
      }

      const shouldCenter = !props.placement?.includes(" ");
      const ariaLabel =
        props.ariaLabel ??
        props["aria-label"] ??
        (attrs["aria-label"] as string | undefined);

      return h(
        Toaster,
        {
          state,
          placement: props.placement,
          ariaLabel,
        },
        {
          default: () =>
            h(
              "ol",
              { class: classNames("spectrum-ToastContainer-list") },
              state.visibleToasts.value.map((toast, index) =>
                h(
                  "li",
                  {
                    key: toast.key,
                    class: classNames("spectrum-ToastContainer-listitem"),
                    style: shouldCenter && index !== 0
                      ? {
                        opacity: 0.8,
                      }
                      : undefined,
                  },
                  [h(Toast, { toast, state })]
                )
              )
            ),
        }
      );
    };
  },
});
