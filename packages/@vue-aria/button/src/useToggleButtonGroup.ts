import { createFocusManager } from "@vue-aria/focus";
import { useLocale } from "@vue-aria/i18n";
import type { ToggleGroupProps, ToggleGroupState } from "@vue-stately/toggle";
import { filterDOMProps, mergeProps, nodeContains } from "@vue-aria/utils";
import { type AriaToggleButtonOptions, type ToggleButtonAria, type ToggleState, useToggleButton } from "./useToggleButton";

type Orientation = "horizontal" | "vertical";
type Key = string | number;

export interface AriaToggleButtonGroupProps extends ToggleGroupProps {
  orientation?: Orientation;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export interface ToggleButtonGroupAria<T = Record<string, unknown>> {
  groupProps: T;
}

export interface AriaToggleButtonGroupItemOptions extends AriaToggleButtonOptions {
  id: Key;
}

export function useToggleButtonGroup(
  props: AriaToggleButtonGroupProps,
  state: ToggleGroupState,
  ref: { current: HTMLElement | null } = { current: null }
): ToggleButtonGroupAria<Record<string, unknown>> {
  const { orientation = "horizontal", isDisabled } = props;
  const locale = useLocale();
  const focusManager = createFocusManager(ref as { current: Element | null });
  const isInToolbar = !!(ref.current && ref.current.parentElement?.closest("[role=\"toolbar\"]"));

  let lastFocused: HTMLElement | null = null;

  const onKeydownCapture = (event: KeyboardEvent & { currentTarget: EventTarget | null; target: EventTarget | null }) => {
    const currentTarget = event.currentTarget as Element | null;
    const target = event.target as Element | null;
    if (!currentTarget || !target || !nodeContains(currentTarget, target)) {
      return;
    }

    const shouldReverse = locale.value.direction === "rtl" && orientation === "horizontal";

    if (
      (orientation === "horizontal" && event.key === "ArrowRight")
      || (orientation === "vertical" && event.key === "ArrowDown")
    ) {
      if (shouldReverse) {
        focusManager.focusPrevious();
      } else {
        focusManager.focusNext();
      }
    } else if (
      (orientation === "horizontal" && event.key === "ArrowLeft")
      || (orientation === "vertical" && event.key === "ArrowUp")
    ) {
      if (shouldReverse) {
        focusManager.focusNext();
      } else {
        focusManager.focusPrevious();
      }
    } else if (event.key === "Tab") {
      event.stopPropagation();
      if (currentTarget.ownerDocument) {
        lastFocused = currentTarget.ownerDocument.activeElement as HTMLElement | null;
      }
      if (event.shiftKey) {
        focusManager.focusFirst();
      } else {
        focusManager.focusLast();
      }
      return;
    } else {
      return;
    }

    event.stopPropagation();
    event.preventDefault();
  };

  const onBlurCapture = (event: FocusEvent & { currentTarget: EventTarget | null; target: EventTarget | null }) => {
    const currentTarget = event.currentTarget as Element | null;
    const target = event.target as HTMLElement | null;
    const relatedTarget = event.relatedTarget as Element | null;
    if (!currentTarget || !target) {
      return;
    }

    if (!nodeContains(currentTarget, relatedTarget) && !lastFocused) {
      lastFocused = target;
    }
  };

  const onFocusCapture = (event: FocusEvent & { currentTarget: EventTarget | null; target: EventTarget | null }) => {
    const currentTarget = event.currentTarget as Element | null;
    const target = event.target as Element | null;
    const relatedTarget = event.relatedTarget as Element | null;
    if (!currentTarget || !target || !ref.current || !lastFocused) {
      return;
    }

    if (!nodeContains(currentTarget, relatedTarget) && nodeContains(ref.current, target)) {
      lastFocused.focus();
      lastFocused = null;
    }
  };

  const role = state.selectionMode === "single"
    ? "radiogroup"
    : (isInToolbar ? "group" : "toolbar");

  return {
    groupProps: mergeProps(
      filterDOMProps(props as Record<string, unknown>, { labelable: true }),
      {
        role,
        "aria-orientation": orientation,
        "aria-disabled": isDisabled,
        onKeydownCapture: !isInToolbar ? onKeydownCapture : undefined,
        onFocusCapture: !isInToolbar ? onFocusCapture : undefined,
        onBlurCapture: !isInToolbar ? onBlurCapture : undefined,
      }
    ),
  };
}

export function useToggleButtonGroupItem(
  props: AriaToggleButtonGroupItemOptions,
  state: ToggleGroupState,
  ref: { current: Element | null } = { current: null }
): ToggleButtonAria<Record<string, unknown>> {
  const { id, ...itemProps } = props;
  const toggleState: ToggleState = {
    get isSelected() {
      return state.selectedKeys.has(id);
    },
    toggle() {
      state.toggleKey(id);
    },
  };

  const { isPressed, isSelected, isDisabled, buttonProps } = useToggleButton(
    {
      ...itemProps,
      isDisabled: props.isDisabled || state.isDisabled,
    },
    toggleState,
    ref
  );

  if (state.selectionMode === "single") {
    buttonProps.role = "radio";
    buttonProps["aria-checked"] = toggleState.isSelected;
    delete buttonProps["aria-pressed"];
  }

  return {
    isPressed,
    isSelected,
    isDisabled,
    buttonProps,
  };
}
