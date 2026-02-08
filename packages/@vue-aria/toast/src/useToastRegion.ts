import { onScopeDispose, ref, toValue, watch } from "vue";
import { useFocusWithin, useHover } from "@vue-aria/interactions";
import { announce } from "@vue-aria/live-announcer";
import { mergeProps } from "@vue-aria/utils";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { QueuedToast, UseToastStateResult } from "@vue-aria/toast-state";

export interface UseToastRegionOptions {
  "aria-label"?: MaybeReactive<string | undefined>;
}

export interface UseToastRegionResult {
  regionProps: ReadonlyRef<Record<string, unknown>>;
}

function getToastNodes(region: HTMLElement | null): HTMLElement[] {
  if (!region) {
    return [];
  }

  return Array.from(region.querySelectorAll("[role='alertdialog']")) as HTMLElement[];
}

function focusWithoutScrolling(element: HTMLElement | null): void {
  if (!element || !element.isConnected) {
    return;
  }

  try {
    element.focus({ preventScroll: true });
  } catch {
    element.focus();
  }
}

function resolveLabel<T>(
  options: UseToastRegionOptions,
  visibleToasts: readonly QueuedToast<T>[]
): string {
  const explicitLabel = options["aria-label"];
  if (explicitLabel !== undefined) {
    return (explicitLabel as string | undefined) ?? "Notifications";
  }

  const count = visibleToasts.length;
  if (count <= 0) {
    return "Notifications";
  }

  return count === 1 ? "1 notification" : `${count} notifications`;
}

export function useToastRegion<T>(
  options: UseToastRegionOptions,
  state: Pick<
    UseToastStateResult<T>,
    "visibleToasts" | "pauseAll" | "resumeAll"
  >,
  regionRef: MaybeReactive<HTMLElement | null | undefined>
): UseToastRegionResult {
  const isHovered = ref(false);
  const isFocusedWithin = ref(false);
  const focusedToastIndex = ref<number>(-1);
  const lastFocusedElement = ref<HTMLElement | null>(null);

  const syncTimers = (): void => {
    if (isHovered.value || isFocusedWithin.value) {
      state.pauseAll();
      return;
    }

    state.resumeAll();
  };

  const { hoverProps } = useHover({
    onHoverStart: () => {
      isHovered.value = true;
      syncTimers();
    },
    onHoverEnd: () => {
      isHovered.value = false;
      syncTimers();
    },
  });

  const { focusWithinProps } = useFocusWithin({
    onFocusWithin: (event) => {
      isFocusedWithin.value = true;
      lastFocusedElement.value =
        event.relatedTarget instanceof HTMLElement ? event.relatedTarget : null;
      syncTimers();
    },
    onBlurWithin: () => {
      isFocusedWithin.value = false;
      syncTimers();
    },
  });

  const restoreExternalFocus = (): void => {
    focusWithoutScrolling(lastFocusedElement.value);
    lastFocusedElement.value = null;
  };

  watch(
    () => state.visibleToasts.value.map((toast) => toast.key),
    (keys, previousKeys) => {
      const currentRegion = toValue(regionRef) ?? null;
      const previousKeyList = previousKeys ?? [];

      if (keys.length === 0) {
        restoreExternalFocus();
        focusedToastIndex.value = -1;
        return;
      }

      if (
        focusedToastIndex.value >= 0 &&
        previousKeyList.length > focusedToastIndex.value
      ) {
        const previousFocusedKey = previousKeyList[focusedToastIndex.value];
        if (previousFocusedKey && !keys.includes(previousFocusedKey)) {
          const fallbackIndex = Math.min(focusedToastIndex.value, keys.length - 1);
          const nodes = getToastNodes(currentRegion);
          focusWithoutScrolling(nodes[fallbackIndex] ?? nodes[nodes.length - 1] ?? null);
        }
      }
    },
    {
      immediate: true,
      flush: "sync",
    }
  );

  watch(
    () => state.visibleToasts.value.length,
    (count, previousCount) => {
      if (count === previousCount) {
        return;
      }

      if (count > 0) {
        announce(count === 1 ? "1 notification" : `${count} notifications`, "polite", 1000);
      }
    },
    {
      immediate: false,
      flush: "sync",
    }
  );

  onScopeDispose(() => {
    restoreExternalFocus();
  });

  const regionProps = ref<Record<string, unknown>>({});
  watch(
    () => [state.visibleToasts.value, toValue(regionRef)] as const,
    () => {
      regionProps.value = mergeProps(hoverProps, focusWithinProps, {
        role: "region",
        "aria-label": resolveLabel(options, state.visibleToasts.value),
        tabIndex: -1,
        "data-react-aria-top-layer": true,
        onFocus: (event: FocusEvent) => {
          const target = (event.target as HTMLElement | null)?.closest("[role='alertdialog']");
          const nodes = getToastNodes(toValue(regionRef) ?? null);
          focusedToastIndex.value = target ? nodes.findIndex((node) => node === target) : -1;
        },
        onBlur: () => {
          focusedToastIndex.value = -1;
        },
      });
    },
    {
      immediate: true,
      deep: true,
      flush: "sync",
    }
  );

  return {
    regionProps,
  };
}
