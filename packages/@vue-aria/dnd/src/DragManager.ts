import { readonly, shallowRef } from "vue";
import type { ReadonlyRef } from "@vue-aria/types";

export interface DragSession {
  [key: string]: unknown;
}

const dragSession = shallowRef<DragSession | null>(null);

export function beginDragging(session: DragSession = {}): void {
  dragSession.value = session;
}

export function endDragging(): void {
  dragSession.value = null;
}

export function useDragSession(): ReadonlyRef<DragSession | null> {
  return readonly(dragSession);
}

export function isVirtualDragging(): boolean {
  return dragSession.value != null;
}
