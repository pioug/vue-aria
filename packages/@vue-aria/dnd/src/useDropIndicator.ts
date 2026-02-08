import { computed } from "vue";
import type { Key, MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import { useId } from "@vue-aria/ssr";
import type { Collection, DropTarget } from "./types";
import { useDragSession } from "./DragManager";
import { getDroppableCollectionId } from "./utils";
import type { DroppableItemState } from "./useDroppableItem";
import { useDroppableItem } from "./useDroppableItem";

export interface DropIndicatorProps {
  target: DropTarget;
  activateButtonRef?: MaybeReactive<HTMLElement | null | undefined>;
}

export interface DropIndicatorState extends DroppableItemState {
  collection: Collection;
}

export interface DropIndicatorAria {
  dropIndicatorProps: ReadonlyRef<Record<string, unknown>>;
  isDropTarget: ReadonlyRef<boolean>;
  isHidden: ReadonlyRef<boolean>;
}

function formatDropOnItem(itemText: string): string {
  return `Drop on ${itemText}`;
}

function formatInsertBefore(itemText: string): string {
  return `Insert before ${itemText}`;
}

function formatInsertAfter(itemText: string): string {
  return `Insert after ${itemText}`;
}

function formatInsertBetween(beforeItemText: string, afterItemText: string): string {
  return `Insert between ${beforeItemText} and ${afterItemText}`;
}

function getCollectionText(state: DropIndicatorState, key: Key | null): string {
  if (key == null) {
    return "";
  }

  return state.collection.getItem(key)?.textValue ?? "";
}

export function useDropIndicator(
  props: DropIndicatorProps,
  state: DropIndicatorState,
  ref: MaybeReactive<HTMLElement | null | undefined>
): DropIndicatorAria {
  const { target } = props;
  const dragSession = useDragSession();
  const { dropProps, isDropTarget } = useDroppableItem(props, state, ref);
  const id = useId(undefined, "v-aria-drop-indicator");

  const label = computed(() => {
    if (target.type === "root") {
      return "Drop on";
    }

    if (target.dropPosition === "on") {
      return formatDropOnItem(getCollectionText(state, target.key));
    }

    let before: Key | null | undefined;
    let after: Key | null | undefined;

    if (target.dropPosition === "before") {
      const previousKey = state.collection.getItem(target.key)?.prevKey;
      const previousNode = previousKey != null ? state.collection.getItem(previousKey) : null;
      before = previousNode?.type === "item" ? previousNode.key : null;
    } else {
      before = target.key;
    }

    if (target.dropPosition === "after") {
      const nextKey = state.collection.getItem(target.key)?.nextKey;
      const nextNode = nextKey != null ? state.collection.getItem(nextKey) : null;
      after = nextNode?.type === "item" ? nextNode.key : null;
    } else {
      after = target.key;
    }

    if (before != null && after != null) {
      return formatInsertBetween(
        getCollectionText(state, before),
        getCollectionText(state, after)
      );
    }

    if (before != null) {
      return formatInsertAfter(getCollectionText(state, before));
    }

    if (after != null) {
      return formatInsertBefore(getCollectionText(state, after));
    }

    return "";
  });

  const labelledBy = computed(() => {
    if (target.type !== "root") {
      return undefined;
    }

    return `${id.value} ${getDroppableCollectionId(state)}`;
  });

  const ariaHidden = computed<string | undefined>(() => {
    if (!dragSession.value) {
      return "true";
    }

    return dropProps.value["aria-hidden"] as string | undefined;
  });

  return {
    dropIndicatorProps: computed<Record<string, unknown>>(() => ({
      ...dropProps.value,
      id: id.value,
      "aria-roledescription": "drop indicator",
      "aria-label": label.value,
      "aria-labelledby": labelledBy.value,
      "aria-hidden": ariaHidden.value,
      tabIndex: -1,
    })),
    isDropTarget,
    isHidden: computed(() => !isDropTarget.value && Boolean(ariaHidden.value)),
  };
}
