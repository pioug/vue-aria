import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { menuData } from "./utils";
import { useSelectableList } from "@vue-aria/selection";
import type { Key, Node } from "@vue-aria/collections";

export interface MenuState<T> {
  collection: {
    getItem(key: Key): Node<T> | null;
    getFirstKey(): Key | null;
    getLastKey(): Key | null;
    getKeyBefore(key: Key): Key | null;
    getKeyAfter(key: Key): Key | null;
  };
  disabledKeys: Set<Key>;
  selectionManager: unknown;
}

export interface AriaMenuProps<T> {
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  disabledKeys?: Iterable<Key>;
  shouldFocusWrap?: boolean;
  shouldUseVirtualFocus?: boolean;
  isVirtualized?: boolean;
  onClose?: () => void;
  onAction?: (key: Key) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  onKeydown?: (event: KeyboardEvent) => void;
  onKeyup?: (event: KeyboardEvent) => void;
  children?: unknown;
}

export interface MenuAria {
  menuProps: Record<string, unknown>;
}

export interface AriaMenuOptions<T> extends Omit<AriaMenuProps<T>, "children"> {
  keyboardDelegate?: unknown;
}

export function useMenu<T>(
  props: AriaMenuOptions<T>,
  state: MenuState<T>,
  ref: { current: HTMLElement | null }
): MenuAria {
  const { shouldFocusWrap = true, ...otherProps } = props;

  if (!props["aria-label"] && !props["aria-labelledby"] && process.env.NODE_ENV !== "production") {
    console.warn("An aria-label or aria-labelledby prop is required for accessibility.");
  }

  const domProps = filterDOMProps(props as Record<string, unknown>, { labelable: true });
  const { listProps } = useSelectableList({
    ...otherProps,
    ref,
    selectionManager: state.selectionManager as any,
    collection: state.collection as any,
    disabledKeys: state.disabledKeys,
    shouldFocusWrap,
    linkBehavior: "override",
  } as any);

  menuData.set(state as object, {
    onClose: props.onClose,
    onAction: props.onAction,
    shouldUseVirtualFocus: props.shouldUseVirtualFocus,
  });

  const userOnKeyDown = props.onKeyDown ?? props.onKeydown;
  const userOnKeyUp = props.onKeyUp ?? props.onKeyup;

  return {
    menuProps: mergeProps(domProps, { onKeydown: userOnKeyDown, onKeyup: userOnKeyUp }, {
      role: "menu",
      ...listProps,
      onKeydown: (event: KeyboardEvent) => {
        if (event.key !== "Escape" || props.shouldUseVirtualFocus) {
          (listProps as { onKeydown?: (event: KeyboardEvent) => void }).onKeydown?.(event);
        }
      },
    }),
  };
}
