import { computed, getCurrentInstance, onBeforeUnmount, onMounted, readonly, ref, toValue } from "vue";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { SpectrumColorScheme, SpectrumScale, SpectrumTheme } from "./types";

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

function pickFirstThemeKey(theme: SpectrumTheme, keys: string[], fallback: string): string {
  for (const key of keys) {
    if (theme[key]) {
      return key;
    }
  }

  return fallback;
}

export function useMediaQuery(query: string): ReadonlyRef<boolean | null> {
  const matches = ref<boolean | null>(null);

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

  return readonly(matches);
}

export function useColorScheme(
  theme: MaybeReactive<SpectrumTheme>,
  defaultColorScheme: MaybeReactive<SpectrumColorScheme | undefined> = "light"
): ReadonlyRef<string> {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const prefersLight = useMediaQuery("(prefers-color-scheme: light)");

  return computed(() => {
    const themeValue = toValue(theme);

    if (prefersDark.value && themeValue.dark) {
      return "dark";
    }

    if (prefersLight.value && themeValue.light) {
      return "light";
    }

    const defaultValue = toValue(defaultColorScheme) ?? "light";
    if (themeValue[defaultValue]) {
      return defaultValue;
    }

    const alternate = defaultValue === "dark" ? "light" : "dark";
    if (themeValue[alternate]) {
      return alternate;
    }

    return pickFirstThemeKey(themeValue, ["light", "dark"], defaultValue);
  });
}

export function useScale(theme: MaybeReactive<SpectrumTheme>): ReadonlyRef<string> {
  const coarsePointer = useMediaQuery("(any-pointer: coarse)");

  return computed(() => {
    const themeValue = toValue(theme);

    if (coarsePointer.value && themeValue.large) {
      return "large";
    }

    if (themeValue.medium) {
      return "medium";
    }

    if (themeValue.large) {
      return "large";
    }

    return pickFirstThemeKey(themeValue, ["medium", "large"], "medium");
  });
}
