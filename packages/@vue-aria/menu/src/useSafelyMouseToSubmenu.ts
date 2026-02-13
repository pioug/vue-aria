export interface SafelyMouseToSubmenuOptions {
  menuRef: { current: Element | null };
  submenuRef: { current: Element | null };
  isOpen: boolean;
  isDisabled?: boolean;
}

export function useSafelyMouseToSubmenu(_options: SafelyMouseToSubmenuOptions): void {
  // Placeholder for full upstream safe-triangle pointer behavior.
}
