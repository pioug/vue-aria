export type Key = string | number;

export type DragItem = { type: string; data?: unknown; kind?: string };
export type DropItem = DragItem & { id?: Key };
export type TextDropItem = DragItem & { kind: "text"; text: string };
export type FileDropItem = DragItem & { kind: "file"; file?: File };
export type DirectoryDropItem = DragItem & { kind: "directory"; children?: DropItem[] };

export type DropOperation = "none" | "copy" | "link" | "move";
export interface DragTypes {
  toArray(): string[];
}

export interface DropTarget {
  id?: Key;
  type?: string;
}
export interface ItemDropTarget extends DropTarget {
  index?: number;
}
export interface RootDropTarget extends DropTarget {}
export interface DropTargetDelegate {
  getDropTargetForPoint?: (x: number, y: number) => DropTarget | null;
}

export type DropPosition = "before" | "after" | "inside";

export interface DragPreviewRenderer {
  getPreview(): HTMLElement | string | null;
}

export interface DragStartEvent {
  keys: Set<Key>;
}
export interface DragMoveEvent {
  keys: Set<Key>;
}
export interface DragEndEvent {
  keys: Set<Key>;
  dropOperation?: DropOperation;
}

export interface DraggableCollectionStartEvent {
  keys: Set<Key>;
}
export interface DraggableCollectionMoveEvent {
  keys: Set<Key>;
}
export interface DraggableCollectionEndEvent {
  keys: Set<Key>;
  dropOperation?: DropOperation;
}

export interface DropEvent {
  dropTarget: DropTarget;
}
export interface DropEnterEvent extends DropEvent {}
export interface DropExitEvent extends DropEvent {}
export interface DropMoveEvent extends DropEvent {}
export interface DropPositionEvent extends DropEvent {}

export interface DroppableCollectionDropEvent extends DropEvent {}
export interface DroppableCollectionEnterEvent extends DropEvent {}
export interface DroppableCollectionExitEvent extends DropEvent {}
export interface DroppableCollectionInsertDropEvent extends DropEvent {}
export interface DroppableCollectionMoveEvent extends DropEvent {}
export interface DroppableCollectionOnItemDropEvent extends DropEvent {}
export interface DroppableCollectionReorderEvent extends DropEvent {
  targetIndex?: number;
}
export interface DroppableCollectionRootDropEvent extends DropEvent {}

export interface DraggableCollectionState {
  dropTarget?: DropTarget | null;
  disabledKeys?: Set<Key>;
  selectionManager?: {
    focusedKey?: Key | null;
    selectedKeys?: Set<Key>;
    isFocused?: boolean;
    selectionMode?: string;
  };
}

export interface DroppableCollectionState {
  disabledKeys?: Set<Key>;
  selectionManager?: {
    isFocused?: boolean;
  };
}
