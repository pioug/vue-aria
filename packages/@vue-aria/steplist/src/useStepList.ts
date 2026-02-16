import { useSelectableList } from "@vue-aria/selection";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import type { Key } from "@vue-aria/collections";

export interface AriaStepListProps<T> {
  id?: string;
  collection?: any;
  onSelectionChange?: (key: Key) => void;
  selectedKey?: Key | null;
  disabledKeys?: Set<Key>;
  selectionManager?: any;
  onKeyDown?: (event: KeyboardEvent) => void;
  onFocusWithin?: (event: FocusEvent) => void;
  onBlurWithin?: (event: FocusEvent) => void;
  onFocusWithinChange?: (isFocused: boolean) => void;
  onScroll?: (event: Event) => void;
  onDoubleClick?: (event: MouseEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onSelectionAction?: (key: Key) => void;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  [key: string]: unknown;
}

export interface StepListAria {
  listProps: Record<string, unknown>;
}

export interface StepListState {
  collection?: { size?: number };
  selectionManager?: {
    selectionMode?: string;
    isFocused?: boolean;
    focusedKey?: Key;
    selectedKeys?: Set<Key>;
    setFocused?: (key: Key | null) => void;
    focusNext?: (opts?: { key: Key }) => void;
  };
  disabledKeys?: Set<Key>;
  isSelectable?: (key: Key) => boolean;
  [key: string]: unknown;
}

export function useStepList<T>(
  props: AriaStepListProps<T>,
  state: StepListState,
  ref: { current: HTMLOListElement | null }
): StepListAria {
  const { "aria-label": ariaLabel } = props as { "aria-label"?: string };

  const listArgs = {
    ...props,
    ...state,
    allowsTabNavigation: true,
    ref,
  } as Record<string, unknown>;

  const { listProps } = useSelectableList(listArgs as any);
  const stepListProps = mergeProps(listProps, filterDOMProps(props, { labelable: true }));

  return {
    listProps: {
      ...stepListProps,
      "aria-label": ariaLabel || "Step list",
      role: "list",
      tabIndex: undefined,
    },
  };
}
