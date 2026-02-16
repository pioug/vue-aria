import { createFocusManager } from "@vue-aria/focus";
import { useLocale } from "@vue-aria/i18n";
import { filterDOMProps, nodeContains } from "@vue-aria/utils";
import type { ListState } from "@vue-stately/list";
import type { Key } from "@vue-aria/collections";

type Orientation = "horizontal" | "vertical";
type SelectionMode = "none" | "single" | "multiple";

const BUTTON_GROUP_ROLES: Record<SelectionMode, "toolbar" | "radiogroup"> = {
  none: "toolbar",
  single: "radiogroup",
  multiple: "toolbar",
};

export interface AriaActionGroupProps<T> {
  isDisabled?: boolean;
  orientation?: Orientation;
  selectionMode?: SelectionMode;
  [key: string]: unknown;
}

export interface ActionGroupAria {
  actionGroupProps: Record<string, unknown>;
}

export function useActionGroup<T>(
  props: AriaActionGroupProps<T>,
  state: ListState<T>,
  refValue: { current: Element | null }
): ActionGroupAria {
  let { isDisabled, orientation = "horizontal" as Orientation } = props;

  const collection = state.collection as { getKeys?: () => Iterable<unknown> };
  const allKeys = [...(collection.getKeys?.() ?? [])] as Key[];
  if (!allKeys.some((key) => !state.disabledKeys.has(key))) {
    isDisabled = true;
  }

  const locale = useLocale();
  const focusManager = createFocusManager(refValue);
  const flipDirection = locale.value.direction === "rtl" && orientation === "horizontal";

  const onKeyDown = (event: KeyboardEvent) => {
    if (!nodeContains(event.currentTarget as Node | null, event.target as Node | null)) {
      return;
    }

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        event.stopPropagation();
        if (event.key === "ArrowRight" && flipDirection) {
          focusManager.focusPrevious({ wrap: true });
        } else {
          focusManager.focusNext({ wrap: true });
        }
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        event.stopPropagation();
        if (event.key === "ArrowLeft" && flipDirection) {
          focusManager.focusNext({ wrap: true });
        } else {
          focusManager.focusPrevious({ wrap: true });
        }
        break;
    }
  };

  const getRole = (): "toolbar" | "radiogroup" | "group" | undefined => {
    let role: "toolbar" | "radiogroup" | "group" | undefined =
      BUTTON_GROUP_ROLES[state.selectionManager.selectionMode as SelectionMode];
    const isInToolbar = !!(refValue.current && refValue.current.parentElement?.closest('[role="toolbar"]'));
    if (isInToolbar && role === "toolbar") {
      role = "group";
    }

    return role;
  };

  const actionGroupProps: Record<string, unknown> = {
    ...filterDOMProps(props, { labelable: true }),
    "aria-disabled": isDisabled,
    onKeydown: onKeyDown,
    onKeyDown,
  };
  Object.defineProperty(actionGroupProps, "role", {
    enumerable: true,
    configurable: true,
    get: getRole,
  });
  Object.defineProperty(actionGroupProps, "aria-orientation", {
    enumerable: true,
    configurable: true,
    get: () => (getRole() === "toolbar" ? orientation : undefined),
  });

  return {
    actionGroupProps,
  };
}
