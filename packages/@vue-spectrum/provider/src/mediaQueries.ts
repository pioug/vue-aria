import { computed, onScopeDispose, ref } from "vue";
import type { ReadonlyRef } from "@vue-aria/types";
import type { ColorScheme, Scale, Theme } from "./types";

export function useMediaQuery(query: string): ReadonlyRef<boolean> {
  const matchesRef = ref(false);

  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return computed(() => matchesRef.value);
  }

  const mediaQueryList = window.matchMedia(query);
  matchesRef.value = mediaQueryList.matches;
  const onChange = (event: MediaQueryListEvent) => {
    matchesRef.value = event.matches;
  };

  if (typeof mediaQueryList.addEventListener === "function") {
    mediaQueryList.addEventListener("change", onChange);
    onScopeDispose(() => mediaQueryList.removeEventListener("change", onChange));
  } else {
    mediaQueryList.addListener(onChange);
    onScopeDispose(() => mediaQueryList.removeListener(onChange));
  }

  return computed(() => matchesRef.value);
}

export function useColorScheme(theme: Theme, defaultColorScheme: ColorScheme): ReadonlyRef<ColorScheme> {
  const matchesDark = useMediaQuery("(prefers-color-scheme: dark)");
  const matchesLight = useMediaQuery("(prefers-color-scheme: light)");

  return computed(() => {
    if (theme.dark && matchesDark.value) {
      return "dark";
    }

    if (theme.light && matchesLight.value) {
      return "light";
    }

    if (theme.dark && defaultColorScheme === "dark") {
      return "dark";
    }

    if (theme.light && defaultColorScheme === "light") {
      return "light";
    }

    if (!theme.dark) {
      return "light";
    }

    if (!theme.light) {
      return "dark";
    }

    return "light";
  });
}

export function useScale(theme: Theme): ReadonlyRef<Scale> {
  const matchesFinePointer = useMediaQuery("(any-pointer: fine)");

  return computed(() => {
    if (matchesFinePointer.value && theme.medium) {
      return "medium";
    }

    if (theme.large) {
      return "large";
    }

    return "medium";
  });
}
