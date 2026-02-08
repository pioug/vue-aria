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
