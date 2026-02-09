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

export const MOBILE_SCREEN_WIDTH = 700;

export function useIsMobileDevice(): ReadonlyRef<boolean> {
  const isSSR = useIsSSR();
  const isMobile = ref(false);

  const update = (): void => {
    if (typeof window === "undefined") {
      isMobile.value = false;
      return;
    }

    isMobile.value = window.screen.width <= MOBILE_SCREEN_WIDTH;
  };

  update();

  if (getCurrentInstance() && typeof window !== "undefined") {
    onMounted(() => {
      update();
      window.addEventListener("resize", update);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", update);
    });
  }

  return readonly(computed(() => (!isSSR.value && isMobile.value)));
}
