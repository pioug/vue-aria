import { filterDOMProps, useId, useLayoutEffect, useSlotId } from "@vue-aria/utils";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { ref } from "vue";
import type { Key } from "@vue-aria/collections";
import { intlMessages } from "./intlMessages";

export interface QueuedToast<T> {
  key: Key;
  content?: T;
  timeout?: number | null;
  timer?: {
    reset(timeout: number): void;
    pause(): void;
  } | null;
}

export interface ToastState<T> {
  close(key: Key): void;
}

export interface AriaToastProps<T> {
  toast: QueuedToast<T>;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  [key: string]: unknown;
}

export interface ToastAria {
  toastProps: Record<string, unknown>;
  contentProps: Record<string, unknown>;
  titleProps: Record<string, unknown>;
  descriptionProps: Record<string, unknown>;
  closeButtonProps: Record<string, unknown>;
}

export function useToast<T>(
  props: AriaToastProps<T>,
  state: ToastState<T>,
  _ref: { current: Element | null }
): ToastAria {
  const { key, timer, timeout } = props.toast;

  useLayoutEffect(() => {
    if (timer == null || timeout == null) {
      return;
    }

    timer.reset(timeout);
    return () => {
      timer.pause();
    };
  }, [() => timer, () => timeout]);

  const titleId = useId();
  const descriptionId = useSlotId();
  const stringFormatter = useLocalizedStringFormatter(intlMessages as any, "@react-aria/toast");

  const isVisible = ref(false);
  useLayoutEffect(() => {
    isVisible.value = true;
  }, []);

  const toastProps = filterDOMProps(props, { labelable: true });
  const contentProps: Record<string, unknown> = {
    role: "alert",
    "aria-atomic": "true",
  };
  Object.defineProperty(contentProps, "aria-hidden", {
    enumerable: true,
    configurable: true,
    get: () => (isVisible.value ? undefined : "true"),
  });

  return {
    toastProps: {
      ...toastProps,
      role: "alertdialog",
      "aria-modal": "false",
      "aria-labelledby": props["aria-labelledby"] || titleId,
      "aria-describedby": props["aria-describedby"] || descriptionId,
      tabIndex: 0,
    },
    contentProps,
    titleProps: {
      id: titleId,
    },
    descriptionProps: {
      id: descriptionId,
    },
    closeButtonProps: {
      "aria-label": stringFormatter.format("close"),
      onPress: () => state.close(key),
    },
  };
}
