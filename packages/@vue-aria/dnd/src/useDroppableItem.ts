import { computed, toValue, watchEffect } from "vue";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { DragTypes, DropOperation, DropTarget } from "./types";
import {
  getDroppableCollectionRef,
  getTypes,
  globalDndState,
  isInternalDropOperation,
} from "./utils";
import {
  registerDropItem,
  useDragSession,
} from "./DragManager";
import { useVirtualDrop } from "./useVirtualDrop";

export interface DroppableItemOptions {
  target: DropTarget;
  activateButtonRef?: MaybeReactive<HTMLElement | null | undefined>;
}

export interface DroppableItemGetOperationOptions {
  target: DropTarget;
  types: Set<string> | DragTypes;
  allowedOperations: DropOperation[];
  isInternal: boolean;
  draggingKeys: Set<string | number>;
}

export interface DroppableItemState {
  getDropOperation: (options: DroppableItemGetOperationOptions) => DropOperation;
  isDropTarget: (target: DropTarget) => boolean;
}

export interface DroppableItemResult {
  dropProps: ReadonlyRef<Record<string, unknown>>;
  isDropTarget: ReadonlyRef<boolean>;
}

interface DragSessionLike {
  dragTarget?: {
    items: Array<Record<string, string>>;
    allowedDropOperations: DropOperation[];
  };
}

export function useDroppableItem(
  options: DroppableItemOptions,
  state: DroppableItemState,
  ref: MaybeReactive<HTMLElement | null | undefined>
): DroppableItemResult {
  const { dropProps } = useVirtualDrop();
  const dragSession = useDragSession();
  const droppableCollectionRef = getDroppableCollectionRef(state);

  watchEffect((onCleanup) => {
    const element = toValue(ref);
    if (!element) {
      return;
    }

    const unregister = registerDropItem({
      element,
      target: options.target,
      getDropOperation: (types, allowedOperations) =>
        state.getDropOperation({
          target: options.target,
          types,
          allowedOperations,
          isInternal: isInternalDropOperation(droppableCollectionRef),
          draggingKeys: globalDndState.draggingKeys ?? new Set(),
        }),
      activateButtonRef: options.activateButtonRef,
    });

    onCleanup(unregister);
  });

  const isValidDropTarget = computed(() => {
    const session = dragSession.value as DragSessionLike | null;
    if (!session?.dragTarget) {
      return true;
    }

    return (
      state.getDropOperation({
        target: options.target,
        types: getTypes(session.dragTarget.items),
        allowedOperations: session.dragTarget.allowedDropOperations,
        isInternal: isInternalDropOperation(droppableCollectionRef),
        draggingKeys: globalDndState.draggingKeys ?? new Set(),
      }) !== "cancel"
    );
  });

  const isDropTarget = computed(() => state.isDropTarget(options.target));

  watchEffect(() => {
    if (!dragSession.value || !isDropTarget.value) {
      return;
    }

    const element = toValue(ref);
    element?.focus();
  });

  return {
    dropProps: computed<Record<string, unknown>>(() => ({
      ...dropProps.value,
      "aria-hidden":
        !dragSession.value || isValidDropTarget.value ? undefined : "true",
    })),
    isDropTarget,
  };
}
