import { useListBox } from "@vue-aria/listbox";
import { defineComponent, h, nextTick, onMounted, watch, type PropType, type VNode } from "vue";
import { ListBoxOption } from "./ListBoxOption";
import { ListBoxSection } from "./ListBoxSection";
import { provideListBoxContext } from "./context";
import type { ListBoxCollectionNode, SpectrumListBoxProps } from "./types";
import type { ListState } from "@vue-stately/list";

const loadMoreScrollHeightCache = new Map<string, number>();

export function useListBoxLayout<T>(): { type: "listbox-layout" } {
  return { type: "listbox-layout" };
}

/** @private */
export const ListBoxBase = defineComponent({
  name: "SpectrumListBoxBase",
  inheritAttrs: false,
  props: {
    state: {
      type: Object as () => ListState<object>,
      required: true,
    },
    id: {
      type: String,
      required: false,
    },
    ariaLabel: {
      type: String,
      required: false,
    },
    ariaLabelledby: {
      type: String,
      required: false,
    },
    autoFocus: {
      type: [Boolean, String] as PropType<boolean | "first" | "last" | undefined>,
      required: false,
      default: undefined,
    },
    shouldFocusWrap: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    shouldUseVirtualFocus: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    shouldSelectOnPressUp: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    shouldFocusOnHover: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: false,
    },
    maxHeight: {
      type: Number as () => number | undefined,
      required: false,
      default: undefined,
    },
    onLoadMore: {
      type: Function as PropType<SpectrumListBoxProps<object>["onLoadMore"]>,
      required: false,
    },
    isLoading: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    showLoadingSpinner: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    escapeKeyBehavior: {
      type: String as () => SpectrumListBoxProps<object>["escapeKeyBehavior"],
      required: false,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<SpectrumListBoxProps<object>["onAction"]>,
      required: false,
    },
    onFocus: {
      type: Function as PropType<SpectrumListBoxProps<object>["onFocus"]>,
      required: false,
    },
    onBlur: {
      type: Function as PropType<SpectrumListBoxProps<object>["onBlur"]>,
      required: false,
    },
    onFocusChange: {
      type: Function as PropType<SpectrumListBoxProps<object>["onFocusChange"]>,
      required: false,
    },
    onKeyDown: {
      type: Function as PropType<(event: KeyboardEvent) => void>,
      required: false,
    },
    onKeyUp: {
      type: Function as PropType<(event: KeyboardEvent) => void>,
      required: false,
    },
    renderEmptyState: {
      type: Function as PropType<SpectrumListBoxProps<object>["renderEmptyState"]>,
      required: false,
    },
    collectionSignature: {
      type: String,
      required: false,
      default: undefined,
    },
    UNSAFE_className: {
      type: String,
      required: false,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      required: false,
    },
  },
  setup(props, { attrs, expose }) {
    const listRef = {
      current: null as HTMLElement | null,
    };
    const loadMoreCacheKey = props.id ?? null;
    let lastLoadMoreScrollHeight: number | null =
      loadMoreCacheKey != null && loadMoreScrollHeightCache.has(loadMoreCacheKey)
        ? (loadMoreScrollHeightCache.get(loadMoreCacheKey) ?? null)
        : null;

    const maybeLoadMore = () => {
      if (!props.onLoadMore || props.isLoading) {
        return;
      }

      const element = listRef.current;
      if (!element) {
        return;
      }

      const { clientHeight, scrollHeight, scrollTop } = element;
      const nearBottom =
        scrollHeight <= clientHeight ||
        scrollTop + clientHeight >= scrollHeight - 40;

      if (!nearBottom) {
        return;
      }

      if (lastLoadMoreScrollHeight === scrollHeight) {
        return;
      }

      lastLoadMoreScrollHeight = scrollHeight;
      if (loadMoreCacheKey != null) {
        loadMoreScrollHeightCache.set(loadMoreCacheKey, scrollHeight);
      }
      props.onLoadMore();
    };

    onMounted(() => {
      void nextTick().then(() => {
        maybeLoadMore();
      });
    });

    watch(
      () => [props.isLoading, props.maxHeight, (props.state.collection as { size?: number }).size],
      () => {
        void nextTick().then(() => {
          maybeLoadMore();
        });
      },
      { flush: "post" }
    );

    const { listBoxProps } = useListBox(
      {
        id: props.id,
        "aria-label": props.ariaLabel,
        "aria-labelledby": props.ariaLabelledby,
        autoFocus: props.autoFocus,
        shouldFocusWrap: props.shouldFocusWrap,
        shouldUseVirtualFocus: props.shouldUseVirtualFocus,
        shouldSelectOnPressUp: props.shouldSelectOnPressUp,
        shouldFocusOnHover: props.shouldFocusOnHover,
        escapeKeyBehavior: props.escapeKeyBehavior,
        onAction: props.onAction,
        onFocus: props.onFocus,
        onBlur: props.onBlur,
        onFocusChange: props.onFocusChange,
        onKeyDown: props.onKeyDown,
        onKeyUp: props.onKeyUp,
        isVirtualized: true,
      } as any,
      props.state as any,
      listRef
    );

    provideListBoxContext({
      state: props.state,
      shouldFocusOnHover: Boolean(props.shouldFocusOnHover),
      shouldUseVirtualFocus: Boolean(props.shouldUseVirtualFocus),
      renderEmptyState: props.renderEmptyState,
    });

    expose({
      focus: () => listRef.current?.focus(),
      UNSAFE_getDOMNode: () => listRef.current,
    });

    return () => {
      const nodes = [...(props.state.collection as any)] as ListBoxCollectionNode[];
      const children = nodes.map((item) =>
        item.type === "section"
          ? h(ListBoxSection as any, {
              key: String(item.key),
              item,
            })
          : h(ListBoxOption as any, {
              key: String(item.key),
              item,
            })
      );

      const hasItems = children.length > 0;
      const shouldShowLoadingSpinner = props.showLoadingSpinner ?? true;

      if (props.isLoading && shouldShowLoadingSpinner) {
        children.push(
          h(
            "div",
            {
              role: "option",
              class: "spectrum-Menu-item",
            },
            [
              h("div", {
                role: "progressbar",
                "aria-label": hasItems ? "Loading more…" : "Loading…",
              }),
            ]
          )
        );
      } else if (children.length === 0 && props.renderEmptyState) {
        children.push(
          h(
            "div",
            {
              role: "option",
            },
            props.renderEmptyState() as any
          )
        );
      }

      return h(
        "div",
        {
          ...(attrs as Record<string, unknown>),
          ...listBoxProps,
          ref: ((value: HTMLElement | null) => {
            listRef.current = value;
          }) as any,
          style: {
            ...(listBoxProps.style as Record<string, unknown> | undefined),
            ...(props.maxHeight != null
              ? {
                  maxHeight: `${props.maxHeight}px`,
                  overflow: "auto",
                }
              : {}),
            ...(props.UNSAFE_style ?? {}),
          },
          onScroll: (event: Event) => {
            const listBoxOnScroll = (listBoxProps as Record<string, unknown>).onScroll;
            if (typeof listBoxOnScroll === "function") {
              (listBoxOnScroll as (event: Event) => void)(event);
            }
            maybeLoadMore();
          },
          onKeydown: (event: KeyboardEvent) => {
            const listBoxOnKeyDown =
              (listBoxProps as Record<string, unknown>).onKeydown
              ?? (listBoxProps as Record<string, unknown>).onKeyDown;
            if (typeof listBoxOnKeyDown === "function") {
              (listBoxOnKeyDown as (event: KeyboardEvent) => void)(event);
            }
            props.onKeyDown?.(event);
          },
          onKeyDown: (event: KeyboardEvent) => {
            const listBoxOnKeyDown =
              (listBoxProps as Record<string, unknown>).onKeyDown
              ?? (listBoxProps as Record<string, unknown>).onKeydown;
            if (typeof listBoxOnKeyDown === "function") {
              (listBoxOnKeyDown as (event: KeyboardEvent) => void)(event);
            }
            props.onKeyDown?.(event);
          },
          onKeyup: (event: KeyboardEvent) => {
            const listBoxOnKeyUp =
              (listBoxProps as Record<string, unknown>).onKeyup
              ?? (listBoxProps as Record<string, unknown>).onKeyUp;
            if (typeof listBoxOnKeyUp === "function") {
              (listBoxOnKeyUp as (event: KeyboardEvent) => void)(event);
            }
            props.onKeyUp?.(event);
          },
          onKeyUp: (event: KeyboardEvent) => {
            const listBoxOnKeyUp =
              (listBoxProps as Record<string, unknown>).onKeyUp
              ?? (listBoxProps as Record<string, unknown>).onKeyup;
            if (typeof listBoxOnKeyUp === "function") {
              (listBoxOnKeyUp as (event: KeyboardEvent) => void)(event);
            }
            props.onKeyUp?.(event);
          },
          class: ["spectrum-Menu", props.UNSAFE_className],
        },
        children
      );
    };
  },
});
