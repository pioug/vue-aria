import {
  computed,
  defineComponent,
  h,
  nextTick,
  onMounted,
  ref,
  watch,
  type PropType,
} from "vue";
import {
  useListBox,
  useListBoxState,
  type SelectionMode,
} from "@vue-aria/listbox";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import type { Key } from "@vue-aria/types";
import { ProgressCircle } from "@vue-spectrum/progress";
import { useProvider } from "@vue-spectrum/provider";
import {
  classNames,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import { ListBoxSection } from "./ListBoxSection";
import {
  flattenListBoxSections,
  normalizeListBoxSections,
  type NormalizedListBoxItemData,
  type SpectrumListBoxItemData,
  type SpectrumListBoxSelectionMode,
} from "./types";

export interface SpectrumListBoxBaseProps {
  id?: string | undefined;
  items?: SpectrumListBoxItemData[] | undefined;
  selectionMode?: SpectrumListBoxSelectionMode | undefined;
  selectedKeys?: Iterable<Key> | undefined;
  defaultSelectedKeys?: Iterable<Key> | undefined;
  disabledKeys?: Iterable<Key> | undefined;
  isDisabled?: boolean | undefined;
  disallowEmptySelection?: boolean | undefined;
  autoFocus?: true | "first" | "last" | undefined;
  shouldFocusWrap?: boolean | undefined;
  shouldSelectOnPressUp?: boolean | undefined;
  shouldFocusOnHover?: boolean | undefined;
  shouldUseVirtualFocus?: boolean | undefined;
  isLoading?: boolean | undefined;
  showLoadingSpinner?: boolean | undefined;
  onSelectionChange?: ((keys: Set<Key>) => void) | undefined;
  onAction?: ((key: Key) => void) | undefined;
  onLoadMore?: (() => void) | undefined;
  onScroll?: ((event: Event) => void) | undefined;
  renderEmptyState?: (() => unknown) | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  slot?: string | undefined;
  isHidden?: boolean | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export interface ListBoxLayout {
  estimatedRowHeight: number;
  estimatedHeadingHeight: number;
  paddingY: number;
  placeholderHeight: number;
}

export function useListBoxLayout(): Readonly<{ value: ListBoxLayout }> {
  const provider = useProvider();

  return computed<ListBoxLayout>(() => {
    const isLarge = provider.value.scale === "large";

    return {
      estimatedRowHeight: isLarge ? 48 : 32,
      estimatedHeadingHeight: isLarge ? 33 : 26,
      paddingY: isLarge ? 5 : 4,
      placeholderHeight: isLarge ? 48 : 32,
    };
  });
}

export const ListBoxBase = defineComponent({
  name: "ListBoxBase",
  inheritAttrs: false,
  props: {
    id: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    items: {
      type: Array as PropType<SpectrumListBoxItemData[] | undefined>,
      default: undefined,
    },
    selectionMode: {
      type: String as PropType<SpectrumListBoxSelectionMode | undefined>,
      default: undefined,
    },
    selectedKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<Key> | undefined>,
      default: undefined,
    },
    defaultSelectedKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<Key> | undefined>,
      default: undefined,
    },
    disabledKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<Key> | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    disallowEmptySelection: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    autoFocus: {
      type: [Boolean, String] as PropType<true | "first" | "last" | undefined>,
      default: undefined,
    },
    shouldFocusWrap: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    shouldSelectOnPressUp: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    shouldFocusOnHover: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    shouldUseVirtualFocus: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isLoading: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    showLoadingSpinner: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    onSelectionChange: {
      type: Function as PropType<((keys: Set<Key>) => void) | undefined>,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<((key: Key) => void) | undefined>,
      default: undefined,
    },
    onLoadMore: {
      type: Function as PropType<(() => void) | undefined>,
      default: undefined,
    },
    onScroll: {
      type: Function as PropType<((event: Event) => void) | undefined>,
      default: undefined,
    },
    renderEmptyState: {
      type: Function as PropType<(() => unknown) | undefined>,
      default: undefined,
    },
    ariaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaLabelledby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-label": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-labelledby": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    slot: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    isHidden: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, string | number> | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots, expose }) {
    const rootRef = ref<HTMLElement | null>(null);
    const loadingRequested = ref(false);

    const sections = computed(() => normalizeListBoxSections(props.items));
    const collection = computed<NormalizedListBoxItemData[]>(() =>
      flattenListBoxSections(sections.value)
    );
    const disabledKeySet = computed(() => new Set(props.disabledKeys ?? []));

    const selectionMode = computed<SelectionMode>(() => props.selectionMode ?? "none");

    const state = useListBoxState<NormalizedListBoxItemData>({
      collection,
      selectionMode,
      disallowEmptySelection: props.disallowEmptySelection,
      selectedKeys: props.selectedKeys,
      defaultSelectedKeys: props.defaultSelectedKeys,
      disabledKeys: props.disabledKeys,
      isDisabled: props.isDisabled,
      onSelectionChange: (keys) => {
        props.onSelectionChange?.(keys);
      },
    });

    const { listBoxProps } = useListBox(
      {
        id: props.id,
        "aria-label": props["aria-label"] ?? props.ariaLabel,
        "aria-labelledby": props["aria-labelledby"] ?? props.ariaLabelledby,
        shouldSelectOnPressUp: props.shouldSelectOnPressUp,
        shouldFocusOnHover: props.shouldFocusOnHover,
        shouldUseVirtualFocus: props.shouldUseVirtualFocus,
        selectionBehavior:
          selectionMode.value === "single" ? "replace" : "toggle",
        isVirtualized: true,
        onAction: (key) => {
          props.onAction?.(key);
        },
      },
      state,
      rootRef
    );

    const isKeyDisabled = (key: Key): boolean => {
      if (props.isDisabled) {
        return true;
      }

      if (disabledKeySet.value.has(key)) {
        return true;
      }

      const item = collection.value.find((entry) => entry.key === key);
      return Boolean(item?.isDisabled);
    };

    const getFirstEnabledKey = (): Key | null => {
      for (const item of collection.value) {
        if (!isKeyDisabled(item.key)) {
          return item.key;
        }
      }

      return null;
    };

    const getLastEnabledKey = (): Key | null => {
      for (let index = collection.value.length - 1; index >= 0; index -= 1) {
        const key = collection.value[index]?.key;
        if (key !== undefined && !isKeyDisabled(key)) {
          return key;
        }
      }

      return null;
    };

    const focusKey = (key: Key | null) => {
      if (key === null) {
        return;
      }

      state.setFocusedKey(key);
      const attemptFocus = (attempt: number) => {
        const optionElement = state.getOptionElement(key);
        if (optionElement) {
          optionElement.focus();
          return;
        }

        if (attempt >= 4) {
          return;
        }

        void nextTick(() => {
          attemptFocus(attempt + 1);
        });
      };

      void nextTick(() => {
        attemptFocus(0);
      });
    };

    const applyAutoFocus = () => {
      if (!props.autoFocus) {
        return;
      }

      const key =
        props.autoFocus === "last"
          ? getLastEnabledKey()
          : state.focusedKey.value ?? getFirstEnabledKey();

      focusKey(key);
    };

    const onListKeydown = (event: KeyboardEvent) => {
      const focusedBefore = state.focusedKey.value;
      const listboxOnKeydown = listBoxProps.value.onKeydown as
        | ((event: KeyboardEvent) => void)
        | undefined;

      listboxOnKeydown?.(event);

      if (
        !props.shouldFocusWrap ||
        event.defaultPrevented ||
        focusedBefore === null
      ) {
        return;
      }

      let wrappedKey: Key | null = null;
      if (
        (event.key === "ArrowDown" || event.key === "ArrowRight") &&
        state.focusedKey.value === focusedBefore
      ) {
        wrappedKey = getFirstEnabledKey();
      } else if (
        (event.key === "ArrowUp" || event.key === "ArrowLeft") &&
        state.focusedKey.value === focusedBefore
      ) {
        wrappedKey = getLastEnabledKey();
      }

      if (wrappedKey === null || wrappedKey === focusedBefore) {
        return;
      }

      event.preventDefault();
      focusKey(wrappedKey);

      if (selectionMode.value === "single") {
        state.selectKey(wrappedKey, "replace");
      }
    };

    const onListScroll = (event: Event) => {
      props.onScroll?.(event);

      const target = event.target as HTMLElement | null;
      if (!target || !props.onLoadMore || props.isLoading) {
        loadingRequested.value = false;
        return;
      }

      const distance = target.scrollHeight - target.scrollTop - target.clientHeight;
      if (distance > 4) {
        loadingRequested.value = false;
        return;
      }

      if (loadingRequested.value) {
        return;
      }

      loadingRequested.value = true;
      props.onLoadMore();
    };

    watch(
      () => props.isLoading,
      (isLoading) => {
        if (!isLoading) {
          loadingRequested.value = false;
        }
      }
    );

    watch(
      () => props.autoFocus,
      (value) => {
        if (!value) {
          return;
        }

        void nextTick(() => {
          applyAutoFocus();
        });
      }
    );

    watch(collection, () => {
      if (!props.autoFocus || state.focusedKey.value !== null) {
        return;
      }

      void nextTick(() => {
        applyAutoFocus();
      });
    });

    onMounted(() => {
      void nextTick(() => {
        applyAutoFocus();
      });
    });

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
    });

    return () => {
      const domProps = filterDOMProps(attrs as Record<string, unknown>, {
        labelable: true,
      });
      const { styleProps } = useStyleProps({
        isHidden: props.isHidden,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      });
      const shouldShowLoading = props.showLoadingSpinner ?? props.isLoading;

      const children = sections.value.map((section, index) =>
        h(ListBoxSection, {
          key: section.key,
          section,
          state,
          isFirst: index === 0,
          shouldSelectOnPressUp: props.shouldSelectOnPressUp,
          shouldFocusOnHover: props.shouldFocusOnHover,
          shouldUseVirtualFocus: props.shouldUseVirtualFocus,
        })
      );

      if (shouldShowLoading) {
        children.push(
          h(
            "div",
            {
              role: "option",
              class: classNames("spectrum-Menu-item", "is-loading"),
            },
            [
              h(ProgressCircle, {
                isIndeterminate: true,
                size: "S",
                "aria-label":
                  collection.value.length > 0 ? "Loading more" : "Loading",
                UNSAFE_className: classNames(
                  "spectrum-Dropdown-progressCircle"
                ),
              }),
            ]
          )
        );
      }

      if (!shouldShowLoading && collection.value.length === 0) {
        const emptyContent = slots.emptyState?.() ?? props.renderEmptyState?.();
        if (emptyContent) {
          children.push(
            h(
              "div",
              {
                role: "option",
                class: classNames("spectrum-Menu-item", "spectrum-Menu-emptyState"),
              },
              emptyContent as any
            )
          );
        }
      }

      const listboxDomProps = {
        ...listBoxProps.value,
        onKeydown: undefined,
        onScroll: undefined,
      };

      return h(
        "div",
        mergeProps(domProps, listboxDomProps, {
          ref: (value: unknown) => {
            rootRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "spectrum-Menu",
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined
          ),
          style: styleProps.style,
          hidden: styleProps.hidden,
          onKeydown: onListKeydown,
          onScroll: onListScroll,
        }),
        children
      );
    };
  },
});
