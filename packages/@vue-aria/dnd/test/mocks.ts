interface FileSystemEntryLike {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
}

export class DataTransferItemMock {
  kind: "string" | "file";
  type: string;
  private readonly data: string | FileSystemFileEntryMock | FileSystemDirectoryEntryMock;

  constructor(
    type: string,
    data: string | FileSystemFileEntryMock | FileSystemDirectoryEntryMock,
    kind: "string" | "file" = "string"
  ) {
    this.kind = kind;
    this.type = type;
    this.data = data;
  }

  getAsString(callback: (text: string) => void): void {
    if (this.kind === "string" && typeof this.data === "string") {
      callback(this.data);
    }
  }

  getAsFile(): File | null {
    if (this.kind === "file" && this.data instanceof FileSystemFileEntryMock) {
      return this.data.fileData;
    }

    return null;
  }

  webkitGetAsEntry(): FileSystemEntryLike | null {
    if (this.kind === "file" && typeof this.data !== "string") {
      return this.data;
    }

    return null;
  }
}

export class FileSystemFileEntryMock {
  readonly isFile = true;
  readonly isDirectory = false;
  readonly name: string;
  readonly fileData: File;

  constructor(file: File) {
    this.name = file.name;
    this.fileData = file;
  }

  file(callback: (file: File) => void): void {
    callback(this.fileData);
  }
}

export class FileSystemDirectoryEntryMock {
  readonly isFile = false;
  readonly isDirectory = true;
  readonly name: string;
  private entries: FileSystemEntryLike[];

  constructor(name: string, entries: FileSystemEntryLike[]) {
    this.name = name;
    this.entries = entries;
  }

  createReader(): FileSystemDirectoryReaderMock {
    return new FileSystemDirectoryReaderMock(this.entries);
  }
}

class FileSystemDirectoryReaderMock {
  private entries: FileSystemEntryLike[];

  constructor(entries: FileSystemEntryLike[]) {
    this.entries = entries;
  }

  readEntries(callback: (entries: FileSystemEntryLike[]) => void): void {
    const entries = this.entries;
    this.entries = [];
    callback(entries);
  }
}

export class DataTransferItemListMock implements Iterable<DataTransferItemMock> {
  private itemsInternal: DataTransferItemMock[];

  constructor(items: DataTransferItemMock[] = []) {
    this.itemsInternal = items;
  }

  add(
    data: string | File | FileSystemDirectoryEntryMock,
    type?: string
  ): DataTransferItemMock {
    let item: DataTransferItemMock;

    if (data instanceof File) {
      item = new DataTransferItemMock(data.type, new FileSystemFileEntryMock(data), "file");
    } else if (data instanceof FileSystemDirectoryEntryMock) {
      item = new DataTransferItemMock("", data, "file");
    } else {
      item = new DataTransferItemMock(type ?? "", data, "string");
    }

    this.itemsInternal.push(item);
    return item;
  }

  get items(): DataTransferItemMock[] {
    return this.itemsInternal;
  }

  [Symbol.iterator](): Iterator<DataTransferItemMock> {
    return this.itemsInternal[Symbol.iterator]();
  }
}

export class DataTransferMock {
  items: DataTransferItemListMock;
  dropEffect: "none" | "copy" | "link" | "move" = "none";
  effectAllowed:
    | "none"
    | "copy"
    | "copyLink"
    | "copyMove"
    | "link"
    | "linkMove"
    | "move"
    | "all"
    | "uninitialized" = "all";

  private dragImage?: { node: Element; x: number; y: number };

  constructor(items: DataTransferItemMock[] = []) {
    this.items = new DataTransferItemListMock(items);
  }

  setDragImage(dragImage: Element, x: number, y: number): void {
    this.dragImage = { node: dragImage, x, y };
  }

  get types(): string[] {
    const types = new Set<string>();
    for (const item of this.items) {
      if (item.kind === "file") {
        types.add("Files");
      } else {
        types.add(item.type);
      }
    }

    return [...types];
  }

  get files(): File[] {
    return this.items.items
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile())
      .filter((file): file is File => file != null);
  }

  getData(type: string): string {
    const item = this.items.items.find((entry) => entry.kind === "string" && entry.type === type);
    if (!item) {
      return "";
    }

    let value = "";
    item.getAsString((data) => {
      value = data;
    });
    return value;
  }

  clearData(type?: string): void {
    if (type) {
      this.items = new DataTransferItemListMock(
        this.items.items.filter((item) => item.type !== type)
      );
      return;
    }

    this.items = new DataTransferItemListMock();
  }
}

export class ClipboardEventMock extends Event {
  readonly clipboardData: DataTransfer;

  constructor(type: string, init: { clipboardData: DataTransferMock }) {
    super(type, { bubbles: true, cancelable: true, composed: true });
    this.clipboardData = init.clipboardData as unknown as DataTransfer;
  }
}

export class DragEventMock extends MouseEvent {
  readonly dataTransfer: DataTransfer;

  constructor(
    type: string,
    init: { dataTransfer: DataTransferMock; clientX?: number; clientY?: number }
  ) {
    super(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      clientX: init.clientX ?? 0,
      clientY: init.clientY ?? 0,
    });
    this.dataTransfer = init.dataTransfer as unknown as DataTransfer;
  }
}
