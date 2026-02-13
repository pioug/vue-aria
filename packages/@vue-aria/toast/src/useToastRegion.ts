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
      updateTimers();
    },
  });

  useLayoutEffect(() => {
    if (!refValue.current) {
      toasts.value = [];
      return;
    }

    toasts.value = Array.from(refValue.current.querySelectorAll('[role="alertdialog"]'));
  }, [() => refValue.current, () => state.visibleToasts.length]);

  useLayoutEffect(() => {
    if (state.visibleToasts.length === 0 && lastFocused.value && (lastFocused.value as Node).isConnected) {
      if (getInteractionModality() === "pointer") {
        focusWithoutScrolling(lastFocused.value as HTMLElement);
      } else {
        (lastFocused.value as HTMLElement).focus();
      }
      lastFocused.value = null;
    }
  }, [() => state.visibleToasts.length]);

  return {
    regionProps: mergeProps(landmarkProps, hoverProps, focusWithinProps, {
      tabIndex: -1,
      "data-react-aria-top-layer": true,
      onFocus(event: FocusEvent) {
        const target = (event.target as Element | null)?.closest?.('[role="alertdialog"]');
        focusedToast.value = toasts.value.findIndex((toast) => toast === target);
      },
      onBlur() {
        focusedToast.value = -1;
      },
    }),
  };
}
