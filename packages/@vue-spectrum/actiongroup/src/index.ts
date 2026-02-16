import { useActionGroup, useActionGroupItem } from "@vue-aria/actiongroup";
import { useListState, type ListState } from "@vue-stately/list";
import { mergeProps, filterDOMProps } from "@vue-aria/utils";
import { FocusScope } from "@vue-aria/focus";
import { useProviderProps } from "@vue-spectrum/provider";
import { useStyleProps } from "@vue-spectrum/utils";
import { ActionButton } from "@vue-spectrum/button";
import { defineComponent, h, computed, ref, type PropType, type VNode } from "vue";
import { createActionGroupCollection, type ActionGroupCollectionNode } from "./collection";
import type { Key, Orientation } from "@vue-types/shared";
import type { SpectrumActionGroupProps } from "@vue-types/actiongroup";

function isRenderableNode(node: unknown): node is VNode {
  return typeof node === "object" && node != null && "type" in (node as Record<string, unknown>);
}

function toVNodeArray(value: unknown): VNode[] {
  if (Array.isArray(value)) {
    return value.filter((node): node is VNode => isRenderableNode(node));
  }

  return isRenderableNode(value) ? [value] : [];
}

const ActionButtonItem = defineComponent({
  name: "SpectrumActionGroupItem",
  props: {
    node: {
      type: Object as PropType<ActionGroupCollectionNode>,
      required: true,
    },
    state: {
      type: Object as PropType<ListState<object>>,
      required: true,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
    },
    isEmphasized: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
    },
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
    },
    staticColor: {
      type: String as PropType<SpectrumActionGroupProps<object>["staticColor"]>,
      required: false,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<SpectrumActionGroupProps<object>["onAction"]>,
      required: false,
    },
  },
  setup(props) {
    const nodeProps = computed(() => (props.node.props as Record<string, unknown>) ?? {});
    const nodeIsDisabled = computed(
      () =>
        Boolean(props.isDisabled)
        || Boolean(props.state.disabledKeys.has(props.node.key))
        || Boolean(nodeProps.value.disabled)
        || Boolean(nodeProps.value.isDisabled)
    );
    const actionButton = useActionGroupItem({ key: props.node.key }, props.state);
    const isSelected = computed(() => props.state.selectionManager.isSelected(props.node.key));
    let clickFallbackHandled = false;

    const markClickHandled = () => {
      clickFallbackHandled = true;
      queueMicrotask(() => {
        clickFallbackHandled = false;
      });
    };

    const triggerPress = (event?: unknown) => {
      actionButton.buttonProps.onPress?.(event);
      if (typeof nodeProps.value.onAction === "function") {
        (nodeProps.value.onAction as () => void)();
      }

      props.onAction?.(props.node.key);
      markClickHandled();
    };

    return () => {
      const onPress = (event: unknown) => {
        triggerPress(event);
      };
      const onClick = () => {
        if (clickFallbackHandled) {
          return;
        }

        triggerPress();
      };
      const isDisabled = nodeIsDisabled.value;
      const selected = isSelected.value;

      const buttonNode = h(
        ActionButton,
        mergeProps({
          ...actionButton.buttonProps,
          onClick,
          onPress,
        }, {
          ...filterDOMProps(nodeProps.value),
          isQuiet: props.isQuiet,
          isEmphasized: props.isEmphasized,
          isDisabled,
          disabled: isDisabled ? "disabled" : undefined,
          staticColor: props.staticColor,
          key: `${String(props.node.key)}:${isDisabled ? "disabled" : "enabled"}:${selected ? "selected" : "unselected"}`,
          "aria-checked": props.state.selectionManager.selectionMode === "none" ? undefined : selected,
          "aria-label": (nodeProps.value["aria-label"] as string | undefined) ?? props.node["aria-label"] ?? props.node.textValue,
        })
      );

      return props.node.wrapper ? props.node.wrapper(buttonNode) : buttonNode;
    };
  },
});

export const ActionGroup = defineComponent({
  name: "SpectrumActionGroup",
  inheritAttrs: false,
  props: {
    children: {
      type: [Function, Array, Object] as PropType<SpectrumActionGroupProps<object>["children"]>,
      required: false,
      default: undefined,
    },
    items: {
      type: Object as PropType<SpectrumActionGroupProps<object>["items"]>,
      required: false,
      default: undefined,
    },
    disabledKeys: {
      type: Object as PropType<SpectrumActionGroupProps<object>["disabledKeys"]>,
      required: false,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<SpectrumActionGroupProps<object>["isDisabled"]>,
      required: false,
      default: undefined,
    },
    selectionMode: {
      type: String as PropType<SpectrumActionGroupProps<object>["selectionMode"]>,
      required: false,
      default: undefined,
    },
    orientation: {
      type: String as PropType<Orientation>,
      required: false,
      default: "horizontal" as Orientation,
    },
    onSelectionChange: {
      type: Function as PropType<SpectrumActionGroupProps<object>["onSelectionChange"]>,
      required: false,
    },
    onAction: {
      type: Function as PropType<SpectrumActionGroupProps<object>["onAction"]>,
      required: false,
    },
    isEmphasized: {
      type: Boolean as PropType<SpectrumActionGroupProps<object>["isEmphasized"]>,
      required: false,
      default: undefined,
    },
    density: {
      type: String as PropType<SpectrumActionGroupProps<object>["density"]>,
      required: false,
    },
    isJustified: {
      type: Boolean as PropType<SpectrumActionGroupProps<object>["isJustified"]>,
      required: false,
      default: undefined,
    },
    isQuiet: {
      type: Boolean as PropType<SpectrumActionGroupProps<object>["isQuiet"]>,
      required: false,
      default: undefined,
    },
    staticColor: {
      type: String as PropType<SpectrumActionGroupProps<object>["staticColor"]>,
      required: false,
      default: undefined,
    },
    overflowMode: {
      type: String as PropType<SpectrumActionGroupProps<object>["overflowMode"]>,
      required: false,
      default: "wrap" as SpectrumActionGroupProps<object>["overflowMode"],
    },
    buttonLabelBehavior: {
      type: String as PropType<SpectrumActionGroupProps<object>["buttonLabelBehavior"]>,
      required: false,
      default: "show" as SpectrumActionGroupProps<object>["buttonLabelBehavior"],
    },
    summaryIcon: {
      type: Object as PropType<SpectrumActionGroupProps<object>["summaryIcon"]>,
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
  setup(props, { attrs, slots }) {
    const merged = computed(() =>
      useProviderProps({
      ...attrs,
      ...props,
      }) as SpectrumActionGroupProps<object> & Record<string, unknown>
    );
    const { styleProps } = useStyleProps(merged.value);
    const domRef = ref<HTMLElement | null>(null);
    const domValue = {
      get current() {
        return domRef.value;
      },
    };

    const actionNodes = computed(() => {
      const slotChildren = slots.default ? toVNodeArray(slots.default()) : [];
      const functionChildren =
        slotChildren.length === 0 &&
          typeof merged.value.children === "function" &&
          merged.value.items
          ? Array.from(merged.value.items as Iterable<unknown>).flatMap((item) =>
              toVNodeArray((merged.value.children as (item: unknown) => unknown)(item))
            )
          : [];
      const sourceChildren = slotChildren.length > 0 ? slotChildren : functionChildren;
      const sourceItems =
        sourceChildren.length > 0 || typeof merged.value.children === "function" ? undefined : merged.value.items;

      return createActionGroupCollection(
        sourceItems as Iterable<unknown> | undefined,
        sourceChildren,
        merged.value.disabledKeys
      );
    });
    const state = useListState({
      ...merged.value,
      get items() {
        return actionNodes.value;
      },
      get disabledKeys() {
        return merged.value.disabledKeys;
      },
      suppressTextValueWarning: true,
    } as any);
    const { actionGroupProps } = useActionGroup(merged.value, state, domValue);

    return () =>
      h(
        FocusScope,
        {
          restoreFocus: false,
        },
        {
          default: () =>
            h("div", {
              ...actionGroupProps,
              ...styleProps.value,
              ref: domRef,
              class: [
                "spectrum-ActionGroup",
                styleProps.value.class,
                attrs.class,
                {
                  "spectrum-ActionGroup--vertical": merged.value.orientation === "vertical",
                  "spectrum-ActionGroup--quiet": merged.value.isQuiet,
                  "spectrum-ActionGroup--compact": merged.value.density === "compact",
                  "spectrum-ActionGroup--justified": merged.value.isJustified,
                  "spectrum-ActionGroup--overflowCollapse": merged.value.overflowMode === "collapse",
                  "spectrum-ActionGroup--selection": !!merged.value.selectionMode && merged.value.selectionMode !== "none",
                },
              ],
            }, [
              ...actionNodes.value.map((node) =>
                h(ActionButtonItem, {
                  node,
                  state,
                  isDisabled: merged.value.isDisabled,
                  isEmphasized: merged.value.isEmphasized,
                  isQuiet: merged.value.isQuiet,
                  staticColor: merged.value.staticColor,
                  onAction: merged.value.onAction,
                })
              ),
            ]),
        }
      );
  },
});

export const Item = defineComponent({
  name: "SpectrumActionGroupItem",
  props: {
    key: {
      type: [String, Number] as PropType<Key>,
      required: false,
    },
    textValue: {
      type: String,
      required: false,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<(() => void) | undefined>,
      required: false,
    },
    ariaLabel: {
      type: String,
      required: false,
    },
  },
  setup() {
    return () => null;
  },
});

export type { SpectrumActionGroupProps } from "@vue-types/actiongroup";
export { useActionGroup, useActionGroupItem } from "@vue-aria/actiongroup";
export type {
  ActionGroupAria,
  AriaActionGroupProps,
} from "@vue-aria/actiongroup";
export type {
  ActionGroupItemAria,
  AriaActionGroupItemProps,
} from "@vue-aria/actiongroup";
