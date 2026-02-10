import {
  computed,
  defineComponent,
  h,
  type PropType,
} from "vue";
import { filterDOMProps } from "@vue-aria/utils";
import { ActionButton } from "@vue-spectrum/button";
import {
  ActionGroup,
  type ActionGroupButtonLabelBehavior,
  type ActionGroupKey,
  type SpectrumActionGroupItemData,
} from "@vue-spectrum/actiongroup";
import { useProviderProps } from "@vue-spectrum/provider";
import { Text } from "@vue-spectrum/text";
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";

export interface SpectrumActionBarProps {
  selectedItemCount?: number | "all" | undefined;
  items?: SpectrumActionGroupItemData[] | undefined;
  disabledKeys?: Iterable<ActionGroupKey> | undefined;
  isEmphasized?: boolean | undefined;
  buttonLabelBehavior?: ActionGroupButtonLabelBehavior | undefined;
  actionsLabel?: string | undefined;
  clearSelectionLabel?: string | undefined;
  selectedAllLabel?: string | undefined;
  selectedCountLabel?: ((count: number) => string) | undefined;
  onAction?: ((key: ActionGroupKey) => void) | undefined;
  onClearSelection?: (() => void) | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export const ActionBar = defineComponent({
  name: "ActionBar",
  inheritAttrs: false,
  props: {
    selectedItemCount: {
      type: [String, Number] as PropType<number | "all" | undefined>,
      default: 0,
    },
    items: {
      type: Array as PropType<SpectrumActionGroupItemData[] | undefined>,
      default: undefined,
    },
    disabledKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<ActionGroupKey> | undefined>,
      default: undefined,
    },
    isEmphasized: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    buttonLabelBehavior: {
      type: String as PropType<ActionGroupButtonLabelBehavior | undefined>,
      default: undefined,
    },
    actionsLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    clearSelectionLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    selectedAllLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    selectedCountLabel: {
      type: Function as PropType<((count: number) => string) | undefined>,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<((key: ActionGroupKey) => void) | undefined>,
      default: undefined,
    },
    onClearSelection: {
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
    const resolvedProviderProps = computed(() =>
      useProviderProps(props as unknown as Record<string, unknown>)
    );

    const count = computed<number | "all">(() => {
      if (props.selectedItemCount === "all") {
        return "all";
      }

      return Math.max(0, Number(props.selectedItemCount ?? 0));
    });

    const isOpen = computed(
      () => count.value === "all" || (typeof count.value === "number" && count.value > 0)
    );

    const selectedLabel = computed(() => {
      if (count.value === "all") {
        return props.selectedAllLabel ?? "All selected";
      }

      return props.selectedCountLabel?.(count.value) ?? `${count.value} selected`;
    });

    return () => {
      if (!isOpen.value) {
        return null;
      }

      const attrsRecord = attrs as Record<string, unknown>;
      const styleInput = {
        ...attrsRecord,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      } as Record<string, unknown>;
      const { styleProps } = useStyleProps(styleInput);
      const domProps = filterDOMProps(attrsRecord);

      const isEmphasized =
        (resolvedProviderProps.value.isEmphasized as boolean | undefined) ??
        props.isEmphasized;

      const actionGroupNode = h(ActionGroup, {
        items: props.items,
        disabledKeys: props.disabledKeys,
        onAction: props.onAction,
        isQuiet: true,
        staticColor: isEmphasized ? "white" : undefined,
        overflowMode: "collapse",
        buttonLabelBehavior: props.buttonLabelBehavior,
        ariaLabel: props.actionsLabel ?? "Actions",
        UNSAFE_className: classNames("react-spectrum-ActionBar-actionGroup"),
      });

      return h(
        "div",
        {
          ...domProps,
          class: classNames(
            "react-spectrum-ActionBar",
            {
              "react-spectrum-ActionBar--emphasized": Boolean(isEmphasized),
              "is-open": true,
            },
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined,
            props.UNSAFE_className as ClassValue | undefined
          ),
          style: {
            ...(styleProps.style ?? {}),
            ...(props.UNSAFE_style ?? {}),
          },
          onKeydown: (event: KeyboardEvent) => {
            if (event.key !== "Escape") {
              return;
            }

            event.preventDefault();
            props.onClearSelection?.();
          },
        },
        [
          h("div", { class: classNames("react-spectrum-ActionBar-bar") }, [
            actionGroupNode,
            h(
              ActionButton,
              {
                "aria-label": props.clearSelectionLabel ?? "Clear selection",
                isQuiet: true,
                staticColor: isEmphasized ? "white" : undefined,
                onPress: () => {
                  props.onClearSelection?.();
                },
              },
              {
                default: () => slots.clearButton?.() ?? "Clear",
              }
            ),
            h(
              Text,
              {
                UNSAFE_className: classNames("react-spectrum-ActionBar-selectedCount"),
              },
              {
                default: () => selectedLabel.value,
              }
            ),
          ]),
        ]
      );
    };
  },
});
