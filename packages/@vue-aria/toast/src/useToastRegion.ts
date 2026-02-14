import { focusWithoutScrolling, mergeProps, useLayoutEffect } from "@vue-aria/utils";
import { getInteractionModality, useFocusWithin, useHover } from "@vue-aria/interactions";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { useLandmark } from "@vue-aria/landmark";
import { ref } from "vue";
import type { QueuedToast } from "./useToast";
import { intlMessages } from "./intlMessages";

export interface ToastRegionState<T> {
  visibleToasts: Array<QueuedToast<T>>;
  pauseAll(): void;
  resumeAll(): void;
}

export interface AriaToastRegionProps {
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export interface ToastRegionAria {
  regionProps: Record<string, unknown>;
}

export function useToastRegion<T>(
  props: AriaToastRegionProps,
  state: ToastRegionState<T>,
  refValue: { current: HTMLElement | null }
): ToastRegionAria {
  const stringFormatter = useLocalizedStringFormatter(intlMessages as any, "@react-aria/toast");
  const { landmarkProps } = useLandmark(
    {
      role: "region",
      "aria-label": props["aria-label"] || stringFormatter.format("notifications", { count: state.visibleToasts.length }),
    },
    refValue
  );

  const isHovered = ref(false);
  const isFocused = ref(false);
  const lastFocused = ref<Element | null>(null);
  const toasts = ref<Element[]>([]);
  const prevVisibleToasts = ref<Array<QueuedToast<T>>>(state.visibleToasts);
  const focusedToast = ref<number | null>(null);

  const updateTimers = () => {
    if (isHovered.value || isFocused.value) {
      state.pauseAll();
    } else {
      state.resumeAll();
    }
  };

  const { hoverProps } = useHover({
    onHoverStart: () => {
      isHovered.value = true;
      updateTimers();
    },
    onHoverEnd: () => {
      isHovered.value = false;
      updateTimers();
    },
  });

  const { focusWithinProps } = useFocusWithin({
    onFocusWithin: (event) => {
      isFocused.value = true;
      lastFocused.value = event.relatedTarget as Element | null;
      updateTimers();
    },
    onBlurWithin: () => {
      isFocused.value = false;
      lastFocused.value = null;
      updateTimers();
    },
  });

  const restoreFocusToLastFocused = () => {
    if (!lastFocused.value || !(lastFocused.value as Node).isConnected) {
      return;
    }

    if (getInteractionModality() === "pointer") {
      focusWithoutScrolling(lastFocused.value as HTMLElement);
    } else {
      (lastFocused.value as HTMLElement).focus();
    }
    lastFocused.value = null;
  };

  useLayoutEffect(() => {
    if (focusedToast.value === -1 || state.visibleToasts.length === 0 || !refValue.current) {
      toasts.value = [];
      prevVisibleToasts.value = state.visibleToasts;
      return;
    }

    toasts.value = Array.from(refValue.current.querySelectorAll('[role="alertdialog"]'));
    if (
      prevVisibleToasts.value.length === state.visibleToasts.length
      && state.visibleToasts.every((toast, index) => toast.key === prevVisibleToasts.value[index]?.key)
    ) {
      prevVisibleToasts.value = state.visibleToasts;
      return;
    }

    const allToasts = prevVisibleToasts.value.map((toast, index) => ({
      ...toast,
      i: index,
      isRemoved: !state.visibleToasts.some((currentToast) => currentToast.key === toast.key),
    }));

    const removedFocusedToastIndex = allToasts.findIndex(
      (toast) => toast.i === focusedToast.value && toast.isRemoved
    );

    if (removedFocusedToastIndex > -1) {
      if (getInteractionModality() === "pointer" && lastFocused.value && (lastFocused.value as Node).isConnected) {
        focusWithoutScrolling(lastFocused.value as HTMLElement);
      } else {
        let index = 0;
        let nextToast: number | undefined;
        let prevToast: number | undefined;

        while (index <= removedFocusedToastIndex) {
          if (!allToasts[index]?.isRemoved) {
            prevToast = Math.max(0, index - 1);
          }
          index++;
        }

        while (index < allToasts.length) {
          if (!allToasts[index]?.isRemoved) {
            nextToast = index - 1;
            break;
          }
          index++;
        }

        if (prevToast === undefined && nextToast === undefined) {
          prevToast = 0;
        }

        if (prevToast != null && prevToast >= 0 && prevToast < toasts.value.length) {
          focusWithoutScrolling(toasts.value[prevToast] as HTMLElement);
        } else if (nextToast != null && nextToast >= 0 && nextToast < toasts.value.length) {
          focusWithoutScrolling(toasts.value[nextToast] as HTMLElement);
        }
      }
    }

    prevVisibleToasts.value = state.visibleToasts;
  }, [() => refValue.current, () => state.visibleToasts.map((toast) => String(toast.key)).join("|")]);

  useLayoutEffect(() => {
    if (state.visibleToasts.length === 0) {
      restoreFocusToLastFocused();
    }
  }, [() => state.visibleToasts.length]);

  useLayoutEffect(() => {
    return () => {
      restoreFocusToLastFocused();
    };
  }, []);

  const handleRegionFocus = (event: FocusEvent) => {
    const target = (event.target as Element | null)?.closest?.('[role="alertdialog"]');
    focusedToast.value = toasts.value.findIndex((toast) => toast === target);
  };

  const handleRegionBlur = () => {
    focusedToast.value = -1;
  };

  return {
    regionProps: mergeProps(landmarkProps, hoverProps, focusWithinProps, {
      tabIndex: -1,
      "data-react-aria-top-layer": true,
      onFocus: handleRegionFocus,
      onFocusin: handleRegionFocus,
      onBlur: handleRegionBlur,
      onFocusout: handleRegionBlur,
    }),
  };
}
