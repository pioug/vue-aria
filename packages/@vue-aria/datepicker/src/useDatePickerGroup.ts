import { computed, toValue } from "vue";
import { usePress } from "@vue-aria/interactions";
import { useLocale } from "@vue-aria/i18n";
import { mergeProps } from "@vue-aria/utils";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { DatePickerGroupState } from "./types";

export interface UseDatePickerGroupResult {
  groupProps: ReadonlyRef<Record<string, unknown>>;
}

const FOCUSABLE_SELECTOR = [
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  "input:not([disabled])",
  "button:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "a[href]",
].join(",");

function getFocusableElements(root: Element): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hidden && element.getAttribute("aria-hidden") !== "true"
  );
}

function focusLastSegment(root: Element | null | undefined) {
  if (!root) {
    return;
  }

  const focusable = getFocusableElements(root);
  if (focusable.length === 0) {
    return;
  }

  let target: HTMLElement | undefined;
  for (let index = focusable.length - 1; index >= 0; index -= 1) {
    const candidate = focusable[index];
    if (!candidate.hasAttribute("data-placeholder")) {
      target = candidate;
      break;
    }
    target = candidate;
  }

  target?.focus();
}

function createFocusManager(rootRef: MaybeReactive<Element | null | undefined>) {
  const focusAt = (index: number): boolean => {
    const root = toValue(rootRef);
    if (!root) {
      return false;
    }

    const elements = getFocusableElements(root);
    if (elements.length === 0) {
      return false;
    }

    const safeIndex = Math.max(0, Math.min(index, elements.length - 1));
    const target = elements[safeIndex];
    target?.focus();
    return document.activeElement === target;
  };

  const focusRelative = (step: 1 | -1): boolean => {
    const root = toValue(rootRef);
    if (!root) {
      return false;
    }

    const elements = getFocusableElements(root);
    if (elements.length === 0) {
      return false;
    }

    const active = document.activeElement as HTMLElement | null;
    const currentIndex = active ? elements.findIndex((item) => item === active) : -1;
    const nextIndex =
      currentIndex < 0
        ? step > 0
          ? 0
          : elements.length - 1
        : currentIndex + step;

    if (nextIndex < 0 || nextIndex >= elements.length) {
      return false;
    }

    const target = elements[nextIndex];
    target?.focus();
    return document.activeElement === target;
  };

  return {
    focusFirst: () => focusAt(0),
    focusNext: () => focusRelative(1),
    focusPrevious: () => focusRelative(-1),
  };
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }
  return Boolean(toValue(value));
}

function isEventInGroup(event: KeyboardEvent): boolean {
  if (!(event.currentTarget instanceof Element)) {
    return true;
  }
  if (!(event.target instanceof Node)) {
    return false;
  }
  return event.currentTarget.contains(event.target);
}

export function useDatePickerGroup(
  state: DatePickerGroupState,
  groupRef: MaybeReactive<Element | null | undefined>,
  disableArrowNavigation?: MaybeReactive<boolean | undefined>
): UseDatePickerGroupResult {
  const locale = useLocale();
  const focusManager = createFocusManager(groupRef);

  const onKeydown = (event: KeyboardEvent) => {
    if (!isEventInGroup(event)) {
      return;
    }

    if (
      event.altKey &&
      (event.key === "ArrowDown" || event.key === "ArrowUp") &&
      typeof state.setOpen === "function"
    ) {
      event.preventDefault();
      event.stopPropagation();
      state.setOpen(true);
      return;
    }

    if (resolveBoolean(disableArrowNavigation)) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      event.stopPropagation();
      if (locale.value.direction === "rtl") {
        focusManager.focusNext();
      } else {
        focusManager.focusPrevious();
      }
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      event.stopPropagation();
      if (locale.value.direction === "rtl") {
        focusManager.focusPrevious();
      } else {
        focusManager.focusNext();
      }
    }
  };

  const { pressProps } = usePress({
    onPressStart: (event) => {
      if (event.pointerType === "mouse") {
        focusLastSegment(toValue(groupRef));
      }
    },
    onPress: (event) => {
      if (event.pointerType === "touch" || event.pointerType === "pen") {
        focusLastSegment(toValue(groupRef));
      }
    },
  });

  const groupProps = computed<Record<string, unknown>>(() =>
    mergeProps(pressProps, {
      onKeydown,
    })
  );

  return {
    groupProps,
  };
}
