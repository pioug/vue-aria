import type { TooltipTriggerState } from "@vue-stately/tooltip";
import { getInteractionModality, isFocusVisible, useFocusable, useHover } from "@vue-aria/interactions";
import { mergeProps, useId } from "@vue-aria/utils";
import { getCurrentInstance, onBeforeUnmount, watchEffect } from "vue";

export interface TooltipTriggerProps {
  isDisabled?: boolean;
  trigger?: "focus";
  shouldCloseOnPress?: boolean;
}

export interface TooltipTriggerAria {
  triggerProps: Record<string, unknown>;
  tooltipProps: Record<string, unknown>;
}

export function useTooltipTrigger(
  props: TooltipTriggerProps,
  state: TooltipTriggerState,
  ref: { current: Element | null } = { current: null }
): TooltipTriggerAria {
  const { isDisabled, trigger, shouldCloseOnPress = true } = props;
  const tooltipId = useId();
  const isHovered = { current: false };
  const isFocused = { current: false };

  const handleShow = () => {
    if (isHovered.current || isFocused.current) {
      state.open(isFocused.current);
    }
  };

  const handleHide = (immediate?: boolean) => {
    if (!isHovered.current && !isFocused.current) {
      state.close(immediate);
    }
  };

  const onKeydownDocument = (event: KeyboardEvent) => {
    if (ref.current && event.key === "Escape") {
      event.stopPropagation();
      state.close(true);
    }
  };

  watchEffect((onCleanup) => {
    if (state.isOpen) {
      document.addEventListener("keydown", onKeydownDocument, true);
      onCleanup(() => {
        document.removeEventListener("keydown", onKeydownDocument, true);
      });
    }
  });

  if (getCurrentInstance()) {
    onBeforeUnmount(() => {
      document.removeEventListener("keydown", onKeydownDocument, true);
    });
  }

  const onHoverStart = () => {
    if (trigger === "focus") {
      return;
    }
    isHovered.current = getInteractionModality() === "pointer";
    handleShow();
  };

  const onHoverEnd = () => {
    if (trigger === "focus") {
      return;
    }
    isFocused.current = false;
    isHovered.current = false;
    handleHide();
  };

  const onPressStart = () => {
    if (!shouldCloseOnPress) {
      return;
    }
    isFocused.current = false;
    isHovered.current = false;
    handleHide(true);
  };

  const onFocus = () => {
    const isVisible = isFocusVisible();
    if (isVisible) {
      isFocused.current = true;
      handleShow();
    }
  };

  const onBlur = () => {
    isFocused.current = false;
    isHovered.current = false;
    handleHide(true);
  };

  const { hoverProps } = useHover({
    isDisabled,
    onHoverStart,
    onHoverEnd,
  });
  const { focusableProps } = useFocusable(
    {
      isDisabled,
      onFocus,
      onBlur,
    },
    ref as any
  );

  return {
    triggerProps: {
      "aria-describedby": state.isOpen ? tooltipId : undefined,
      ...mergeProps(focusableProps, hoverProps, {
        onPointerdown: onPressStart,
        onMousedown: onPressStart,
        onKeydown: onPressStart,
      }),
      tabIndex: undefined,
    },
    tooltipProps: {
      id: tooltipId,
    },
  };
}
