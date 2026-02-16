import {
  createFocusManager,
  getFocusableTreeWalker,
} from "@vue-aria/focus";
import { useLocale } from "@vue-aria/i18n";
import { usePress } from "@vue-aria/interactions";
import { mergeProps, nodeContains } from "@vue-aria/utils";
import type {
  DateFieldState,
  DatePickerState,
  DateRangePickerState,
} from "@vue-stately/datepicker";
import type { DOMAttributes, RefObject } from "./types";

export function useDatePickerGroup(
  state: DatePickerState | DateRangePickerState | DateFieldState,
  ref: RefObject<Element>,
  disableArrowNavigation?: boolean
): DOMAttributes {
  const locale = useLocale();
  const focusManager = createFocusManager(ref as any);

  const onKeyDown = (event: KeyboardEvent & { target: EventTarget | null }) => {
    if (!nodeContains(event.currentTarget as Node, event.target as Node | null)) {
      return;
    }

    if (
      event.altKey
      && (event.key === "ArrowDown" || event.key === "ArrowUp")
      && "setOpen" in state
    ) {
      event.preventDefault();
      event.stopPropagation();
      (state as DatePickerState | DateRangePickerState).setOpen(true);
    }

    if (disableArrowNavigation) {
      return;
    }

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        event.stopPropagation();
        if (locale.value.direction === "rtl") {
          if (ref.current && event.target) {
            const target = event.target as Element;
            const previous = findNextSegment(
              ref.current,
              target.getBoundingClientRect().left,
              -1
            );
            previous?.focus();
          }
        } else {
          focusManager.focusPrevious();
        }
        break;
      case "ArrowRight":
        event.preventDefault();
        event.stopPropagation();
        if (locale.value.direction === "rtl") {
          if (ref.current && event.target) {
            const target = event.target as Element;
            const next = findNextSegment(
              ref.current,
              target.getBoundingClientRect().left,
              1
            );
            next?.focus();
          }
        } else {
          focusManager.focusNext();
        }
        break;
    }
  };

  const focusLast = () => {
    if (!ref.current) {
      return;
    }

    let target = (window.event?.target ?? null) as HTMLElement | null;
    const walker = getFocusableTreeWalker(ref.current, { tabbable: true });
    if (target) {
      walker.currentNode = target;
      target = walker.previousNode() as HTMLElement | null;
    }

    if (!target) {
      let last: HTMLElement | null;
      do {
        last = walker.lastChild() as HTMLElement | null;
        if (last) {
          target = last;
        }
      } while (last);
    }

    while (target?.hasAttribute("data-placeholder")) {
      const previous = walker.previousNode() as HTMLElement | null;
      if (previous && previous.hasAttribute("data-placeholder")) {
        target = previous;
      } else {
        break;
      }
    }

    target?.focus();
  };

  const { pressProps } = usePress({
    preventFocusOnPress: true,
    allowTextSelectionOnPress: true,
    onPressStart(event) {
      if (event.pointerType === "mouse") {
        focusLast();
      }
    },
    onPress(event) {
      if (event.pointerType === "touch" || event.pointerType === "pen") {
        focusLast();
      }
    },
  });

  return mergeProps(pressProps, { onKeyDown }) as DOMAttributes;
}

function findNextSegment(group: Element, fromX: number, direction: number) {
  const walker = getFocusableTreeWalker(group, { tabbable: true });
  let node = walker.nextNode() as HTMLElement | null;
  let closest: HTMLElement | null = null;
  let closestDistance = Infinity;

  while (node) {
    const x = node.getBoundingClientRect().left;
    const distance = x - fromX;
    const absoluteDistance = Math.abs(distance);
    if (Math.sign(distance) === direction && absoluteDistance < closestDistance) {
      closest = node;
      closestDistance = absoluteDistance;
    }
    node = walker.nextNode() as HTMLElement | null;
  }

  return closest;
}
