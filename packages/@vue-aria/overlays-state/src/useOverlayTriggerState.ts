import { useControlledState } from "@vue-stately/utils";

export interface OverlayTriggerProps {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export interface OverlayTriggerState {
  readonly isOpen: boolean;
  setOpen(isOpen: boolean): void;
  open(): void;
  close(): void;
  toggle(): void;
}

export function useOverlayTriggerState(props: OverlayTriggerProps): OverlayTriggerState {
  const [isOpenRef, setOpen] = useControlledState<boolean, boolean>(
    () => props.isOpen,
    () => props.defaultOpen || false,
    props.onOpenChange
  );

  return {
    get isOpen() {
      return isOpenRef.value;
    },
    setOpen,
    open() {
      setOpen(true);
    },
    close() {
      setOpen(false);
    },
    toggle() {
      setOpen(!isOpenRef.value);
    },
  };
}
