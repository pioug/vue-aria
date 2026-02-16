import type { Key } from "@vue-aria/collections";

interface MenuData {
  onClose?: () => void;
  onAction?: (key: Key) => void;
  shouldUseVirtualFocus?: boolean;
}

export const menuData: WeakMap<object, MenuData> = new WeakMap();
