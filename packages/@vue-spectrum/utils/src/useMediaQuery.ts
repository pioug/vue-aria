import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  readonly,
  ref,
} from "vue";
import type { ReadonlyRef } from "@vue-aria/types";
import { useIsSSR } from "@vue-aria/ssr";

interface MediaQueryListLike {
  matches: boolean;
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  addEventListener?: (
    type: "change",
    listener: (event: MediaQueryListEvent) => void
  ) => void;
  removeEventListener?: (
    type: "change",
    listener: (event: MediaQueryListEvent) => void
  ) => void;
}

function getMediaQueryList(query: string): MediaQueryListLike | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }

  return window.matchMedia(query);
}

export function useMediaQuery(query: string): ReadonlyRef<boolean> {
  const isSSR = useIsSSR();
  const matches = ref(false);
  let mediaQueryList = getMediaQueryList(query);
  if (mediaQueryList) {
    matches.value = mediaQueryList.matches;
  }

  if (getCurrentInstance()) {
    const listener = (event: MediaQueryListEvent): void => {
      matches.value = event.matches;
    };

    onMounted(() => {
      mediaQueryList = getMediaQueryList(query);
      if (!mediaQueryList) {
        return;
      }

      matches.value = mediaQueryList.matches;
      if (typeof mediaQueryList.addEventListener === "function") {
        mediaQueryList.addEventListener("change", listener);
        return;
      }

      mediaQueryList.addListener?.(listener);
    });

    onBeforeUnmount(() => {
      if (!mediaQueryList) {
        return;
      }

      if (typeof mediaQueryList.removeEventListener === "function") {
        mediaQueryList.removeEventListener("change", listener);
        return;
      }

      mediaQueryList.removeListener?.(listener);
    });
  }

  return readonly(computed(() => (isSSR.value ? false : matches.value)));
}
