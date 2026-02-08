import { computed, toValue, watchEffect } from "vue";
import type { MaybeReactive } from "@vue-aria/types";

export interface UsePreventScrollOptions {
  isDisabled?: MaybeReactive<boolean | undefined>;
}

let preventScrollCount = 0;
let restore: (() => void) | null = null;

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

function setStyle(
  element: HTMLElement,
  property: "overflow" | "paddingRight" | "scrollbarGutter",
  value: string
): () => void {
  const style = element.style as CSSStyleDeclaration & Record<string, string>;
  const previous = style[property] ?? "";
  style[property] = value;

  return () => {
    style[property] = previous;
  };
}

function preventScrollStandard(): () => void {
  const documentElement = document.documentElement;
  const cleanups: Array<() => void> = [];
  const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

  if (scrollbarWidth > 0) {
    if ("scrollbarGutter" in documentElement.style) {
      cleanups.push(setStyle(documentElement, "scrollbarGutter", "stable"));
    } else {
      cleanups.push(
        setStyle(documentElement, "paddingRight", `${scrollbarWidth}px`)
      );
    }
  }

  cleanups.push(setStyle(documentElement, "overflow", "hidden"));

  return () => {
    for (let index = cleanups.length - 1; index >= 0; index -= 1) {
      cleanups[index]?.();
    }
  };
}

export function usePreventScroll(options: UsePreventScrollOptions = {}): void {
  const isDisabled = computed(() => resolveBoolean(options.isDisabled));

  watchEffect((onCleanup) => {
    if (typeof document === "undefined" || isDisabled.value) {
      return;
    }

    preventScrollCount += 1;
    if (preventScrollCount === 1) {
      restore = preventScrollStandard();
    }

    onCleanup(() => {
      preventScrollCount = Math.max(0, preventScrollCount - 1);
      if (preventScrollCount === 0 && restore) {
        const restoreScroll = restore;
        restore = null;
        restoreScroll();
      }
    });
  });
}
