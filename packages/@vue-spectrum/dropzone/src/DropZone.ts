import { defineComponent, h, ref, type PropType } from "vue";
import {
  useDrop,
  type IDragTypes,
  type DropEnterEvent,
  type DropMoveEvent,
  type DropExitEvent,
  type DropActivateEvent,
  type DropEvent,
  type DropOperation,
} from "@vue-aria/dnd";
import { useId } from "@vue-aria/ssr";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import {
  classNames,
  SlotProvider,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";

export interface SpectrumDropZoneProps {
  isFilled?: boolean | undefined;
  replaceMessage?: string | undefined;
  isDisabled?: boolean | undefined;
  getDropOperation?: (types: IDragTypes, allowedOperations: DropOperation[]) => DropOperation;
  getDropOperationForPoint?: (
    types: IDragTypes,
    allowedOperations: DropOperation[],
    x: number,
    y: number
  ) => DropOperation;
  onDropEnter?: ((event: DropEnterEvent) => void) | undefined;
  onDropMove?: ((event: DropMoveEvent) => void) | undefined;
  onDropActivate?: ((event: DropActivateEvent) => void) | undefined;
  onDropExit?: ((event: DropExitEvent) => void) | undefined;
  onDrop?: ((event: DropEvent) => void) | undefined;
  slot?: string | undefined;
  isHidden?: boolean | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

const DEFAULT_REPLACE_MESSAGE = "Drop file to replace";

export const DropZone = defineComponent({
  name: "DropZone",
  inheritAttrs: false,
  props: {
    isFilled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    replaceMessage: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    getDropOperation: {
      type: Function as PropType<
        | ((types: IDragTypes, allowedOperations: DropOperation[]) => DropOperation)
        | undefined
      >,
      default: undefined,
    },
    getDropOperationForPoint: {
      type: Function as PropType<
        | ((
          types: IDragTypes,
          allowedOperations: DropOperation[],
          x: number,
          y: number
        ) => DropOperation)
        | undefined
      >,
      default: undefined,
    },
    onDropEnter: {
      type: Function as PropType<((event: DropEnterEvent) => void) | undefined>,
      default: undefined,
    },
    onDropMove: {
      type: Function as PropType<((event: DropMoveEvent) => void) | undefined>,
      default: undefined,
    },
    onDropActivate: {
      type: Function as PropType<((event: DropActivateEvent) => void) | undefined>,
      default: undefined,
    },
    onDropExit: {
      type: Function as PropType<((event: DropExitEvent) => void) | undefined>,
      default: undefined,
    },
    onDrop: {
      type: Function as PropType<((event: DropEvent) => void) | undefined>,
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
    const domRef = ref<HTMLElement | null>(null);
    const messageId = useId(undefined, "v-spectrum-dropzone-message");

    const { dropProps, isDropTarget } = useDrop({
      ref: domRef,
      isDisabled: () => Boolean(props.isDisabled),
      getDropOperation: props.getDropOperation,
      getDropOperationForPoint: props.getDropOperationForPoint,
      onDropEnter: (event) => {
        props.onDropEnter?.(event);
      },
      onDropMove: (event) => {
        props.onDropMove?.(event);
      },
      onDropActivate: (event) => {
        props.onDropActivate?.(event);
      },
      onDropExit: (event) => {
        props.onDropExit?.(event);
      },
      onDrop: (event) => {
        props.onDrop?.(event);
      },
    });

    expose({
      UNSAFE_getDOMNode: () => domRef.value,
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

      const labelledBy = domProps["aria-labelledby"] as string | undefined;
      const resolvedAriaLabelledBy = props.isFilled
        ? [labelledBy, messageId.value].filter(Boolean).join(" ") || messageId.value
        : labelledBy;

      return h(
        "div",
        mergeProps(domProps, dropProps, {
          ref: (value: unknown) => {
            domRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "spectrum-Dropzone",
            {
              "spectrum-Dropzone--filled": Boolean(props.isFilled),
            },
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined
          ),
          style: styleProps.style,
          hidden: styleProps.hidden,
          "aria-labelledby": resolvedAriaLabelledBy,
          "aria-disabled": props.isDisabled ? "true" : undefined,
          "data-drop-target": isDropTarget.value ? "true" : undefined,
        }),
        [
          h(
            SlotProvider,
            {
              slots: {
                illustration: {
                  UNSAFE_className: classNames(
                    "spectrum-Dropzone-illustratedMessage"
                  ),
                },
              },
            },
            {
              default: () => slots.default?.(),
            }
          ),
          h("div", {
            class: classNames("spectrum-Dropzone-backdrop"),
          }),
          h(
            "div",
            {
              id: messageId.value,
              class: classNames("spectrum-Dropzone-banner"),
            },
            props.replaceMessage ?? DEFAULT_REPLACE_MESSAGE
          ),
        ]
      );
    };
  },
});
