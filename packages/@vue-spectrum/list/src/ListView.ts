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
import { useGridList } from "@vue-aria/gridlist";
import { useListBoxState } from "@vue-aria/listbox";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import type { Key } from "@vue-aria/types";
import { ProgressCircle } from "@vue-spectrum/progress";
import {
  classNames,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import { ListViewItem } from "./ListViewItem";
import {
  normalizeListViewItems,
  type NormalizedListViewItemData,
  type SpectrumListViewItemData,
  type SpectrumListViewLoadingState,
  type SpectrumListViewSelectionMode,
} from "./types";

export interface SpectrumListViewProps {
  id?: string | undefined;
  items?: SpectrumListViewItemData[] | undefined;
  selectionMode?: SpectrumListViewSelectionMode | undefined;
  selectedKeys?: Iterable<Key> | undefined;
  defaultSelectedKeys?: Iterable<Key> | undefined;
  disabledKeys?: Iterable<Key> | undefined;
  isDisabled?: boolean | undefined;
  disallowEmptySelection?: boolean | undefined;
  autoFocus?: true | "first" | "last" | undefined;
  loadingState?: SpectrumListViewLoadingState | undefined;
  isQuiet?: boolean | undefined;
  density?: "compact" | "regular" | "spacious" | undefined;
  overflowMode?: "truncate" | "wrap" | undefined;
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

export const ListView = defineComponent({
  name: "ListView",
  inheritAttrs: false,
  props: {
    id: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    items: {
      type: Array as PropType<SpectrumListViewItemData[] | undefined>,
      default: undefined,
    },
    selectionMode: {
      type: String as PropType<SpectrumListViewSelectionMode | undefined>,
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
    loadingState: {
      type: String as PropType<SpectrumListViewLoadingState | undefined>,
      default: undefined,
    },
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    density: {
      type: String as PropType<"compact" | "regular" | "spacious" | undefined>,
      default: undefined,
    },
    overflowMode: {
      type: String as PropType<"truncate" | "wrap" | undefined>,
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
  setup(props, { attrs, expose, slots }) {
    const rootRef = ref<HTMLElement | null>(null);
    const loadMoreRequested = ref(false);

    const normalizedItems = computed<NormalizedListViewItemData[]>(() =>
      normalizeListViewItems(props.items)
    );
    const selectionMode = computed<SpectrumListViewSelectionMode>(
      () => props.selectionMode ?? "none"
    );
    const isLoading = computed(
      () => props.loadingState === "loading" || props.loadingState === "loadingMore"
    );

    const state = useListBoxState<NormalizedListViewItemData>({
      collection: normalizedItems,
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

    const { gridProps } = useGridList(
      {
        id: props.id,
        "aria-label": props["aria-label"] ?? props.ariaLabel,
        "aria-labelledby": props["aria-labelledby"] ?? props.ariaLabelledby,
        isVirtualized: true,
        selectionBehavior:
          selectionMode.value === "single" ? "replace" : "toggle",
        onAction: (key) => {
          props.onAction?.(key);
        },
      },
      state,
      rootRef
    );

    const getFirstEnabledKey = (): Key | null => {
      for (const item of normalizedItems.value) {
        if (!state.isDisabledKey(item.key)) {
          return item.key;
        }
      }
      return null;
    };

    const getLastEnabledKey = (): Key | null => {
      for (let i = normalizedItems.value.length - 1; i >= 0; i -= 1) {
        const key = normalizedItems.value[i]?.key;
        if (key !== undefined && !state.isDisabledKey(key)) {
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
        const element = state.getOptionElement(key);
        if (element) {
          element.focus();
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

    const onGridScroll = (event: Event) => {
      props.onScroll?.(event);

      const target = event.target as HTMLElement | null;
      if (!target || !props.onLoadMore || isLoading.value) {
        loadMoreRequested.value = false;
        return;
      }

      const distance = target.scrollHeight - target.scrollTop - target.clientHeight;
      if (distance > 4) {
        loadMoreRequested.value = false;
        return;
      }

      if (loadMoreRequested.value) {
        return;
      }

      loadMoreRequested.value = true;
      props.onLoadMore();
    };

    watch(
      () => isLoading.value,
      (value) => {
        if (!value) {
          loadMoreRequested.value = false;
        }
      }
    );

    onMounted(() => {
      void nextTick(() => {
        applyAutoFocus();
      });
    });

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

    watch(normalizedItems, () => {
      if (!props.autoFocus || state.focusedKey.value !== null) {
        return;
      }

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

      const children = normalizedItems.value.map((item) =>
        h(
          ListViewItem,
          {
            key: String(item.key),
            item,
            state,
            selectionMode: selectionMode.value,
            onAction: props.onAction,
            density: props.density,
            overflowMode: props.overflowMode,
          },
          {
            default: slots.default
              ? () => slots.default?.({ item })
              : undefined,
          }
        )
      );

      if (isLoading.value) {
        children.push(
          h(
            "div",
            {
              role: "row",
              class: classNames("react-spectrum-ListView-item", "is-loading"),
            },
            [
              h(
                "div",
                {
                  role: "gridcell",
                  "aria-colindex": 1,
                  class: classNames("react-spectrum-ListView-itemCell"),
                },
                [
                  h(ProgressCircle, {
                    isIndeterminate: true,
                    size: "S",
                    "aria-label":
                      props.loadingState === "loadingMore"
                        ? "Loading more"
                        : "Loading",
                  }),
                ]
              ),
            ]
          )
        );
      }

      if (!isLoading.value && normalizedItems.value.length === 0) {
        const emptyState = slots.emptyState?.() ?? props.renderEmptyState?.();
        if (emptyState) {
          children.push(
            h(
              "div",
              {
                role: "row",
                class: classNames("react-spectrum-ListView-item", "react-spectrum-ListView-empty"),
              },
              [
                h(
                  "div",
                  {
                    role: "gridcell",
                    "aria-colindex": 1,
                    class: classNames("react-spectrum-ListView-itemCell"),
                  },
                  emptyState as any
                ),
              ]
            )
          );
        }
      }

      const rootGridProps = {
        ...gridProps.value,
        onScroll: undefined,
      };

      return h(
        "div",
        mergeProps(domProps, rootGridProps, {
          ref: (value: unknown) => {
            rootRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "react-spectrum-ListView",
            `react-spectrum-ListView--${props.density ?? "regular"}`,
            {
              "react-spectrum-ListView--quiet": Boolean(props.isQuiet),
              "react-spectrum-ListView--wrap": (props.overflowMode ?? "truncate") === "wrap",
              "react-spectrum-ListView--loadingMore": props.loadingState === "loadingMore",
            },
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined
          ),
          style: styleProps.style,
          hidden: styleProps.hidden,
          onScroll: onGridScroll,
        }),
        children
      );
    };
  },
});
