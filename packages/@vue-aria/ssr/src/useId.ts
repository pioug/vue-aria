import { computed, toValue } from "vue";
import type { MaybeReactive } from "@vue-aria/types";

const counters = new Map<string, number>();

function nextId(prefix: string): string {
  const next = (counters.get(prefix) ?? 0) + 1;
  counters.set(prefix, next);
  return `${prefix}-${next}`;
}

export function useId(
  explicitId?: MaybeReactive<string | undefined>,
  prefix = "v-aria"
) {
  const fallbackId = nextId(prefix);

  return computed(() => {
    if (explicitId === undefined) {
      return fallbackId;
    }
    return toValue(explicitId) ?? fallbackId;
  });
}
