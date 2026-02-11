import {
  computed,
  defineComponent,
  h,
  nextTick,
  onMounted,
  ref,
  type PropType,
} from "vue";
import { useButton } from "@vue-aria/button";
import { useHover } from "@vue-aria/interactions";
import type { PressEvent } from "@vue-aria/types";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { useProviderProps } from "@vue-spectrum/provider";
import {
  classNames,
  ClearSlots,
  SlotProvider,
  useSlotProps,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import {
  normalizeChildren,
  wrapTextChildren,
  type BaseButtonProps,
  type ButtonElementType,
} from "./shared";

export interface SpectrumActionButtonProps extends BaseButtonProps {
  isQuiet?: boolean | undefined;
  staticColor?: "white" | "black" | undefined;
  holdAffordance?: boolean | undefined;
  hideButtonText?: boolean | undefined;
  slot?: string | undefined;
}

export const ActionButton = defineComponent({
  name: "ActionButton",
  inheritAttrs: false,
  props: {
    elementType: {
      type: String as PropType<ButtonElementType | undefined>,
      default: undefined,
    },
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    staticColor: {
      type: String as PropType<"white" | "black" | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    autoFocus: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    href: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    target: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    rel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    type: {
      type: String as PropType<"button" | "submit" | "reset" | undefined>,
      default: undefined,
    },
    holdAffordance: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    hideButtonText: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    onPressStart: {
      type: Function as PropType<((event: PressEvent) => void) | undefined>,
      default: undefined,
    },
    onPressEnd: {
      type: Function as PropType<((event: PressEvent) => void) | undefined>,
      default: undefined,
    },
    onPressChange: {
      type: Function as PropType<((isPressed: boolean) => void) | undefined>,
      default: undefined,
    },
    onPressUp: {
      type: Function as PropType<((event: PressEvent) => void) | undefined>,
      default: undefined,
    },
    onPress: {
      type: Function as PropType<((event: PressEvent) => void) | undefined>,
      default: undefined,
    },
    slot: {
      type: String as PropType<string | undefined>,
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
    const elementRef = ref<HTMLElement | null>(null);
    const isDisabled = computed(() => Boolean(props.isDisabled));

    const button = useButton({
      elementType: () => (props.elementType ?? "button") as ButtonElementType,
      isDisabled,
      href: () => props.href,
      target: () => props.target,
      rel: () => props.rel,
      type: () => props.type ?? "button",
      onPressStart: (event) =>
        (props.onPressStart as ((value: PressEvent) => void) | undefined)?.(event),
      onPressEnd: (event) =>
        (props.onPressEnd as ((value: PressEvent) => void) | undefined)?.(event),
      onPressChange: (value) =>
        (props.onPressChange as ((next: boolean) => void) | undefined)?.(value),
      onPressUp: (event) =>
        (props.onPressUp as ((value: PressEvent) => void) | undefined)?.(event),
      onPress: (event) =>
        (props.onPress as ((value: PressEvent) => void) | undefined)?.(event),
    });

    const { hoverProps, isHovered } = useHover({
      isDisabled,
    });

    onMounted(() => {
      if (!props.autoFocus) {
        return;
      }

      void nextTick(() => {
        elementRef.value?.focus();
      });
    });

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
      focus: () => {
        elementRef.value?.focus();
      },
    });

    return () => {
      const slotProps = useSlotProps(
        {
          ...(attrs as Record<string, unknown>),
          elementType: props.elementType,
          isQuiet: props.isQuiet,
          staticColor: props.staticColor,
          isDisabled: props.isDisabled,
          autoFocus: props.autoFocus,
          href: props.href,
          target: props.target,
          rel: props.rel,
          type: props.type,
          holdAffordance: props.holdAffordance,
          hideButtonText: props.hideButtonText,
          onPressStart: props.onPressStart,
          onPressEnd: props.onPressEnd,
          onPressChange: props.onPressChange,
          onPressUp: props.onPressUp,
          onPress: props.onPress,
          slot: props.slot,
          UNSAFE_className: props.UNSAFE_className,
          UNSAFE_style: props.UNSAFE_style,
        } as Record<string, unknown> & { id?: string; slot?: string },
        "actionButton"
      );

      const resolvedProps = useProviderProps(slotProps);

      const { styleProps } = useStyleProps(resolvedProps);
      const domPropsInput = resolvedProps as Record<string, unknown>;
      const domProps = filterDOMProps(domPropsInput);
      const domEventProps: Record<string, unknown> = {};
      const eventPropPairs: Array<[string, string]> = [
        ["onKeydown", "onKeyDown"],
        ["onKeyup", "onKeyUp"],
        ["onFocus", "onFocus"],
        ["onBlur", "onBlur"],
        ["onClick", "onClick"],
      ];
      for (const [primaryName, alternateName] of eventPropPairs) {
        const primaryValue = domPropsInput[primaryName];
        const alternateValue = domPropsInput[alternateName];
        if (primaryValue !== undefined) {
          domEventProps[primaryName] = primaryValue;
          continue;
        }
        if (alternateValue !== undefined) {
          domEventProps[primaryName] = alternateValue;
        }
      }
      const children = wrapTextChildren(normalizeChildren(slots.default?.()));

      return h(
        "button",
        mergeProps(
          domProps,
          styleProps,
          button.buttonProps.value,
          hoverProps,
          domEventProps,
          {
          ref: (value: unknown) => {
            elementRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "spectrum-ActionButton",
            {
              "spectrum-ActionButton--quiet": Boolean(resolvedProps.isQuiet),
              "spectrum-ActionButton--staticColor": Boolean(resolvedProps.staticColor),
              "spectrum-ActionButton--staticWhite": resolvedProps.staticColor === "white",
              "spectrum-ActionButton--staticBlack": resolvedProps.staticColor === "black",
              "is-disabled": Boolean(resolvedProps.isDisabled),
              "is-active": button.isPressed.value,
              "is-hovered": isHovered.value,
              "focus-ring": button.isFocusVisible.value,
            },
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined,
            resolvedProps.UNSAFE_className as ClassValue | undefined
          ),
          style: {
            ...(styleProps.style ?? {}),
            ...((resolvedProps.UNSAFE_style as Record<string, string | number> | undefined) ??
              {}),
          },
          }
        ),
        [
          resolvedProps.holdAffordance
            ? h("span", {
                class: classNames("spectrum-ActionButton-hold"),
                "aria-hidden": "true",
              })
            : null,
          h(
            ClearSlots,
            null,
            {
              default: () =>
                h(
                  SlotProvider,
                  {
                    slots: {
                      icon: {
                        size: "S",
                        UNSAFE_className: classNames("spectrum-Icon", {
                          "spectrum-ActionGroup-itemIcon": Boolean(
                            resolvedProps.hideButtonText
                          ),
                        }),
                      },
                      text: {
                        UNSAFE_className: classNames("spectrum-ActionButton-label"),
                      },
                    },
                  },
                  {
                    default: () => children,
                  }
                ),
            }
          ),
        ]
      );
    };
  },
});
