import clsx from "clsx";
import { computed, defineComponent, h, type PropType } from "vue";
import {
  Accordion as SpectrumAccordion,
  Disclosure as SpectrumDisclosure,
  DisclosurePanel as SpectrumDisclosurePanel,
  DisclosureTitle as SpectrumDisclosureTitle,
  type SpectrumAccordionProps,
  type SpectrumDisclosurePanelProps,
  type SpectrumDisclosureProps,
  type SpectrumDisclosureTitleProps,
} from "@vue-spectrum/accordion";
import { useProviderProps } from "@vue-spectrum/provider";

export interface S2AccordionProps extends SpectrumAccordionProps {}
export interface S2DisclosureProps extends SpectrumDisclosureProps {}
export interface S2DisclosurePanelProps extends SpectrumDisclosurePanelProps {}
export interface S2DisclosureTitleProps extends SpectrumDisclosureTitleProps {}

export const Accordion = defineComponent({
  name: "S2Accordion",
  inheritAttrs: false,
  props: {
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
          "s2-Accordion",
          attrsClassName,
          props.UNSAFE_className
        ),
        UNSAFE_style: {
          ...(attrsStyle ?? {}),
          ...(props.UNSAFE_style ?? {}),
        },
      });
    });

    return () =>
      h(SpectrumAccordion, forwardedProps.value as Record<string, unknown>, {
        default: () => slots.default?.() ?? [],
      });
  },
});

export const Disclosure = defineComponent({
  name: "S2Disclosure",
  inheritAttrs: false,
  props: {
    id: {
      type: [String, Number] as PropType<string | number | undefined>,
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
        id: props.id,
        UNSAFE_className: clsx(
          "s2-Disclosure",
          attrsClassName,
          props.UNSAFE_className
        ),
        UNSAFE_style: {
          ...(attrsStyle ?? {}),
          ...(props.UNSAFE_style ?? {}),
        },
      });
    });

    return () =>
      h(SpectrumDisclosure as any, forwardedProps.value as Record<string, unknown>, {
        default: () => slots.default?.() ?? [],
      });
  },
});

export const DisclosureTitle = defineComponent({
  name: "S2DisclosureTitle",
  inheritAttrs: false,
  props: {
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
          "s2-DisclosureTitle",
          attrsClassName,
          props.UNSAFE_className
        ),
        UNSAFE_style: {
          ...(attrsStyle ?? {}),
          ...(props.UNSAFE_style ?? {}),
        },
      });
    });

    return () =>
      h(SpectrumDisclosureTitle, forwardedProps.value as Record<string, unknown>, {
        default: () => slots.default?.() ?? [],
      });
  },
});

export const DisclosurePanel = defineComponent({
  name: "S2DisclosurePanel",
  inheritAttrs: false,
  props: {
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
          "s2-DisclosurePanel",
          attrsClassName,
          props.UNSAFE_className
        ),
        UNSAFE_style: {
          ...(attrsStyle ?? {}),
          ...(props.UNSAFE_style ?? {}),
        },
      });
    });

    return () =>
      h(SpectrumDisclosurePanel, forwardedProps.value as Record<string, unknown>, {
        default: () => slots.default?.() ?? [],
      });
  },
});
