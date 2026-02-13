import { readonly, ref, watch, watchEffect, type Ref } from "vue";
import type { ReadonlyRef } from "@vue-aria/types";

function useAnimation(
  elementRef: Ref<HTMLElement | null | undefined>,
  isActive: Ref<boolean>,
  onEnd: () => void
): void {
  watchEffect((onCleanup) => {
    const element = elementRef.value;
    if (!isActive.value || !element) {
      return;
    }

    if (!("getAnimations" in element)) {
      onEnd();
      return;
    }

    const animations = element.getAnimations();
    if (animations.length === 0) {
      onEnd();
      return;
    }

    let canceled = false;
    Promise.all(animations.map((animation) => animation.finished))
      .then(() => {
        if (!canceled) {
          onEnd();
        }
      })
      .catch(() => {});

    onCleanup(() => {
      canceled = true;
    });
  }, { flush: "post" });
}

export function useEnterAnimation(
  elementRef: Ref<HTMLElement | null | undefined>,
  isReady = true
): ReadonlyRef<boolean> {
  const isEntering = ref(true);
  const isAnimationReady = ref(isEntering.value && isReady);

  watch(
    [isEntering, () => isReady],
    ([entering, ready]) => {
      isAnimationReady.value = entering && ready;
    },
    { immediate: true }
  );

  watchEffect(() => {
    if (isAnimationReady.value && elementRef.value && "getAnimations" in elementRef.value) {
      for (const animation of elementRef.value.getAnimations()) {
        if (animation instanceof CSSTransition) {
          animation.cancel();
        }
      }
    }
  }, { flush: "post" });

  useAnimation(elementRef, isAnimationReady, () => {
    isEntering.value = false;
  });

  return readonly(isAnimationReady) as ReadonlyRef<boolean>;
}

export function useExitAnimation(
  elementRef: Ref<HTMLElement | null | undefined>,
  isOpen: Ref<boolean>
): ReadonlyRef<boolean> {
  const exitState = ref<"closed" | "open" | "exiting">(isOpen.value ? "open" : "closed");

  watch(isOpen, (open) => {
    if (exitState.value === "open" && !open) {
      exitState.value = "exiting";
    } else if ((exitState.value === "closed" || exitState.value === "exiting") && open) {
      exitState.value = "open";
    }
  }, { immediate: true });

  const isExiting = ref(exitState.value === "exiting");

  watch(exitState, (state) => {
    isExiting.value = state === "exiting";
  }, { immediate: true });

  useAnimation(elementRef, isExiting, () => {
    if (exitState.value === "exiting") {
      exitState.value = "closed";
    }
  });

  return readonly(isExiting) as ReadonlyRef<boolean>;
}
