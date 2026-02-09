import {
  cloneVNode,
  computed,
  defineComponent,
  h,
  isVNode,
  type PropType,
  type VNode,
  type VNodeChild,
} from "vue";
import { mergeProps } from "@vue-aria/utils";
import { useId } from "@vue-aria/ssr";
import { classNames, type ClassValue } from "@vue-spectrum/utils";
import { useFormProps } from "@vue-spectrum/form";
import {
  Label,
  type LabelAlign,
  type LabelElementType,
  type LabelPosition,
  type NecessityIndicator,
} from "./Label";
import { HelpText } from "./HelpText";

interface ErrorMessageContext {
  isInvalid: boolean;
  validationErrors: string[];
  validationDetails: unknown;
}

type ErrorMessageValue = string | ((context: ErrorMessageContext) => unknown);

interface ResolvedFieldProps {
  label?: string;
  labelPosition?: LabelPosition;
  labelAlign?: LabelAlign | null;
  isRequired?: boolean;
  necessityIndicator?: NecessityIndicator | null;
  includeNecessityIndicatorInAccessibilityName?: boolean;
  validationState?: "valid" | "invalid";
  isInvalid?: boolean;
  description?: string;
  errorMessage?: ErrorMessageValue | undefined;
  validationErrors?: string[];
  validationDetails?: unknown;
  isDisabled?: boolean;
  showErrorIcon?: boolean;
  contextualHelp?: VNode;
  labelProps?: Record<string, unknown>;
  descriptionProps?: Record<string, unknown>;
  errorMessageProps?: Record<string, unknown>;
  elementType?: LabelElementType;
  wrapperClassName?: string;
  wrapperProps?: Record<string, unknown>;
}

function normalizeRenderable(
  value: VNodeChild | VNodeChild[] | undefined
): VNodeChild[] {
  if (value === undefined || value === null || value === false) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeRenderable(item));
  }

  return [value];
}

function cloneWithClass(children: VNodeChild[], className: string): VNodeChild[] {
  return children.map((child) => {
    if (!isVNode(child) || typeof child.type === "symbol") {
      return child;
    }

    const childClass = (child.props as Record<string, unknown> | null)?.class as
      | ClassValue
      | undefined;

    return cloneVNode(
      child,
      {
        class: classNames(className, childClass),
      },
      true
    );
  });
}

function decorateContextualHelpNodes(
  nodes: VNodeChild[],
  options: {
    labelId?: string;
    contextualHelpId: string;
  }
): VNodeChild[] {
  return nodes.map((node) => {
    if (!isVNode(node) || typeof node.type === "symbol") {
      return node;
    }

    const nodeClass = (node.props as Record<string, unknown> | null)?.class as
      | ClassValue
      | undefined;

    return cloneVNode(
      node,
      {
        class: classNames("spectrum-Field-contextualHelp", nodeClass),
        id: options.contextualHelpId,
        "aria-labelledby": options.labelId
          ? `${options.labelId} ${options.contextualHelpId}`
          : undefined,
      },
      true
    );
  });
}

export const Field = defineComponent({
  name: "Field",
  inheritAttrs: false,
  props: {
    label: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    labelPosition: {
      type: String as PropType<LabelPosition | undefined>,
      default: undefined,
    },
    labelAlign: {
      type: String as PropType<LabelAlign | null | undefined>,
      default: undefined,
    },
    isRequired: {
      type: null as unknown as PropType<boolean | undefined>,
      default: undefined,
    },
    necessityIndicator: {
      type: String as PropType<NecessityIndicator | null | undefined>,
      default: undefined,
    },
    includeNecessityIndicatorInAccessibilityName: {
      type: Boolean,
      default: false,
    },
    validationState: {
      type: String as PropType<"valid" | "invalid" | undefined>,
      default: undefined,
    },
    isInvalid: {
      type: null as unknown as PropType<boolean | undefined>,
      default: undefined,
    },
    description: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    errorMessage: {
      type: [String, Function] as PropType<ErrorMessageValue | undefined>,
      default: undefined,
    },
    validationErrors: {
      type: Array as PropType<string[] | undefined>,
      default: undefined,
    },
    validationDetails: {
      type: null as unknown as PropType<unknown>,
      default: undefined,
    },
    isDisabled: {
      type: null as unknown as PropType<boolean | undefined>,
      default: undefined,
    },
    showErrorIcon: {
      type: Boolean,
      default: false,
    },
    contextualHelp: {
      type: Object as PropType<VNode | undefined>,
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
    elementType: {
      type: String as PropType<LabelElementType | undefined>,
      default: undefined,
    },
    wrapperClassName: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    wrapperProps: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const contextualHelpId = useId(undefined, "v-spectrum-contextual-help");
    const fallbackLabelId = useId(undefined, "v-spectrum-label");

    const resolvedFieldProps = computed<ResolvedFieldProps>(() =>
      useFormProps<Record<string, unknown>>(
        props as unknown as Record<string, unknown>
      ) as unknown as ResolvedFieldProps
    );

    const errorMessage = computed<unknown>(() => {
      const resolved = resolvedFieldProps.value;
      const errorMessageValue = resolved.errorMessage;

      if (typeof errorMessageValue !== "function") {
        return errorMessageValue;
      }

      if (
        resolved.isInvalid === undefined ||
        resolved.validationErrors === undefined ||
        resolved.validationDetails === undefined
      ) {
        return null;
      }

      return errorMessageValue({
        isInvalid: resolved.isInvalid,
        validationErrors: resolved.validationErrors,
        validationDetails: resolved.validationDetails,
      });
    });

    const hasHelpText = computed(
      () =>
        Boolean(resolvedFieldProps.value.description) ||
        (Boolean(errorMessage.value) &&
          (resolvedFieldProps.value.isInvalid ||
            resolvedFieldProps.value.validationState === "invalid"))
    );

    return () => {
      const resolved = resolvedFieldProps.value;

      const rootAttrs = { ...(attrs as Record<string, unknown>) };
      const wrapperProps = { ...(resolved.wrapperProps ?? {}) };

      const labelContent =
        (slots.label?.() as VNodeChild[] | undefined) ??
        normalizeRenderable(resolved.label);
      const contextualHelpNodesRaw =
        (slots.contextualHelp?.() as VNodeChild[] | undefined) ??
        normalizeRenderable(resolved.contextualHelp);
      const childNodes = cloneWithClass(
        (slots.default?.() as VNodeChild[] | undefined) ?? [],
        "spectrum-Field-field"
      );

      const hasContextualHelp =
        labelContent.length > 0 && contextualHelpNodesRaw.length > 0;

      const rootClass = classNames(
        "spectrum-Field",
        {
          "spectrum-Field--positionTop": resolved.labelPosition !== "side",
          "spectrum-Field--positionSide": resolved.labelPosition === "side",
          "spectrum-Field--alignEnd": resolved.labelAlign === "end",
          "spectrum-Field--hasContextualHelp": hasContextualHelp,
        },
        rootAttrs.class as ClassValue | undefined,
        wrapperProps.class as ClassValue | undefined,
        resolved.wrapperClassName as ClassValue | undefined
      );

      delete rootAttrs.class;
      delete wrapperProps.class;

      const effectiveLabelProps: Record<string, unknown> = {
        ...(resolved.labelProps ?? {}),
      };

      if (
        hasContextualHelp &&
        effectiveLabelProps.id === undefined
      ) {
        effectiveLabelProps.id = fallbackLabelId.value;
      }

      const labelId =
        typeof effectiveLabelProps.id === "string"
          ? effectiveLabelProps.id
          : undefined;

      const contextualHelpNodes = hasContextualHelp
        ? decorateContextualHelpNodes(contextualHelpNodesRaw, {
            labelId,
            contextualHelpId: contextualHelpId.value,
          })
        : [];

      const helpTextNode: VNodeChild = hasHelpText.value
        ? h(HelpText, {
            description: resolved.description,
            errorMessage: errorMessage.value as string | undefined,
            validationState: resolved.validationState,
            isInvalid: resolved.isInvalid,
            isDisabled: resolved.isDisabled,
            showErrorIcon: resolved.showErrorIcon,
            descriptionProps: resolved.descriptionProps,
            errorMessageProps: resolved.errorMessageProps,
          } as Record<string, unknown>)
        : null;

      const renderChildren = (): VNodeChild[] => {
        if (resolved.labelPosition === "side") {
          return [
            h("div", { class: "spectrum-Field-wrapper" }, [
              ...childNodes,
              helpTextNode,
            ]),
          ];
        }

        return [...childNodes, helpTextNode];
      };

      const labelAndContextualHelp: VNodeChild[] =
        labelContent.length > 0
          ? [
              h(
                Label,
                {
                  ...effectiveLabelProps,
                  labelPosition: resolved.labelPosition,
                  labelAlign: resolved.labelAlign,
                  isRequired: resolved.isRequired,
                  necessityIndicator: resolved.necessityIndicator,
                  includeNecessityIndicatorInAccessibilityName:
                    resolved.includeNecessityIndicatorInAccessibilityName,
                  elementType: resolved.elementType,
                } as Record<string, unknown>,
                {
                  default: () => labelContent,
                }
              ),
              ...contextualHelpNodes,
            ]
          : [];

      const labelSection: VNodeChild[] =
        resolved.labelPosition === "side" && hasContextualHelp
          ? [
              h("div", { class: "spectrum-Field-labelCell" }, [
                h("div", { class: "spectrum-Field-labelWrapper" }, labelAndContextualHelp),
              ]),
            ]
          : labelAndContextualHelp;

      const rootChildren: VNodeChild[] = [
        ...labelSection,
        ...renderChildren(),
      ];

      return h(
        "div",
        mergeProps(rootAttrs, wrapperProps, {
          class: rootClass,
        }),
        rootChildren
      );
    };
  },
});
