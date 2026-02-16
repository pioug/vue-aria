import { ref } from "vue";
import { createFocusManager } from "@vue-aria/focus";
import { filterDOMProps, nodeContains } from "@vue-aria/utils";
import { useLocale } from "@vue-aria/i18n";

type Orientation = "horizontal" | "vertical";

interface AriaLabelingProps {
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export interface AriaToolbarProps extends AriaLabelingProps {
  orientation?: Orientation;
  [key: string]: unknown;
}

export interface ToolbarAria {
  toolbarProps: Record<string, unknown>;
}

function isToolbarContainer(element: Element | null): boolean {
  return !!(element && element.parentElement?.closest('[role="toolbar"]'));
}

export function useToolbar(
  props: AriaToolbarProps,
  refValue: { current: Element | null }
): ToolbarAria {
  const { "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, orientation = "horizontal" as Orientation } = props;

  const locale = useLocale();
  const shouldReverse = locale.value.direction === "rtl" && orientation === "horizontal";
  const focusManager = createFocusManager(refValue as { current: Element | null });
  const lastFocused = ref<HTMLElement | null>(null);

  const onKeyDown = (event: KeyboardEvent) => {
    if (!nodeContains(event.currentTarget as Node | null, event.target as Node | null)) {
      return;
    }

    if (
      (orientation === "horizontal" && event.key === "ArrowRight") ||
      (orientation === "vertical" && event.key === "ArrowDown")
    ) {
      if (shouldReverse) {
        focusManager.focusPrevious();
      } else {
        focusManager.focusNext();
      }
    } else if (
      (orientation === "horizontal" && event.key === "ArrowLeft") ||
      (orientation === "vertical" && event.key === "ArrowUp")
    ) {
      if (shouldReverse) {
        focusManager.focusNext();
      } else {
        focusManager.focusPrevious();
      }
    } else if (event.key === "Tab") {
      event.stopPropagation();
      lastFocused.value = document.activeElement as HTMLElement | null;
      if (event.shiftKey) {
        focusManager.focusFirst();
      } else {
        focusManager.focusLast();
      }
      return;
    } else {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  };

  const onBlur = (event: FocusEvent & { currentTarget: EventTarget | null; relatedTarget: EventTarget | null }) => {
    if (!nodeContains(event.currentTarget as Node | null, event.relatedTarget as Node | null) && !lastFocused.value) {
      lastFocused.value = event.target as HTMLElement | null;
    }
  };

  const onFocus = (event: FocusEvent & { currentTarget: EventTarget | null; relatedTarget: EventTarget | null }) => {
    if (lastFocused.value && !nodeContains(event.currentTarget as Node | null, event.relatedTarget as Node | null) && refValue.current && nodeContains(refValue.current, event.target as Node | null)) {
      lastFocused.value?.focus();
      lastFocused.value = null;
    }
  };

  const toolbarProps: Record<string, unknown> = {
    ...filterDOMProps(props, { labelable: true }),
    onKeydown: onKeyDown,
    onKeyDown: onKeyDown,
    onKeyDownCapture: onKeyDown,
    onBlur: onBlur,
    onBlurCapture: onBlur,
    onFocus: onFocus,
    onFocusCapture: onFocus,
    "aria-label": ariaLabel,
    "aria-orientation": orientation,
    "aria-labelledby": ariaLabel == null ? ariaLabelledBy : undefined,
  };

  Object.defineProperty(toolbarProps, "role", {
    enumerable: true,
    configurable: true,
    get: () => (isToolbarContainer(refValue.current) ? "group" : "toolbar"),
  });

  Object.defineProperty(toolbarProps, "onKeydown", {
    enumerable: true,
    configurable: true,
    get: () => (isToolbarContainer(refValue.current) ? undefined : onKeyDown),
  });

  Object.defineProperty(toolbarProps, "onFocus", {
    enumerable: true,
    configurable: true,
    get: () => (isToolbarContainer(refValue.current) ? undefined : onFocus),
  });

  Object.defineProperty(toolbarProps, "onBlur", {
    enumerable: true,
    configurable: true,
    get: () => (isToolbarContainer(refValue.current) ? undefined : onBlur),
  });

  return { toolbarProps };
}
