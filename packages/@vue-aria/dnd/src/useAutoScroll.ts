import { getCurrentScope, onScopeDispose, toValue, watchEffect } from "vue";
import type { MaybeReactive } from "@vue-aria/types";

const AUTOSCROLL_AREA_SIZE = 20;

export interface AutoScrollAria {
  move(x: number, y: number): void;
  stop(): void;
}

function isScrollable(element: Element): boolean {
  const style = window.getComputedStyle(element);
  const overflowY = style.overflowY;
  const overflowX = style.overflowX;
  return /(auto|scroll)/.test(overflowY) || /(auto|scroll)/.test(overflowX);
}

function getScrollParent(element: Element): Element {
  let parent = element.parentElement;
  while (parent && parent !== document.body) {
    if (isScrollable(parent)) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return document.scrollingElement ?? document.documentElement;
}

export function useAutoScroll(
  targetRef: MaybeReactive<Element | null | undefined>
): AutoScrollAria {
  let scrollable: Element | null = null;
  let canScrollX = true;
  let canScrollY = true;

  const state = {
    timer: null as number | null,
    dx: 0,
    dy: 0,
  };

  const clearTimer = () => {
    if (state.timer != null) {
      cancelAnimationFrame(state.timer);
      state.timer = null;
    }
  };

  const scroll = () => {
    if (!scrollable) {
      state.timer = null;
      return;
    }

    if (canScrollX) {
      scrollable.scrollLeft += state.dx;
    }
    if (canScrollY) {
      scrollable.scrollTop += state.dy;
    }

    if (state.timer != null) {
      state.timer = requestAnimationFrame(scroll);
    }
  };

  const setup = () => {
    const target = toValue(targetRef);
    if (!target) {
      scrollable = null;
      return;
    }

    scrollable = isScrollable(target) ? target : getScrollParent(target);
    const style = window.getComputedStyle(scrollable);
    canScrollX = /(auto|scroll)/.test(style.overflowX);
    canScrollY = /(auto|scroll)/.test(style.overflowY);
  };

  if (getCurrentScope()) {
    watchEffect(() => {
      setup();
    });
    onScopeDispose(clearTimer);
  } else {
    setup();
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", clearTimer, { once: true });
    }
  }

  return {
    move(x, y) {
      if (!scrollable) {
        return;
      }

      const rect = scrollable.getBoundingClientRect();
      const left = AUTOSCROLL_AREA_SIZE;
      const top = AUTOSCROLL_AREA_SIZE;
      const bottom = rect.height - AUTOSCROLL_AREA_SIZE;
      const right = rect.width - AUTOSCROLL_AREA_SIZE;

      state.dx = 0;
      state.dy = 0;

      if (x < left || x > right || y < top || y > bottom) {
        if (x < left) {
          state.dx = x - left;
        } else if (x > right) {
          state.dx = x - right;
        }

        if (y < top) {
          state.dy = y - top;
        } else if (y > bottom) {
          state.dy = y - bottom;
        }

        if (state.timer == null) {
          state.timer = requestAnimationFrame(scroll);
        }
      } else {
        clearTimer();
      }
    },
    stop() {
      clearTimer();
    },
  };
}
