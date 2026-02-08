import type { Key } from "@vue-aria/types";

export interface CollectionItem<T = unknown> {
  type: "item";
  key: Key;
  textValue: string;
  value?: T;
  isDisabled?: boolean;
}

export interface CollectionSection<T = unknown> {
  type: "section";
  key: Key;
  heading?: string;
  children: CollectionItem<T>[];
}

export type CollectionNode<T = unknown> = CollectionItem<T> | CollectionSection<T>;

export interface CollectionItemInput<T = unknown> {
  key: Key;
  textValue?: string;
  value?: T;
  isDisabled?: boolean;
}

export interface CollectionSectionInput<T = unknown> {
  type?: "section";
  key: Key;
  heading?: string;
  children: Iterable<CollectionItemInput<T>>;
}

export type CollectionInput<T = unknown> =
  | CollectionItemInput<T>
  | CollectionSectionInput<T>;

export interface BuiltCollection<T = unknown> {
  nodes: CollectionNode<T>[];
  items: CollectionItem<T>[];
  getItem: (key: Key) => CollectionItem<T> | undefined;
  getSection: (key: Key) => CollectionSection<T> | undefined;
  getKeyAfter: (key: Key) => Key | null;
  getKeyBefore: (key: Key) => Key | null;
  getFirstKey: () => Key | null;
  getLastKey: () => Key | null;
}
