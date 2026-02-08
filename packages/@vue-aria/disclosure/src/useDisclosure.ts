import { computed, toValue, watchEffect } from "vue";
import { useId, useIsSSR } from "@vue-aria/ssr";
import type { MaybeReactive, PointerType, ReadonlyRef } from "@vue-aria/types";
import type { UseDisclosureStateResult } from "./useDisclosureState";

export interface DisclosurePressEvent {
  pointerType: PointerType;
}

export interface UseDisclosureOptions {
  isDisabled?: MaybeReactive<boolean | undefined>;
  isExpanded?: MaybeReactive<boolean | undefined>;
  defaultExpanded?: MaybeReactive<boolean | undefined>;
  onExpandedChange?: (isExpanded: boolean) => void;
}

export interface UseDisclosureResult {
  buttonProps: ReadonlyRef<Record<string, unknown>>;
  panelProps: ReadonlyRef<Record<string, unknown>>;
}

function resolveBoolean(value: MaybeReactive<boolean | undefined> | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  return Boolean(toValue(value));
}

function attachBeforeMatch(
  panel: HTMLElement,
  onBeforeMatch: () => void
): () => void {
  const handler = () => {
    onBeforeMatch();
  };

  panel.addEventListener("beforematch", handler as EventListener);
  return () => {
    panel.removeEventListener("beforematch", handler as EventListener);
  };
}

export function useDisclosure(
  options: UseDisclosureOptions,
  state: UseDisclosureStateResult,
  panelRef: MaybeReactive<HTMLElement | null | undefined>
): UseDisclosureResult {
  const isDisabled = computed(() => resolveBoolean(options.isDisabled));
  const triggerId = useId(undefined, "v-aria-disclosure-trigger");
  const panelId = useId(undefined, "v-aria-disclosure-panel");
  const isSSR = useIsSSR();

  const toggleExpanded = () => {
    if (isDisabled.value) {
      return;
    }

    state.toggle();
  };

  watchEffect((onCleanup) => {
    const panel = toValue(panelRef);
    if (!panel) {
      return;
    }

    if (state.isExpanded.value) {
      panel.removeAttribute("hidden");
    } else {
      panel.setAttribute("hidden", "until-found");
    }

    const detach = attachBeforeMatch(panel, () => {
      if (isDisabled.value) {
        return;
      }

      state.setExpanded(true);
    });

    onCleanup(detach);
  });

  const buttonProps = computed<Record<string, unknown>>(() => ({
    id: triggerId.value,
    "aria-expanded": state.isExpanded.value,
    "aria-controls": panelId.value,
    isDisabled: isDisabled.value || undefined,
    onPress: (event: DisclosurePressEvent) => {
      if (event.pointerType !== "keyboard") {
        toggleExpanded();
      }
    },
    onPressStart: (event: DisclosurePressEvent) => {
      if (event.pointerType === "keyboard") {
        toggleExpanded();
      }
    },
  }));

  const panelProps = computed<Record<string, unknown>>(() => ({
    id: panelId.value,
    role: "group",
    "aria-labelledby": triggerId.value,
    "aria-hidden": !state.isExpanded.value,
    hidden: isSSR.value ? !state.isExpanded.value : undefined,
  }));

  return {
    buttonProps,
    panelProps,
  };
}
