import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  TreeView as SpectrumTreeView,
  TreeViewItem as SpectrumTreeViewItem,
  TreeViewItemContent as SpectrumTreeViewItemContent,
  type SpectrumTreeViewItemContentProps,
  type SpectrumTreeViewItemProps,
  type SpectrumTreeViewProps,
} from "@vue-spectrum/tree";
import { ProgressCircle } from "@vue-spectrum/progress";
import { useProviderProps } from "@vue-spectrum/provider";

export type TreeViewSize = "S" | "M" | "L" | "XL";

export interface S2TreeViewProps extends SpectrumTreeViewProps {
  size?: TreeViewSize | undefined;
}

export interface S2TreeViewItemProps extends SpectrumTreeViewItemProps {}
export interface S2TreeViewItemContentProps extends SpectrumTreeViewItemContentProps {}

export interface S2TreeViewLoadMoreItemProps {
  loadingState?: "idle" | "loading" | "loadingMore" | "filtering" | undefined;
  onLoadMore?: (() => void) | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export const TreeView = defineComponent({
  name: "S2TreeView",
  inheritAttrs: false,
  props: {
    size: {
      type: String as PropType<TreeViewSize | undefined>,
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
  setup(props, { attrs, slots }) {
    const forwardedProps = computed(() => {
      const attrsRecord = attrs as Record<string, unknown>;
      const attrsClassName =
        typeof attrsRecord.UNSAFE_className === "string"
          ? (attrsRecord.UNSAFE_className as string)
          : undefined;
      const attrsStyle =
        (attrsRecord.UNSAFE_style as Record<string, string | number> | undefined) ??
        undefined;

      return useProviderProps({
        ...attrsRecord,
        UNSAFE_className: clsx(
          "s2-TreeView",
          props.size ? `s2-TreeView--${props.size}` : null,
          attrsClassName,
          props.UNSAFE_className
        ),
        UNSAFE_style: {
          ...(attrsStyle ?? {}),
          ...(props.UNSAFE_style ?? {}),
        },
        "data-s2-size": props.size,
      });
    });

    return () =>
      h(SpectrumTreeView, forwardedProps.value as Record<string, unknown>, slots);
  },
});

export const TreeViewItem = SpectrumTreeViewItem;
export const TreeViewItemContent = SpectrumTreeViewItemContent;

export const TreeViewLoadMoreItem = defineComponent({
  name: "S2TreeViewLoadMoreItem",
  inheritAttrs: false,
  props: {
    loadingState: {
      type: String as PropType<
        "idle" | "loading" | "loadingMore" | "filtering" | undefined
      >,
      default: undefined,
    },
    onLoadMore: {
      type: Function as PropType<(() => void) | undefined>,
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
  setup(props, { attrs, slots }) {
    const isLoading = computed(
      () => props.loadingState === "loading" || props.loadingState === "loadingMore"
    );

    return () => {
      const attrsRecord = attrs as Record<string, unknown>;
      const attrsClassName =
        typeof attrsRecord.UNSAFE_className === "string"
          ? (attrsRecord.UNSAFE_className as string)
          : undefined;
      const attrsStyle =
        (attrsRecord.UNSAFE_style as Record<string, string | number> | undefined) ??
        undefined;

      return h(
        "div",
        {
          class: clsx(
            "s2-TreeViewLoadMoreItem",
            {
              "is-loading": isLoading.value,
            },
            attrsClassName,
            props.UNSAFE_className
          ),
          style: {
            ...(attrsStyle ?? {}),
            ...(props.UNSAFE_style ?? {}),
          },
        },
        [
          h(
            "button",
            {
              type: "button",
              class: clsx("s2-TreeViewLoadMoreButton"),
              disabled: isLoading.value,
              onClick: () => {
                if (!isLoading.value) {
                  props.onLoadMore?.();
                }
              },
            },
            isLoading.value
              ? h(ProgressCircle, {
                  isIndeterminate: true,
                  "aria-label": "Loading more",
                })
              : slots.default?.() ?? "Load more"
          ),
        ]
      );
    };
  },
});

export type {
  SpectrumTreeSelectionMode as S2TreeSelectionMode,
  SpectrumTreeViewItemData as S2TreeViewItemData,
  TreeKey as S2TreeKey,
} from "@vue-spectrum/tree";
