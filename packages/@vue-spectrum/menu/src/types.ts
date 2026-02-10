export type MenuKey = string | number;

export interface SpectrumMenuItemData {
  key: MenuKey;
  label: string;
  isDisabled?: boolean | undefined;
  "aria-label"?: string | undefined;
}

export type SpectrumMenuSelectionMode = "none" | "single" | "multiple";

export interface SpectrumMenuBaseProps {
  items?: SpectrumMenuItemData[] | undefined;
  selectionMode?: SpectrumMenuSelectionMode | undefined;
  selectedKeys?: Iterable<MenuKey> | undefined;
  defaultSelectedKeys?: Iterable<MenuKey> | undefined;
  disabledKeys?: Iterable<MenuKey> | undefined;
  isDisabled?: boolean | undefined;
  closeOnSelect?: boolean | undefined;
  shouldFocusWrap?: boolean | undefined;
  autoFocus?: true | "first" | "last" | undefined;
  onAction?: ((key: MenuKey) => void) | undefined;
  onSelectionChange?: ((keys: Set<MenuKey>) => void) | undefined;
  onClose?: (() => void) | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export function keyToString(key: MenuKey | undefined): string | null {
  if (key === undefined || key === null) {
    return null;
  }

  return String(key);
}

export function normalizeKeySet(keys: Iterable<MenuKey> | undefined): Set<string> {
  if (!keys) {
    return new Set<string>();
  }

  return new Set(Array.from(keys, (key) => String(key)));
}

export function areSetsEqual(first: Set<string>, second: Set<string>): boolean {
  if (first.size !== second.size) {
    return false;
  }

  for (const value of first) {
    if (!second.has(value)) {
      return false;
    }
  }

  return true;
}
