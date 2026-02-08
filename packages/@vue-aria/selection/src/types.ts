import type { Key } from "@vue-aria/types";

export interface KeyboardDelegate {
  getKeyAbove?: (key: Key) => Key | null;
  getKeyBelow?: (key: Key) => Key | null;
  getKeyLeftOf?: (key: Key) => Key | null;
  getKeyRightOf?: (key: Key) => Key | null;
  getFirstKey?: () => Key | null;
  getLastKey?: () => Key | null;
  getKeyForSearch?: (search: string, fromKey?: Key) => Key | null;
}
