import type { Key } from "@vue-aria/types";

export type DragItem = Record<string, string>;

export interface DragTypes {
  has(type: string | symbol): boolean;
}

export interface TextDropItem {
  kind: "text";
  types: Set<string>;
  getText: (type: string) => Promise<string | undefined>;
}

export interface FileDropItem {
  kind: "file";
  type: string;
  name: string;
  getText: () => Promise<string>;
  getFile: () => Promise<File>;
}

export interface DirectoryDropItem {
  kind: "directory";
  name: string;
  getEntries: () => AsyncIterable<FileDropItem | DirectoryDropItem>;
}

export type DropItem = TextDropItem | FileDropItem | DirectoryDropItem;

export type DropOperation = "cancel" | "copy" | "move" | "link";
export type DropPosition = "before" | "on" | "after";

export interface ItemDropTarget {
  type: "item";
  key: Key;
  dropPosition: DropPosition;
}

export interface RootDropTarget {
  type: "root";
}

export type DropTarget = ItemDropTarget | RootDropTarget;

export interface CollectionNode<T = unknown> {
  type: string;
  key: Key;
  value: T;
  level: number;
  hasChildNodes: boolean;
  childNodes: Iterable<CollectionNode<T>>;
  rendered: unknown;
  textValue: string;
  index: number;
  parentKey: Key | null;
  nextKey?: Key | null;
  prevKey?: Key | null;
}

export interface Collection<T = unknown> extends Iterable<CollectionNode<T>> {
  getItem(key: Key): CollectionNode<T> | null;
  getKeyAfter(key: Key): Key | null;
  getKeyBefore(key: Key): Key | null;
}

export interface KeyboardDelegate {
  getFirstKey?: () => Key | null;
  getLastKey?: () => Key | null;
  getKeyAbove?: (key: Key) => Key | null;
  getKeyBelow?: (key: Key) => Key | null;
  getKeyLeftOf?: (key: Key) => Key | null;
  getKeyRightOf?: (key: Key) => Key | null;
}

export type Orientation = "horizontal" | "vertical";
export type Direction = "ltr" | "rtl";

export interface DropTargetDelegate {
  getDropTargetFromPoint: (
    x: number,
    y: number,
    isValidDropTarget: (target: DropTarget) => boolean
  ) => DropTarget;
}
