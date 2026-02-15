import { useListBox } from "@vue-aria/listbox";
import { defineComponent, h, type PropType, type VNode } from "vue";
import { ListBoxOption } from "./ListBoxOption";
import { ListBoxSection } from "./ListBoxSection";
import { provideListBoxContext } from "./context";
import type { ListBoxCollectionNode, SpectrumListBoxProps } from "./types";
import type { ListState } from "@vue-aria/list-state";

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
    renderEmptyState: {
      type: Function as PropType<SpectrumListBoxProps<object>["renderEmptyState"]>,
      required: false,
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

      if (children.length === 0 && props.renderEmptyState) {
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
            ...(props.UNSAFE_style ?? {}),
          },
          class: ["spectrum-Menu", props.UNSAFE_className],
        },
        children
      );
    };
  },
});
