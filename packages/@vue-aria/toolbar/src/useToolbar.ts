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
  const {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    orientation = "horizontal" as Orientation,
  } = props;

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

    event.stopPropagation();
    event.preventDefault();
  };

  const onBlur = (event: FocusEvent & { currentTarget: EventTarget | null; relatedTarget: EventTarget | null }) => {
    const currentTarget = event.currentTarget as Element | null;
    const target = event.target as Element | null;
    const relatedTarget = event.relatedTarget as Element | null;
    if (!currentTarget || !target) {
      return;
    }

    if (!nodeContains(currentTarget, relatedTarget) && !lastFocused.value) {
      lastFocused.value = target;
    }
  };

  const onFocus = (event: FocusEvent & { currentTarget: EventTarget | null; relatedTarget: EventTarget | null }) => {
    const currentTarget = event.currentTarget as Element | null;
    const target = event.target as Element | null;
    const relatedTarget = event.relatedTarget as Element | null;
    if (!currentTarget || !target || !refValue.current || !lastFocused.value) {
      return;
    }

    if (!nodeContains(currentTarget, relatedTarget) && nodeContains(refValue.current, target)) {
      lastFocused.value?.focus();
      lastFocused.value = null;
    }
  };

  const onKeydownCapture = (event: KeyboardEvent) => {
    if (isToolbarContainer(refValue.current)) {
      return;
    }
    onKeyDown(event);
  };

  const onFocusCapture = (
    event: FocusEvent & { currentTarget: EventTarget | null; relatedTarget: EventTarget | null }
  ) => {
    if (isToolbarContainer(refValue.current)) {
      return;
    }
    onFocus(event);
  };

  const onBlurCapture = (
    event: FocusEvent & { currentTarget: EventTarget | null; relatedTarget: EventTarget | null }
  ) => {
    if (isToolbarContainer(refValue.current)) {
      return;
    }
    onBlur(event);
  };

  const toolbarProps: Record<string, unknown> = {
    ...filterDOMProps(props, { labelable: true }),
    onKeydownCapture,
    onFocusCapture,
    onBlurCapture,
    "aria-label": ariaLabel,
    "aria-orientation": orientation,
    "aria-labelledby": ariaLabel == null ? ariaLabelledBy : undefined,
  };

  Object.defineProperty(toolbarProps, "role", {
    enumerable: true,
    configurable: true,
    get: () => (isToolbarContainer(refValue.current) ? "group" : "toolbar"),
  });

  return { toolbarProps };
}
