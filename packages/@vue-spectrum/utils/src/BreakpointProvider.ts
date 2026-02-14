import { useIsSSR } from "@vue-aria/ssr";
import type { ReadonlyRef } from "@vue-aria/types";
import {
  computed,
  defineComponent,
  inject,
  onMounted,
  onScopeDispose,
  provide,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type PropType,
} from "vue";

export interface Breakpoints {
  S?: number;
  M?: number;
  L?: number;
  [custom: string]: number | undefined;
}

export interface BreakpointContext {
  matchedBreakpoints: string[];
}

const BreakpointContextSymbol = Symbol("vue-spectrum-breakpoint-context");

export const BreakpointProvider = defineComponent({
  name: "BreakpointProvider",
  props: {
    matchedBreakpoints: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },
  setup(props, { slots }) {
    const context = computed<BreakpointContext>(() => ({
      matchedBreakpoints: props.matchedBreakpoints,
    }));
    provide(BreakpointContextSymbol, context);
    return () => slots.default?.();
  },
});

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

export function useMatchedBreakpoints(
  breakpoints: MaybeRefOrGetter<Breakpoints>
): ReadonlyRef<string[]> {
  const isSSR = useIsSSR();
  const supportsMatchMedia = typeof window !== "undefined" && typeof window.matchMedia === "function";

  const getBreakpointHandler = (): string[] => {
    const entries = Object.entries(toValue(breakpoints)).sort(([, valueA], [, valueB]) => (valueB ?? 0) - (valueA ?? 0));
    const matched: string[] = [];
    for (const [key, value] of entries) {
      if (value != null && window.matchMedia(`(min-width: ${value}px)`).matches) {
        matched.push(key);
      }
    }

    matched.push("base");
    return matched;
  };

  const matchedBreakpoints = ref<string[]>(supportsMatchMedia ? getBreakpointHandler() : ["base"]);
  const onResize = () => {
    if (!supportsMatchMedia) {
      return;
    }

    const next = getBreakpointHandler();
    if (!arraysEqual(matchedBreakpoints.value, next)) {
      matchedBreakpoints.value = next;
    }
  };

  onMounted(() => {
    if (!supportsMatchMedia) {
      return;
    }

    window.addEventListener("resize", onResize);
    onScopeDispose(() => {
      window.removeEventListener("resize", onResize);
    });
  });

  watch(
    () => toValue(breakpoints),
    () => {
      onResize();
    },
    { deep: true }
  );

  return computed(() => (isSSR ? ["base"] : matchedBreakpoints.value));
}

export function useBreakpoint(): ReadonlyRef<BreakpointContext> | null {
  return inject<ReadonlyRef<BreakpointContext> | null>(BreakpointContextSymbol, null);
}
