import { computed, toValue } from "vue";
import type { MaybeReactive } from "@vue-aria/types";
import { formatScopedIdPrefix, useSSRContext } from "./ssrProvider";

const counters = new Map<string, number>();

function nextGlobalId(prefix: string): string {
  const next = (counters.get(prefix) ?? 0) + 1;
  counters.set(prefix, next);
  return `${prefix}-${next}`;
}

export function useId(
  explicitId?: MaybeReactive<string | undefined>,
  prefix = "v-aria"
) {
  const context = useSSRContext();
  let fallbackId: string | null = null;
  const getFallbackId = () => {
    if (fallbackId !== null) {
      return fallbackId;
    }

    if (context) {
      context.current += 1;
      const scopedPrefix = formatScopedIdPrefix(prefix, context);
      fallbackId = `${scopedPrefix}-${context.current}`;
      return fallbackId;
    }

    fallbackId = nextGlobalId(prefix);
    return fallbackId;
  };

  return computed(() => {
    if (explicitId === undefined) {
      return getFallbackId();
    }
    return toValue(explicitId) ?? getFallbackId();
  });
}
