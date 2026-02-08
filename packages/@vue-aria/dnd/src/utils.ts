import { CUSTOM_DRAG_TYPE, GENERIC_TYPE, NATIVE_DRAG_TYPES } from "./constants";
import { toValue } from "vue";
import type {
  DirectoryDropItem,
  DragItem,
  DragTypes as IDragTypes,
  DropItem,
  FileDropItem,
  GlobalDndState,
  TextDropItem,
} from "./types";
import type { MaybeReactive } from "@vue-aria/types";

interface DataTransferItemLike {
  kind: string;
  type: string;
  getAsFile: () => File | null;
  webkitGetAsEntry?: () => FileSystemEntryLike | null;
}

interface FileSystemEntryLike {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
}

interface FileSystemFileEntryLike extends FileSystemEntryLike {
  isFile: true;
  isDirectory: false;
  file: (success: (file: File) => void, error?: (reason: unknown) => void) => void;
}

interface FileSystemDirectoryReaderLike {
  readEntries: (
    success: (entries: FileSystemEntryLike[]) => void,
    error?: (reason: unknown) => void
  ) => void;
}

interface FileSystemDirectoryEntryLike extends FileSystemEntryLike {
  isFile: false;
  isDirectory: true;
  createReader: () => FileSystemDirectoryReaderLike;
}

export const DIRECTORY_DRAG_TYPE: symbol = Symbol("DIRECTORY_DRAG_TYPE");
const DROPPABLE_COLLECTION_ERROR = "Droppable item outside a droppable collection";

interface DroppableCollectionRegistration {
  id: string;
  ref: MaybeReactive<HTMLElement | null | undefined>;
}

const droppableCollectionMap = new WeakMap<object, DroppableCollectionRegistration>();

export function registerDroppableCollection(
  state: object,
  id: string,
  ref: MaybeReactive<HTMLElement | null | undefined>
): void {
  droppableCollectionMap.set(state, { id, ref });
}

export function getDroppableCollectionId(state: object): string {
  const registration = droppableCollectionMap.get(state);
  if (!registration) {
    throw new Error(DROPPABLE_COLLECTION_ERROR);
  }

  return registration.id;
}

export function getDroppableCollectionRef(
  state: object
): MaybeReactive<HTMLElement | null | undefined> {
  const registration = droppableCollectionMap.get(state);
  if (!registration) {
    throw new Error(DROPPABLE_COLLECTION_ERROR);
  }

  return registration.ref;
}

export function getTypes(items: DragItem[]): Set<string> {
  const types = new Set<string>();
  for (const item of items) {
    for (const type of Object.keys(item)) {
      types.add(type);
    }
  }

  return types;
}

function getDataTransferItems(dataTransfer: DataTransfer): DataTransferItemLike[] {
  return Array.from(dataTransfer.items as unknown as Iterable<DataTransferItemLike>);
}

function isFileSystemFileEntry(entry: FileSystemEntryLike): entry is FileSystemFileEntryLike {
  return entry.isFile === true;
}

function isFileSystemDirectoryEntry(
  entry: FileSystemEntryLike
): entry is FileSystemDirectoryEntryLike {
  return entry.isDirectory === true;
}

function getDataTransferTypes(dataTransfer: DataTransfer): string[] {
  return Array.from(dataTransfer.types as unknown as Iterable<string>);
}

export function writeToDataTransfer(dataTransfer: DataTransfer, items: DragItem[]): void {
  const groupedByType = new Map<string, string[]>();
  let needsCustomData = false;
  const customData: Array<Record<string, string>> = [];

  for (const item of items) {
    const types = Object.keys(item);
    if (types.length > 1) {
      needsCustomData = true;
    }

    const dataByType: Record<string, string> = {};
    for (const type of types) {
      let typeItems = groupedByType.get(type);
      if (!typeItems) {
        typeItems = [];
        groupedByType.set(type, typeItems);
      } else {
        needsCustomData = true;
      }

      const data = item[type];
      dataByType[type] = data;
      typeItems.push(data);
    }

    customData.push(dataByType);
  }

  for (const [type, typeItems] of groupedByType) {
    if (NATIVE_DRAG_TYPES.has(type)) {
      dataTransfer.items.add(typeItems.join("\n"), type);
    } else {
      dataTransfer.items.add(typeItems[0], type);
    }
  }

  if (needsCustomData) {
    dataTransfer.items.add(JSON.stringify(customData), CUSTOM_DRAG_TYPE);
  }
}

export class DragTypes implements IDragTypes {
  private readonly types: Set<string>;
  private readonly includesUnknownTypes: boolean;

  constructor(dataTransfer: DataTransfer) {
    this.types = new Set<string>();

    let hasFiles = false;
    for (const item of getDataTransferItems(dataTransfer)) {
      if (item.type === CUSTOM_DRAG_TYPE) {
        continue;
      }

      if (item.kind === "file") {
        hasFiles = true;
      }

      if (item.type) {
        this.types.add(item.type);
      } else {
        this.types.add(GENERIC_TYPE);
      }
    }

    this.includesUnknownTypes = !hasFiles && getDataTransferTypes(dataTransfer).includes("Files");
  }

  has(type: string | symbol): boolean {
    if (
      this.includesUnknownTypes ||
      (type === DIRECTORY_DRAG_TYPE && this.types.has(GENERIC_TYPE))
    ) {
      return true;
    }

    return typeof type === "string" && this.types.has(type);
  }
}

export function readFromDataTransfer(dataTransfer: DataTransfer | null | undefined): DropItem[] {
  const items: DropItem[] = [];
  if (!dataTransfer) {
    return items;
  }

  let hasCustomType = false;
  if (getDataTransferTypes(dataTransfer).includes(CUSTOM_DRAG_TYPE)) {
    try {
      const data = dataTransfer.getData(CUSTOM_DRAG_TYPE);
      const parsed = JSON.parse(data) as Array<Record<string, string>>;
      for (const item of parsed) {
        items.push({
          kind: "text",
          types: new Set(Object.keys(item)),
          getText: (type) => Promise.resolve(item[type]),
        });
      }

      hasCustomType = true;
    } catch {
      // Ignore malformed custom data and fall back to native extraction.
    }
  }

  if (!hasCustomType) {
    const stringItems = new Map<string, string>();

    for (const item of getDataTransferItems(dataTransfer)) {
      if (item.kind === "string") {
        stringItems.set(item.type || GENERIC_TYPE, dataTransfer.getData(item.type));
      } else if (item.kind === "file") {
        if (typeof item.webkitGetAsEntry === "function") {
          const entry = item.webkitGetAsEntry();
          if (!entry) {
            continue;
          }

          if (isFileSystemFileEntry(entry)) {
            const file = item.getAsFile();
            if (file) {
              items.push(createFileItem(file));
            }
          } else if (isFileSystemDirectoryEntry(entry)) {
            items.push(createDirectoryItem(entry));
          }
        } else {
          const file = item.getAsFile();
          if (file) {
            items.push(createFileItem(file));
          }
        }
      }
    }

    if (stringItems.size > 0) {
      items.push({
        kind: "text",
        types: new Set(stringItems.keys()),
        getText: (type) => Promise.resolve(stringItems.get(type)),
      });
    }
  }

  return items;
}

function blobToString(blob: Blob): Promise<string> {
  if (typeof blob.text === "function") {
    return blob.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(reader.error);
    };

    reader.readAsText(blob);
  });
}

function createFileItem(file: File): FileDropItem {
  return {
    kind: "file",
    type: file.type || GENERIC_TYPE,
    name: file.name,
    getText: () => blobToString(file),
    getFile: () => Promise.resolve(file),
  };
}

function createDirectoryItem(entry: FileSystemDirectoryEntryLike): DirectoryDropItem {
  return {
    kind: "directory",
    name: entry.name,
    getEntries: () => getEntries(entry),
  };
}

async function* getEntries(
  entry: FileSystemDirectoryEntryLike
): AsyncIterable<FileDropItem | DirectoryDropItem> {
  const reader = entry.createReader();

  let entries: FileSystemEntryLike[];
  do {
    entries = await new Promise((resolve, reject) => {
      reader.readEntries(resolve, reject);
    });

    for (const child of entries) {
      if (isFileSystemFileEntry(child)) {
        const file = await getEntryFile(child);
        yield createFileItem(file);
      } else if (isFileSystemDirectoryEntry(child)) {
        yield createDirectoryItem(child);
      }
    }
  } while (entries.length > 0);
}

function getEntryFile(entry: FileSystemFileEntryLike): Promise<File> {
  return new Promise((resolve, reject) => {
    entry.file(resolve, reject);
  });
}

export function isTextDropItem(item: DropItem): item is TextDropItem {
  return item.kind === "text";
}

export function isFileDropItem(item: DropItem): item is FileDropItem {
  return item.kind === "file";
}

export function isDirectoryDropItem(item: DropItem): item is DirectoryDropItem {
  return item.kind === "directory";
}

export type DragModality = "keyboard" | "touch" | "virtual";

export function getDragModality(): DragModality {
  return "virtual";
}

export function useDragModality(): DragModality {
  return getDragModality();
}

export const globalDndState: GlobalDndState = {
  draggingCollectionRef: null,
  draggingKeys: new Set(),
  dropCollectionRef: null,
};

export function setDraggingCollectionRef(
  collectionRef: MaybeReactive<HTMLElement | null | undefined>
): void {
  globalDndState.draggingCollectionRef = collectionRef;
}

export function setDraggingKeys(keys: Set<string | number>): void {
  globalDndState.draggingKeys = keys;
}

export function setDropCollectionRef(
  collectionRef?: MaybeReactive<HTMLElement | null | undefined> | null
): void {
  globalDndState.dropCollectionRef = collectionRef ?? null;
}

export function clearGlobalDnDState(): void {
  globalDndState.draggingCollectionRef = null;
  globalDndState.draggingKeys = new Set();
  globalDndState.dropCollectionRef = null;
}

export function setGlobalDnDState(state: GlobalDndState): void {
  globalDndState.draggingCollectionRef = state.draggingCollectionRef;
  globalDndState.draggingKeys = state.draggingKeys ?? new Set();
  globalDndState.dropCollectionRef = state.dropCollectionRef ?? null;
}

function resolveCollectionElement(
  collectionRef?: MaybeReactive<HTMLElement | null | undefined> | null
): HTMLElement | null {
  if (collectionRef == null) {
    return null;
  }

  return toValue(collectionRef) ?? null;
}

export function isInternalDropOperation(
  collectionRef?: MaybeReactive<HTMLElement | null | undefined> | null
): boolean {
  const draggingCollection = resolveCollectionElement(globalDndState.draggingCollectionRef);
  const dropCollection = resolveCollectionElement(
    collectionRef ?? globalDndState.dropCollectionRef
  );

  return draggingCollection != null && draggingCollection === dropCollection;
}
