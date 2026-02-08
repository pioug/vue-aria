import { shallowRef } from "vue";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type {
  DropItem,
  DropOperation,
  DropTarget,
  DragTypes,
} from "./types";

export interface DragTargetSession {
  element?: unknown;
  items: Array<Record<string, string>>;
  allowedDropOperations: DropOperation[];
  onDragEnd?: (event: {
    type: "dragend";
    x: number;
    y: number;
    dropOperation: DropOperation;
  }) => void;
}

export interface DragSession {
  dragTarget?: DragTargetSession;
  [key: string]: unknown;
}

export interface RegisteredDropTarget {
  element: HTMLElement;
  preventFocusOnDrop?: boolean;
  activateButtonRef?: MaybeReactive<HTMLElement | null | undefined>;
  getDropOperation?: (
    types: Set<string> | DragTypes,
    allowedOperations: DropOperation[]
  ) => DropOperation;
  onDropEnter?: (
    event: { type: "dropenter"; x: number; y: number },
    dragTarget: DragTargetSession
  ) => void;
  onDropExit?: (event: { type: "dropexit"; x: number; y: number }) => void;
  onDropTargetEnter?: (target: DropTarget | null) => void;
  onDropActivate?: (
    event: { type: "dropactivate"; x: number; y: number },
    target: DropTarget | null
  ) => void;
  onDrop?: (
    event: { type: "drop"; x: number; y: number; items: DropItem[]; dropOperation: DropOperation },
    target: DropTarget | null
  ) => void;
  onKeyDown?: (event: KeyboardEvent, dragTarget: DragTargetSession) => void;
}

export interface RegisteredDropItem {
  element: HTMLElement;
  target: DropTarget;
  activateButtonRef?: MaybeReactive<HTMLElement | null | undefined>;
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
  return dragSession as ReadonlyRef<DragSession | null>;
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
