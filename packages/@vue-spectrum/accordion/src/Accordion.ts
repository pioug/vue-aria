import {
  computed,
  defineComponent,
  h,
  inject,
  provide,
  ref,
  type InjectionKey,
  type PropType,
  type Ref,
} from "vue";
import { useButton } from "@vue-aria/button";
import {
  useAccordionItem,
  useDisclosure,
  useDisclosureGroupState,
  useDisclosureState,
  type UseDisclosureGroupStateResult,
} from "@vue-aria/disclosure";
import { useHover } from "@vue-aria/interactions";
import { useLocale } from "@vue-aria/i18n";
import type { Key, PressEvent, ReadonlyRef } from "@vue-aria/types";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { useProviderContext } from "@vue-spectrum/provider";
import { classNames, type ClassValue } from "@vue-spectrum/utils";

function normalizeHeadingLevel(level: number | undefined): 1 | 2 | 3 | 4 | 5 | 6 {
  if (level === undefined) {
    return 3;
  }

  if (level <= 1) {
    return 1;
  }

  if (level >= 6) {
    return 6;
  }

  return level as 1 | 2 | 3 | 4 | 5 | 6;
}

export interface SpectrumAccordionProps {
  allowsMultipleExpanded?: boolean | undefined;
  isDisabled?: boolean | undefined;
  expandedKeys?: Iterable<Key> | undefined;
  defaultExpandedKeys?: Iterable<Key> | undefined;
  onExpandedChange?: ((keys: Set<Key>) => void) | undefined;
  isQuiet?: boolean | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export interface SpectrumDisclosureProps {
  id?: Key | undefined;
  isExpanded?: boolean | undefined;
  defaultExpanded?: boolean | undefined;
  isDisabled?: boolean | undefined;
  onExpandedChange?: ((isExpanded: boolean) => void) | undefined;
  isQuiet?: boolean | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export interface SpectrumDisclosurePanelProps {
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export interface SpectrumDisclosureTitleProps {
  level?: number | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export type SpectrumDisclosureHeaderProps = SpectrumDisclosureTitleProps;

interface AccordionContextValue {
  groupState: UseDisclosureGroupStateResult;
  isQuiet: ReadonlyRef<boolean>;
}

interface DisclosureContextValue {
  panelRef: Ref<HTMLElement | null>;
  buttonProps: ReadonlyRef<Record<string, unknown>>;
  panelProps: ReadonlyRef<Record<string, unknown>>;
  isExpanded: ReadonlyRef<boolean>;
  isDisabled: ReadonlyRef<boolean>;
}

const ACCORDION_CONTEXT_SYMBOL: InjectionKey<AccordionContextValue> = Symbol(
  "VUE_SPECTRUM_ACCORDION_CONTEXT"
);
const DISCLOSURE_CONTEXT_SYMBOL: InjectionKey<DisclosureContextValue> = Symbol(
  "VUE_SPECTRUM_DISCLOSURE_CONTEXT"
);

function useAccordionContext(): AccordionContextValue | null {
  return inject(ACCORDION_CONTEXT_SYMBOL, null);
}

function useDisclosureContext(componentName: string): DisclosureContextValue {
  const context = inject(DISCLOSURE_CONTEXT_SYMBOL, null);
  if (!context) {
    throw new Error(`${componentName} must be used within a Disclosure.`);
  }

  return context;
}

export const Accordion = defineComponent({
  name: "Accordion",
  inheritAttrs: false,
  props: {
    allowsMultipleExpanded: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    expandedKeys: {
      type: null as unknown as PropType<Iterable<Key> | undefined>,
      default: undefined,
    },
    defaultExpandedKeys: {
      type: null as unknown as PropType<Iterable<Key> | undefined>,
      default: undefined,
    },
    onExpandedChange: {
      type: Function as PropType<((keys: Set<Key>) => void) | undefined>,
      default: undefined,
    },
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
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
    const provider = useProviderContext();
    const elementRef = ref<HTMLElement | null>(null);
    const isQuiet = computed(
      () => props.isQuiet ?? provider?.value.isQuiet ?? false
    );
    const isDisabled = computed(
      () => props.isDisabled ?? provider?.value.isDisabled ?? false
    );

    const groupState = useDisclosureGroupState({
      allowsMultipleExpanded: computed(() => Boolean(props.allowsMultipleExpanded)),
      isDisabled,
      expandedKeys:
        props.expandedKeys !== undefined
          ? computed(() => props.expandedKeys)
          : undefined,
      defaultExpandedKeys: props.defaultExpandedKeys,
      onExpandedChange: (keys) => {
        props.onExpandedChange?.(new Set(keys));
      },
    });

    provide(ACCORDION_CONTEXT_SYMBOL, {
      groupState,
      isQuiet,
    });

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
    });

    return () => {
      const domProps = filterDOMProps({
        ...(attrs as Record<string, unknown>),
        slot: props.slot,
      });

      return h(
        "div",
        mergeProps(domProps, {
          ref: (value: unknown) => {
            elementRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "spectrum-Accordion",
            props.UNSAFE_className as ClassValue | undefined
          ),
          style: props.UNSAFE_style,
        }),
        slots.default?.()
      );
    };
  },
});

export const Disclosure = defineComponent({
  name: "Disclosure",
  inheritAttrs: false,
  props: {
    id: {
      type: null as unknown as PropType<Key | undefined>,
      default: undefined,
    },
    isExpanded: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    defaultExpanded: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    onExpandedChange: {
      type: Function as PropType<((isExpanded: boolean) => void) | undefined>,
      default: undefined,
    },
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
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
    const provider = useProviderContext();
    const accordionContext = useAccordionContext();
    const elementRef = ref<HTMLElement | null>(null);
    const panelRef = ref<HTMLElement | null>(null);
    const providerIsDisabled = computed(
      () => props.isDisabled ?? provider?.value.isDisabled ?? false
    );

    let buttonProps: ReadonlyRef<Record<string, unknown>>;
    let panelProps: ReadonlyRef<Record<string, unknown>>;
    let isExpanded: ReadonlyRef<boolean>;
    let isDisabled: ReadonlyRef<boolean>;

    if (accordionContext) {
      const accordionItem = useAccordionItem(
        {
          id: props.id,
          isDisabled: computed(() => props.isDisabled),
          onExpandedChange: props.onExpandedChange,
        },
        accordionContext.groupState,
        panelRef
      );

      buttonProps = accordionItem.buttonProps;
      panelProps = accordionItem.panelProps;
      isExpanded = accordionItem.isExpanded;
      isDisabled = accordionItem.isDisabled;
    } else {
      const disclosureState = useDisclosureState({
        isExpanded:
          props.isExpanded !== undefined
            ? computed(() => props.isExpanded)
            : undefined,
        defaultExpanded: props.defaultExpanded,
        onExpandedChange: props.onExpandedChange,
      });
      const disclosure = useDisclosure(
        {
          isDisabled: providerIsDisabled,
        },
        disclosureState,
        panelRef
      );

      buttonProps = disclosure.buttonProps;
      panelProps = disclosure.panelProps;
      isExpanded = disclosureState.isExpanded;
      isDisabled = providerIsDisabled;
    }

    provide(DISCLOSURE_CONTEXT_SYMBOL, {
      panelRef,
      buttonProps,
      panelProps,
      isExpanded,
      isDisabled,
    });

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
    });

    return () => {
      const domProps = filterDOMProps({
        ...(attrs as Record<string, unknown>),
        "aria-label": props.ariaLabel,
        "aria-labelledby": props.ariaLabelledby,
        slot: props.slot,
      });
      const isQuiet =
        props.isQuiet ?? accordionContext?.isQuiet.value ?? provider?.value.isQuiet;

      return h(
        "div",
        mergeProps(domProps, {
          ref: (value: unknown) => {
            elementRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "spectrum-Accordion-item",
            {
              "spectrum-Accordion-item--quiet": Boolean(isQuiet),
              "is-expanded": isExpanded.value,
              "is-disabled": isDisabled.value,
              "in-accordion": accordionContext !== null,
            },
            props.UNSAFE_className as ClassValue | undefined
          ),
          style: props.UNSAFE_style,
        }),
        slots.default?.()
      );
    };
  },
});

export const DisclosurePanel = defineComponent({
  name: "DisclosurePanel",
  inheritAttrs: false,
  props: {
    ariaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaLabelledby: {
      type: String as PropType<string | undefined>,
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
    const disclosureContext = useDisclosureContext("DisclosurePanel");
    const elementRef = ref<HTMLElement | null>(null);

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
    });

    return () => {
      const domProps = filterDOMProps({
        ...(attrs as Record<string, unknown>),
        "aria-label": props.ariaLabel,
        "aria-labelledby": props.ariaLabelledby,
        slot: props.slot,
      });

      return h(
        "div",
        mergeProps(disclosureContext.panelProps.value, domProps, {
          ref: (value: unknown) => {
            const resolvedElement = value as HTMLElement | null;
            elementRef.value = resolvedElement;
            disclosureContext.panelRef.value = resolvedElement;
          },
          role: "region",
          class: classNames(
            "spectrum-Accordion-itemContent",
            props.UNSAFE_className as ClassValue | undefined
          ),
          style: props.UNSAFE_style,
        }),
        slots.default?.()
      );
    };
  },
});

export const DisclosureTitle = defineComponent({
  name: "DisclosureTitle",
  inheritAttrs: false,
  props: {
    level: {
      type: Number as PropType<number | undefined>,
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
    const disclosureContext = useDisclosureContext("DisclosureTitle");
    const elementRef = ref<HTMLElement | null>(null);
    const locale = useLocale();
    const isDisabled = computed(() => disclosureContext.isDisabled.value);

    const button = useButton({
      elementType: "button",
      isDisabled,
      onPressStart: (event) => {
        const handler = disclosureContext.buttonProps.value.onPressStart as
          | ((pressEvent: PressEvent) => void)
          | undefined;
        handler?.(event);
      },
      onPressEnd: (event) => {
        const handler = disclosureContext.buttonProps.value.onPressEnd as
          | ((pressEvent: PressEvent) => void)
          | undefined;
        handler?.(event);
      },
      onPressChange: (pressed) => {
        const handler = disclosureContext.buttonProps.value.onPressChange as
          | ((isPressed: boolean) => void)
          | undefined;
        handler?.(pressed);
      },
      onPressUp: (event) => {
        const handler = disclosureContext.buttonProps.value.onPressUp as
          | ((pressEvent: PressEvent) => void)
          | undefined;
        handler?.(event);
      },
      onPress: (event) => {
        const handler = disclosureContext.buttonProps.value.onPress as
          | ((pressEvent: PressEvent) => void)
          | undefined;
        handler?.(event);
      },
    });
    const { hoverProps, isHovered } = useHover({
      isDisabled,
    });

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
    });

    return () => {
      const level = normalizeHeadingLevel(props.level);
      const domProps = filterDOMProps({
        ...(attrs as Record<string, unknown>),
        slot: props.slot,
      });
      const disclosureButtonProps = disclosureContext.buttonProps.value;
      const headingElement = `h${level}`;
      const indicatorClass = classNames(
        "spectrum-Accordion-itemIndicator",
        {
          "spectrum-Accordion-itemIndicator--rtl":
            locale.value.direction === "rtl",
        }
      );

      return h(
        headingElement,
        mergeProps(domProps, {
          ref: (value: unknown) => {
            elementRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "spectrum-Accordion-itemHeading",
            props.UNSAFE_className as ClassValue | undefined
          ),
          style: props.UNSAFE_style,
        }),
        [
          h(
            "button",
            mergeProps(button.buttonProps.value, hoverProps, {
              id: disclosureButtonProps.id as string | undefined,
              "aria-expanded": disclosureButtonProps["aria-expanded"] as
                | boolean
                | undefined,
              "aria-controls": disclosureButtonProps["aria-controls"] as
                | string
                | undefined,
              class: classNames("spectrum-Accordion-itemHeader", {
                "is-hovered": isHovered.value,
                "is-pressed": button.isPressed.value,
                "focus-ring": button.isFocusVisible.value,
              }),
            }),
            [
              h("span", {
                "aria-hidden": "true",
                class: indicatorClass,
              }),
              ...(slots.default?.() ?? []),
            ]
          ),
        ]
      );
    };
  },
});

export const DisclosureHeader = DisclosureTitle;
