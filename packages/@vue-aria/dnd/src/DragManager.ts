import { readonly, shallowRef } from "vue";
import type { ReadonlyRef } from "@vue-aria/types";
import type { DropOperation, DropTarget, DragTypes } from "./types";

export interface DragSession {
  [key: string]: unknown;
}

export interface RegisteredDropTarget {
  element: HTMLElement;
  preventFocusOnDrop?: boolean;
  getDropOperation?: (
    types: Set<string> | DragTypes,
    allowedOperations: DropOperation[]
  ) => DropOperation;
}

export interface RegisteredDropItem {
  element: HTMLElement;
  target: DropTarget;
  getDropOperation?: (
    types: Set<string> | DragTypes,
    allowedOperations: DropOperation[]
  ) => DropOperation;
}

const dragSession = shallowRef<DragSession | null>(null);
const dropTargets = new Map<HTMLElement, RegisteredDropTarget>();
const dropItems = new Map<HTMLElement, RegisteredDropItem>();

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

export function registerDropTarget(target: RegisteredDropTarget): () => void {
  dropTargets.set(target.element, target);
  return () => {
    dropTargets.delete(target.element);
  };
}

export function registerDropItem(item: RegisteredDropItem): () => void {
  dropItems.set(item.element, item);
  return () => {
    dropItems.delete(item.element);
  };
}

export function getRegisteredDropTargets(): ReadonlyMap<HTMLElement, RegisteredDropTarget> {
  return dropTargets;
}

export function getRegisteredDropItems(): ReadonlyMap<HTMLElement, RegisteredDropItem> {
  return dropItems;
}
