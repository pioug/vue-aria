import { onScopeDispose, readonly, ref } from "vue";
import { willOpenKeyboard } from "./keyboard";
import type { ReadonlyRef } from "@vue-aria/types";

interface ViewportSize {
  width: number;
  height: number;
}

const visualViewport = typeof document !== "undefined" ? window.visualViewport : undefined;

function getViewportSize(): ViewportSize {
  return {
    width: visualViewport ? visualViewport.width * visualViewport.scale : document.documentElement.clientWidth,
    height: visualViewport ? visualViewport.height * visualViewport.scale : document.documentElement.clientHeight,
  };
}

export function useViewportSize(): ReadonlyRef<ViewportSize> {
  const size = ref<ViewportSize>(
    typeof document === "undefined" ? { width: 0, height: 0 } : getViewportSize()
  );

  const updateSize = (nextSize: ViewportSize) => {
    if (nextSize.width === size.value.width && nextSize.height === size.value.height) {
      return;
    }
    size.value = nextSize;
  };

  const onResize = () => {
    if (visualViewport && visualViewport.scale > 1) {
      return;
    }

    updateSize(getViewportSize());
  };

  let frame = 0;

  const onBlur = (e: FocusEvent) => {
    if (visualViewport && visualViewport.scale > 1) {
      return;
    }

    if (e.target instanceof Element && willOpenKeyboard(e.target)) {
      frame = requestAnimationFrame(() => {
        if (!document.activeElement || !willOpenKeyboard(document.activeElement)) {
          updateSize({
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
          });
        }
      });
    }
  };

  if (typeof window !== "undefined") {
    updateSize(getViewportSize());

    window.addEventListener("blur", onBlur, true);

    if (!visualViewport) {
      window.addEventListener("resize", onResize);
    } else {
      visualViewport.addEventListener("resize", onResize);
    }
  }

  onScopeDispose(() => {
    if (typeof window === "undefined") {
      return;
    }

    cancelAnimationFrame(frame);
    window.removeEventListener("blur", onBlur, true);

    if (!visualViewport) {
      window.removeEventListener("resize", onResize);
    } else {
      visualViewport.removeEventListener("resize", onResize);
    }
  });

  return readonly(size) as ReadonlyRef<ViewportSize>;
}
