import { useControlledState } from "@vue-aria/utils-state";

export interface DisclosureProps {
  isExpanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
}

export interface DisclosureState {
  isExpanded: boolean;
  setExpanded(isExpanded: boolean): void;
  expand(): void;
  collapse(): void;
  toggle(): void;
}

export function useDisclosureState(props: DisclosureProps): DisclosureState {
  const [isExpandedRef, setExpanded] = useControlledState<boolean, boolean>(
    () => props.isExpanded,
    () => props.defaultExpanded || false,
    props.onExpandedChange
  );

  return {
    get isExpanded() {
      return isExpandedRef.value;
    },
    setExpanded,
    expand() {
      setExpanded(true);
    },
    collapse() {
      setExpanded(false);
    },
    toggle() {
      setExpanded(!isExpandedRef.value);
    },
  };
}
