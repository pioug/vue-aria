import {
  computed,
  getCurrentScope,
  ref,
  toValue,
  watchEffect,
} from "vue";
import type { MaybeReactive, ReadonlyRef } from "@vue-types/shared";

interface DescriptionNodeState {
  refCount: number;
  element: HTMLElement;
}

let descriptionId = 0;
const descriptionNodes = new Map<string, DescriptionNodeState>();

export interface UseDescriptionResult {
  descriptionProps: ReadonlyRef<Record<string, unknown>>;
}

function ensureDescriptionNode(text: string): DescriptionNodeState | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  let state = descriptionNodes.get(text);
  if (!state) {
    const id = `vue-aria-description-${descriptionId++}`;
    const node = document.createElement("div");
    node.id = id;
    node.style.display = "none";
    node.textContent = text;
    document.body.appendChild(node);
    state = { refCount: 0, element: node };
    descriptionNodes.set(text, state);
  }

  state.refCount += 1;
  return state;
}

function releaseDescriptionNode(text: string) {
  const state = descriptionNodes.get(text);
  if (!state) {
    return;
  }

  state.refCount -= 1;
  if (state.refCount <= 0) {
    state.element.remove();
    descriptionNodes.delete(text);
  }
}

export function useDescription(
  description?: MaybeReactive<string | undefined>
): UseDescriptionResult {
  const id = ref<string | undefined>(undefined);

  const update = (text: string | undefined) => {
    if (!text) {
      id.value = undefined;
      return () => {};
    }

    const state = ensureDescriptionNode(text);
    id.value = state?.element.id;
    return () => releaseDescriptionNode(text);
  };

  if (getCurrentScope()) {
    watchEffect((onCleanup) => {
      const text = description === undefined ? undefined : toValue(description);
      const cleanup = update(text);
      onCleanup(cleanup);
    });
  } else {
    const text = description === undefined ? undefined : toValue(description);
    update(text);
  }

  const descriptionProps = computed<Record<string, unknown>>(() => ({
    "aria-describedby": id.value,
  }));

  return { descriptionProps };
}
