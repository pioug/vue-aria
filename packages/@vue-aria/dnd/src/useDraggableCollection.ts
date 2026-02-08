import { toValue } from "vue";
import type { MaybeReactive } from "@vue-aria/types";
import type { DraggableCollectionStateLike } from "./types";
import { globalDndState, setDraggingCollectionRef } from "./utils";

export interface DraggableCollectionOptions {}

export function useDraggableCollection(
  _props: DraggableCollectionOptions,
  state: DraggableCollectionStateLike,
  ref: MaybeReactive<HTMLElement | null | undefined>
): void {
  const currentElement = toValue(ref);
  const trackedElement =
    globalDndState.draggingCollectionRef == null
      ? null
      : toValue(globalDndState.draggingCollectionRef);

  if (state.draggingKeys.size > 0 && trackedElement !== currentElement) {
    setDraggingCollectionRef(ref);
  }
}
