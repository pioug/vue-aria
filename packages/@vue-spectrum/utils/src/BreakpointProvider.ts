import {
  computed,
  defineComponent,
  getCurrentInstance,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  readonly,
  ref,
  type PropType,
} from "vue";
import type { ReadonlyRef } from "@vue-aria/types";
import { useIsSSR } from "@vue-aria/ssr";

export interface Breakpoints {
  [custom: string]: number | undefined;
}

export interface BreakpointContextValue {
  matchedBreakpoints: string[];
}

const BREAKPOINT_CONTEXT_SYMBOL: unique symbol = Symbol("vue-spectrum-breakpoint-context");

function queryMatches(query: string): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia(query).matches;
}

function getBreakpointMatches(breakpoints: Breakpoints): string[] {
  const entries = Object.entries(breakpoints)
    .filter((entry): entry is [string, number] => typeof entry[1] === "number")
    .sort(([, valueA], [, valueB]) => valueB - valueA);
  const breakpointQueries = entries.map(([, value]) => `(min-width: ${value}px)`);

  const matched: string[] = [];
  for (let index = 0; index < breakpointQueries.length; index += 1) {
    if (queryMatches(breakpointQueries[index])) {
      matched.push(entries[index][0]);
    }
  }

  matched.push("base");
  return matched;
}

function sameBreakpoints(a: string[], b: string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) {
      return false;
    }
  }

  return true;
}

export const BreakpointProvider = defineComponent({
  name: "BreakpointProvider",
  props: {
    matchedBreakpoints: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },
  setup(props, { slots }) {
    const context = computed<BreakpointContextValue>(() => ({
      matchedBreakpoints: props.matchedBreakpoints,
    }));
    provide(BREAKPOINT_CONTEXT_SYMBOL, context);

    return () => slots.default?.();
  },
});

export function useMatchedBreakpoints(
  breakpoints: Breakpoints
): ReadonlyRef<readonly string[]> {
  const isSSR = useIsSSR();
  const matchedBreakpoints = ref<string[]>(getBreakpointMatches(breakpoints));

  if (getCurrentInstance()) {
    const onResize = (): void => {
      const nextMatches = getBreakpointMatches(breakpoints);
      if (!sameBreakpoints(matchedBreakpoints.value, nextMatches)) {
        matchedBreakpoints.value = nextMatches;
      }
    };

    onMounted(() => {
      onResize();
      if (typeof window !== "undefined") {
        window.addEventListener("resize", onResize);
      }
    });

    onBeforeUnmount(() => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", onResize);
      }
    });
  }

  return readonly(
    computed(() => (isSSR.value ? ["base"] : [...matchedBreakpoints.value]))
  );
}

export function useBreakpoint(): ReadonlyRef<BreakpointContextValue> | null {
  return inject<ReadonlyRef<BreakpointContextValue> | null>(
    BREAKPOINT_CONTEXT_SYMBOL,
    null
  );
}
