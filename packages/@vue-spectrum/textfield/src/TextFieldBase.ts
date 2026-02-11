import {
  cloneVNode,
  computed,
  defineComponent,
  h,
  isVNode,
  nextTick,
  onMounted,
  ref,
  type PropType,
  type Ref,
  type VNode,
} from "vue";
import { useId } from "@vue-aria/ssr";
import { useFocusRing } from "@vue-aria/focus";
import { useHover } from "@vue-aria/interactions";
import { mergeProps } from "@vue-aria/utils";
import { Field } from "@vue-spectrum/label";
import { classNames, type ClassValue } from "@vue-spectrum/utils";

export interface SpectrumTextFieldBaseRenderProps {
  isQuiet?: boolean | undefined;
  isDisabled?: boolean | undefined;
  isInvalid?: boolean | undefined;
  validationState?: "valid" | "invalid" | undefined;
  label?: string | undefined;
  labelPosition?: "top" | "side" | undefined;
  labelAlign?: "start" | "end" | null | undefined;
  necessityIndicator?: "icon" | "label" | null | undefined;
  includeNecessityIndicatorInAccessibilityName?: boolean | undefined;
  description?: string | undefined;
  errorMessage?: string | undefined;
  contextualHelp?: unknown;
  labelProps?: Record<string, unknown> | undefined;
  descriptionProps?: Record<string, unknown> | undefined;
  errorMessageProps?: Record<string, unknown> | undefined;
  inputProps: Record<string, unknown>;
  inputRef?: Ref<HTMLInputElement | HTMLTextAreaElement | null> | undefined;
  inputClassName?: string | undefined;
  icon?: unknown;
  loadingIndicator?: VNode | undefined;
  isLoading?: boolean | undefined;
  disableFocusRing?: boolean | undefined;
  wrapperChildren?: VNode | VNode[] | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
  multiLine?: boolean | undefined;
  rows?: number | undefined;
}

export const TextFieldBase = defineComponent({
  name: "TextFieldBase",
  inheritAttrs: false,
  props: {
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isInvalid: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    validationState: {
      type: String as PropType<"valid" | "invalid" | undefined>,
      default: undefined,
    },
    label: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    labelPosition: {
      type: String as PropType<"top" | "side" | undefined>,
      default: undefined,
    },
    labelAlign: {
      type: String as PropType<"start" | "end" | null | undefined>,
      default: undefined,
    },
    necessityIndicator: {
      type: String as PropType<"icon" | "label" | null | undefined>,
      default: undefined,
    },
    includeNecessityIndicatorInAccessibilityName: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    description: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    errorMessage: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    contextualHelp: {
      type: null as unknown as PropType<unknown>,
      default: undefined,
    },
    labelProps: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      default: undefined,
    },
    descriptionProps: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      default: undefined,
    },
    errorMessageProps: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      default: undefined,
    },
    inputProps: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
    inputRef: {
      type: Object as PropType<
        Ref<HTMLInputElement | HTMLTextAreaElement | null> | undefined
      >,
      default: undefined,
    },
    inputClassName: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    icon: {
      type: null as unknown as PropType<unknown>,
      default: undefined,
    },
    loadingIndicator: {
      type: null as unknown as PropType<VNode | undefined>,
      default: undefined,
    },
    isLoading: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    disableFocusRing: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    wrapperChildren: {
      type: null as unknown as PropType<VNode | VNode[] | undefined>,
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
    multiLine: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    rows: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
  },
  setup(props, { expose }) {
    const inputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);
    const validIconId = useId(undefined, "v-spectrum-textfield-valid");

    const setInputRef = (value: HTMLInputElement | HTMLTextAreaElement | null) => {
      inputRef.value = value;
      if (props.inputRef) {
        props.inputRef.value = value;
      }
    };

    const { hoverProps, isHovered } = useHover({
      isDisabled: computed(() => Boolean(props.isDisabled)),
    });
    const focusRing = useFocusRing();

    onMounted(() => {
      if (!props.inputProps.autoFocus) {
        return;
      }

      void nextTick(() => {
        inputRef.value?.focus();
      });
    });

    expose({
      UNSAFE_getDOMNode: () => inputRef.value,
      focus: () => {
        inputRef.value?.focus();
      },
      select: () => {
        inputRef.value?.select();
      },
      getInputElement: () => inputRef.value,
    });

    return () => {
      const resolvedValidationState =
        props.validationState ?? (props.isInvalid ? "invalid" : undefined);
      const inputInteractionProps: Record<string, unknown> = {
        ...(props.inputProps as Record<string, unknown>),
      };
      const isInvalid =
        Boolean(props.isInvalid) || resolvedValidationState === "invalid";
      const elementType = props.multiLine ? "textarea" : "input";
      if (
        resolvedValidationState === "valid" &&
        !isInvalid &&
        !props.isDisabled &&
        !props.isLoading
      ) {
        const describedBy = inputInteractionProps["aria-describedby"];
        const describedByValue =
          typeof describedBy === "string" ? describedBy : undefined;
        if (
          !describedByValue ||
          !describedByValue.includes(validIconId.value)
        ) {
          inputInteractionProps["aria-describedby"] = [
            describedByValue,
            validIconId.value,
          ]
            .filter(Boolean)
            .join(" ");
        }
      }

      let iconNode: VNode | undefined;
      if (isVNode(props.icon)) {
        const iconProps = (props.icon as VNode).props as
          | Record<string, unknown>
          | null
          | undefined;
        iconNode = cloneVNode(props.icon as VNode, {
          class: classNames(
            "spectrum-Textfield-icon",
            iconProps?.class as ClassValue | undefined
          ),
        });
      }
      let loadingIndicatorNode: VNode | undefined;
      if (isVNode(props.loadingIndicator)) {
        const loadingIndicatorProps = (props.loadingIndicator as VNode).props as
          | Record<string, unknown>
          | null
          | undefined;
        loadingIndicatorNode = cloneVNode(props.loadingIndicator as VNode, {
          class: classNames(
            "spectrum-Textfield-loadingIcon",
            loadingIndicatorProps?.class as ClassValue | undefined
          ),
        });
      }

      const validationNode =
        resolvedValidationState && !props.isLoading && !props.isDisabled
          ? h(
              "span",
              resolvedValidationState === "valid"
                ? {
                    id: validIconId.value,
                    role: "img",
                    "aria-label": "Valid",
                    class: "spectrum-Textfield-validationIcon",
                    "data-testid": "textfield-valid-icon",
                  }
                : {
                    role: "img",
                    "aria-label": "Invalid",
                    class: "spectrum-Textfield-validationIcon",
                    "data-testid": "textfield-invalid-icon",
                  },
              resolvedValidationState === "valid" ? "\u2713" : "!"
            )
          : undefined;

      const wrapperChildren = Array.isArray(props.wrapperChildren)
        ? props.wrapperChildren
        : props.wrapperChildren
          ? [props.wrapperChildren]
          : [];
      const textFieldChildren: VNode[] = [
        h(
          elementType,
          mergeProps(inputInteractionProps, hoverProps, focusRing.focusProps, {
            ref: (value: unknown) => {
              setInputRef(
                value as HTMLInputElement | HTMLTextAreaElement | null
              );
            },
            rows: props.multiLine ? (props.rows ?? 1) : undefined,
            class: classNames(
              "spectrum-Textfield-input",
              {
                "spectrum-Textfield-inputIcon": isVNode(props.icon),
                "is-hovered": isHovered.value,
              },
              props.inputClassName as ClassValue | undefined
            ),
          })
        ) as VNode,
      ];
      if (iconNode) {
        textFieldChildren.push(iconNode);
      }
      if (validationNode) {
        textFieldChildren.push(validationNode);
      }
      if (props.isLoading && loadingIndicatorNode) {
        textFieldChildren.push(loadingIndicatorNode);
      }
      textFieldChildren.push(...wrapperChildren);

      const textField = h(
        "div",
        {
          class: classNames("spectrum-Textfield", {
            "spectrum-Textfield--invalid": isInvalid && !props.isDisabled,
            "spectrum-Textfield--valid":
              resolvedValidationState === "valid" && !props.isDisabled,
            "spectrum-Textfield--loadable": Boolean(props.loadingIndicator),
            "spectrum-Textfield--quiet": Boolean(props.isQuiet),
            "spectrum-Textfield--multiline": Boolean(props.multiLine),
            "focus-ring":
              !props.disableFocusRing && focusRing.isFocusVisible.value,
          }),
        },
        textFieldChildren
      );

      return h(
        Field,
        {
          label: props.label,
          labelPosition: props.labelPosition,
          labelAlign: props.labelAlign,
          necessityIndicator: props.necessityIndicator,
          includeNecessityIndicatorInAccessibilityName:
            props.includeNecessityIndicatorInAccessibilityName,
          description: props.description,
          errorMessage: props.errorMessage,
          isInvalid: props.isInvalid,
          validationState: resolvedValidationState,
          isDisabled: props.isDisabled,
          contextualHelp: props.contextualHelp,
          labelProps: props.labelProps,
          descriptionProps: props.descriptionProps,
          errorMessageProps: props.errorMessageProps,
          wrapperClassName: classNames(
            "spectrum-Textfield-wrapper",
            {
              "spectrum-Textfield-wrapper--quiet": Boolean(props.isQuiet),
            },
            props.UNSAFE_className as ClassValue | undefined
          ),
          UNSAFE_style: props.UNSAFE_style,
          showErrorIcon: false,
        },
        {
          default: () => [textField],
        }
      );
    };
  },
});
