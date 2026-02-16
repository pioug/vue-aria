import type {
  DragItem,
  DirectoryDropItem,
  FileDropItem,
  TextDropItem,
  DroppableCollectionState,
  DropTarget,
  DropTargetDelegate,
  DraggableCollectionState
} from "./types";

export const droppableCollectionMap = new WeakMap<DraggableCollectionState, {state: DroppableCollectionState; delegate?: DropTargetDelegate; items?: unknown[]}>();

export const DIRECTORY_DRAG_TYPE = Symbol("directory");

let globalState = {
  draggingKeys: new Set<string>(),
  dragTarget: null as DropTarget | null,
  dragTypes: new Set<string>(),
  dropEffect: "none" as "none" | "copy" | "link" | "move",
};

export function getDroppableCollectionId(state: DraggableCollectionState): string {
  return String(state?.dropTarget?.id ?? Math.random());
}

export function getDroppableCollectionRef(state: DraggableCollectionState): { current: HTMLElement | null } {
  return { current: null };
}

export function getTypes(items: DragItem[]): Set<string> {
  return new Set(items.map((item) => item.type));
}

let dragModality = "mouse";
export function getDragModality() {
  return dragModality;
}

export function useDragModality(): string {
  return dragModality;
}

export function setDragModality(mode: string) {
  dragModality = mode;
}

export function writeToDataTransfer(dataTransfer: DataTransfer, items: DragItem[]): void {
  if (!dataTransfer) return;
  if (items.length) {
    dataTransfer.setData("application/json", JSON.stringify(items));
  }
}

export class DragTypes {
  private items: Set<string>;
  constructor(types?: Iterable<string>) {
    this.items = new Set(types);
  }
  toArray() {
    return Array.from(this.items);
  }
}

export function readFromDataTransfer(dataTransfer: DataTransfer): DragItem[] {
  const text = dataTransfer.getData("application/json");
  if (!text) return [];
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}

export function isTextDropItem(dropItem: DragItem): dropItem is TextDropItem {
  return dropItem.kind === "text";
}

export function isFileDropItem(dropItem: DragItem): dropItem is FileDropItem {
  return dropItem.kind === "file";
}

export function isDirectoryDropItem(dropItem: DragItem): dropItem is DirectoryDropItem {
  return dropItem.kind === "directory";
}

export function getGlobalDropState() {
  return globalState;
}

export function setDraggingKeys(keys: Set<string>) {
  globalState.draggingKeys = keys;
}

export function setGlobalDnDState(state: {draggingKeys?: Set<string>; dragTarget?: DropTarget | null}) {
  globalState = {
    draggingKeys: state.draggingKeys ? new Set(Array.from(state.draggingKeys).map(String)) : globalState.draggingKeys,
    dragTarget: state.dragTarget ?? globalState.dragTarget,
    dragTypes: globalState.dragTypes,
    dropEffect: globalState.dropEffect,
  };
}

export function clearGlobalDnDState() {
  globalState = {
    draggingKeys: new Set(),
    dragTarget: null,
    dragTypes: new Set(),
    dropEffect: "none",
  };
}

export function isInternalDropOperation(_ref?: unknown) {
  return false;
}
