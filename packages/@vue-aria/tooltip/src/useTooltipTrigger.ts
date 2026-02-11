import { computed, getCurrentScope, onScopeDispose, ref, toValue, watchEffect } from "vue";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import { useFocus, useHover } from "@vue-aria/interactions";
import { mergeProps } from "@vue-aria/utils";
import { useId } from "@vue-aria/ssr";
import type { TooltipTriggerStateLike } from "./useTooltip";

export interface UseTooltipTriggerOptions {
  isDisabled?: MaybeReactive<boolean | undefined>;
  trigger?: MaybeReactive<"focus" | "hover" | undefined>;
  shouldCloseOnPress?: MaybeReactive<boolean | undefined>;
  delay?: MaybeReactive<number | undefined>;
}

export interface UseTooltipTriggerResult {
  triggerProps: ReadonlyRef<Record<string, unknown>>;
  tooltipProps: ReadonlyRef<Record<string, unknown>>;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  return Boolean(toValue(value));
}

function resolveTrigger(
  value: MaybeReactive<"focus" | "hover" | undefined> | undefined
): "focus" | "hover" {
  if (value === undefined) {
    return "hover";
  }

  return toValue(value) ?? "hover";
}

function resolveDelay(value: MaybeReactive<number | undefined> | undefined): number {
  if (value === undefined) {
    return 0;
  }

  const resolved = Number(toValue(value));
  if (!Number.isFinite(resolved)) {
    return 0;
  }

  return Math.max(0, resolved);
}

export function useTooltipTrigger(
  options: UseTooltipTriggerOptions,
  state: TooltipTriggerStateLike,
  refValue: MaybeReactive<HTMLElement | null | undefined>
): UseTooltipTriggerResult {
  const tooltipId = useId(undefined, "v-aria-tooltip");
  const isHovered = ref(false);
  const isFocused = ref(false);
  const showTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

  const clearShowTimeout = (): void => {
    if (showTimeout.value !== null) {
      clearTimeout(showTimeout.value);
      showTimeout.value = null;
    }
  };

  const scheduleShow = (): void => {
    clearShowTimeout();
    const delay = resolveDelay(options.delay);
    if (delay <= 0) {
      handleShow();
      return;
    }

    showTimeout.value = setTimeout(() => {
      showTimeout.value = null;
      handleShow();
    }, delay);
  };

  const handleShow = (): void => {
    if (isHovered.value || isFocused.value) {
      state.open(isFocused.value);
    }
  };

  const handleHide = (immediate?: boolean): void => {
    clearShowTimeout();
    if (!isHovered.value && !isFocused.value) {
      state.close(immediate);
    }
  };

  watchEffect((onCleanup) => {
    if (!state.isOpen.value) {
      return;
    }

    const onKeydown = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && toValue(refValue)) {
        event.stopPropagation();
        state.close(true);
      }
    };

    document.addEventListener("keydown", onKeydown, true);
    onCleanup(() => {
      document.removeEventListener("keydown", onKeydown, true);
    });
  });

  const { hoverProps } = useHover({
    isDisabled: computed(() => resolveBoolean(options.isDisabled, false)),
    onHoverStart: () => {
      if (resolveTrigger(options.trigger) === "focus") {
        return;
      }

      isHovered.value = true;
      scheduleShow();
    },
    onHoverEnd: () => {
      if (resolveTrigger(options.trigger) === "focus") {
        return;
      }

      isFocused.value = false;
      isHovered.value = false;
      handleHide();
    },
  });

  const { focusProps } = useFocus({
    isDisabled: computed(() => resolveBoolean(options.isDisabled, false)),
    onFocus: () => {
      isFocused.value = true;
      clearShowTimeout();
      handleShow();
    },
    onBlur: () => {
      isFocused.value = false;
      isHovered.value = false;
      handleHide(true);
    },
  });

  const onPressStart = (): void => {
    if (!resolveBoolean(options.shouldCloseOnPress, true)) {
      return;
    }

    clearShowTimeout();
    isFocused.value = false;
    isHovered.value = false;
    handleHide(true);
  };

  if (getCurrentScope()) {
    onScopeDispose(() => {
      clearShowTimeout();
    });
  }

  return {
    triggerProps: computed(() => ({
      "aria-describedby": state.isOpen.value ? tooltipId.value : undefined,
      ...mergeProps(focusProps, hoverProps, {
        onPointerdown: onPressStart,
        onKeydown: onPressStart,
      }),
      tabIndex: undefined,
    })),
    tooltipProps: computed(() => ({
      id: tooltipId.value,
    })),
  };
}
