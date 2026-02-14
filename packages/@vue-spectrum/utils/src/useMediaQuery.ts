import { useIsSSR } from "@vue-aria/ssr";
import type { ReadonlyRef } from "@vue-aria/types";
import { computed, onScopeDispose, ref } from "vue";

export function useMediaQuery(query: string): ReadonlyRef<boolean> {
  const supportsMatchMedia = typeof window !== "undefined" && typeof window.matchMedia === "function";
  const matches = ref<boolean>(supportsMatchMedia ? window.matchMedia(query).matches : false);

  if (supportsMatchMedia) {
    const mediaQueryList = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => {
      matches.value = event.matches;
    };

    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", onChange);
      onScopeDispose(() => {
        mediaQueryList.removeEventListener("change", onChange);
      });
    } else {
      mediaQueryList.addListener(onChange);
      onScopeDispose(() => {
        mediaQueryList.removeListener(onChange);
      });
    }
  }

  const isSSR = useIsSSR();
  return computed(() => (isSSR ? false : matches.value));
}
