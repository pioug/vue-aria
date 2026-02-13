import type { Key } from "./types";

export class Selection extends Set<Key> {
  anchorKey: Key | null;
  currentKey: Key | null;

  constructor(keys?: Iterable<Key> | Selection, anchorKey?: Key | null, currentKey?: Key | null) {
    super(keys as Iterable<Key> | undefined);
    if (keys instanceof Selection) {
      this.anchorKey = anchorKey ?? keys.anchorKey;
      this.currentKey = currentKey ?? keys.currentKey;
    } else {
      this.anchorKey = anchorKey ?? null;
      this.currentKey = currentKey ?? null;
    }
  }
}
