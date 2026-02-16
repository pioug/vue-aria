import { useDisclosure } from "@vue-aria/disclosure";
import { useDisclosureGroupState, type DisclosureGroupState } from "@vue-stately/disclosure";
import { useDisclosureState } from "@vue-stately/disclosure";
import { useLocale } from "@vue-aria/i18n";
import { useId } from "@vue-aria/utils";
import { Button } from "@vue-spectrum/button";
import { Heading } from "@vue-spectrum/text";
import { useProviderProps } from "@vue-spectrum/provider";
import { useStyleProps } from "@vue-spectrum/utils";
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
import { isRTL } from "@vue-aria/i18n";
import type { Key } from "@vue-types/shared";
import type { StyleProps, DOMProps, AriaLabelingProps, StyleProps as SpectrumStyleProps } from "@vue-types/shared";

type SpectrumSize = "S" | "M" | "L";

export interface SpectrumAccordionProps extends DOMProps, StyleProps, Omit<DisclosureGroupProps, "children" | "render"> {
  size?: SpectrumSize;
  isQuiet?: boolean;
}

export interface SpectrumDisclosureProps extends Omit<DisclosureProps, "children" | "render">, AriaLabelingProps, StyleProps {
  id?: Key;
  isQuiet?: boolean;
  children?: unknown;
}

export interface SpectrumDisclosurePanelProps extends Omit<DisclosurePanelProps, "children" | "render">, DOMProps, AriaLabelingProps, StyleProps {
  children?: unknown;
  role?: "group" | "region";
}

export interface SpectrumDisclosureTitleProps extends DOMProps, AriaLabelingProps, StyleProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children?: unknown;
}

interface DisclosureGroupContextValue {
  state: DisclosureGroupState;
  isQuiet: boolean;
}

interface DisclosureContextValue {
  buttonProps: Record<string, unknown>;
  panelProps: Record<string, unknown>;
  panelRef: Ref<HTMLElement | null>;
  role: "group" | "region";
  isDisabled: boolean;
  isExpanded: boolean;
}

const AccordionContextKey: InjectionKey<DisclosureGroupContextValue | null> = Symbol("spectrum-accordion-context");
const DisclosureContextKey: InjectionKey<DisclosureContextValue | null> = Symbol("spectrum-disclosure-context");

interface DisclosureGroupProps {
  allowsMultipleExpanded?: boolean;
  isDisabled?: boolean;
  expandedKeys?: Iterable<Key>;
  defaultExpandedKeys?: Iterable<Key>;
  onExpandedChange?: (keys: Set<Key>) => void;
}

interface DisclosureProps {
  isExpanded?: boolean;
  isDisabled?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
}

interface DisclosurePanelProps {
  role?: "group" | "region";
}

function createDisclosureStateFromGroup(
  key: Key,
  groupState: DisclosureGroupState,
  onExpandedChange?: (isExpanded: boolean) => void
) {
  const apply = (next: boolean) => {
    const previous = groupState.expandedKeys.has(key);
    if (previous === next) {
      return;
    }

    const keys = new Set(groupState.expandedKeys);
    if (groupState.allowsMultipleExpanded) {
      if (next) {
        keys.add(key);
      } else {
        keys.delete(key);
      }
    } else {
      if (next) {
        keys.clear();
        keys.add(key);
      } else {
        keys.clear();
      }
    }
    groupState.setExpandedKeys(keys);
    onExpandedChange?.(next);
  };

  return {
    get isExpanded() {
      return groupState.expandedKeys.has(key);
    },
    setExpanded: (next: boolean) => {
      apply(next);
    },
    expand: () => {
      apply(true);
    },
    collapse: () => {
      apply(false);
    },
    toggle: () => {
      apply(!groupState.expandedKeys.has(key));
    },
  };
}

/**
 * A group of disclosures that can be expanded and collapsed.
 */
export const Accordion = defineComponent({
  name: "SpectrumAccordion",
  inheritAttrs: false,
  props: {
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
    },
    size: {
      type: String as PropType<SpectrumSize>,
      required: false,
      default: "M",
    },
    allowsMultipleExpanded: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
    },
    expandedKeys: {
      type: Object as PropType<Iterable<Key> | undefined>,
      required: false,
    },
    defaultExpandedKeys: {
      type: Object as PropType<Iterable<Key> | undefined>,
      required: false,
    },
    onExpandedChange: {
      type: Function as PropType<(keys: Set<Key>) => void>,
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
  setup(props, { attrs, slots, expose }) {
    const merged = useProviderProps({
      ...props,
      ...attrs,
    } as Record<string, unknown>) as SpectrumAccordionProps & Record<string, unknown>;

    const groupState = useDisclosureGroupState({
      allowsMultipleExpanded: merged.allowsMultipleExpanded,
      isDisabled: merged.isDisabled as boolean | undefined,
      expandedKeys: merged.expandedKeys as Iterable<Key> | undefined,
      defaultExpandedKeys: merged.defaultExpandedKeys as Iterable<Key> | undefined,
      onExpandedChange: (merged as SpectrumAccordionProps & { onExpandedChange?: (keys: Set<Key>) => void }).onExpandedChange,
    });

    const { styleProps } = useStyleProps({
      ...merged,
      isHidden: merged.isDisabled ? undefined : merged.isHidden,
    } as Record<string, unknown>);

    const domRef = ref<HTMLElement | null>(null);

    provide(AccordionContextKey, {
      state: groupState,
      isQuiet: Boolean(props.isQuiet),
    });

    expose({
      UNSAFE_getDOMNode: () => domRef.value,
      focus: () => domRef.value?.focus(),
    });

    return () =>
      h(
        "div",
        {
          ...styleProps.value,
          ref: domRef,
          class: [
            "spectrum-Accordion",
            {
              [`spectrum-Accordion--${props.size}`]: true,
            },
            props.UNSAFE_className,
            styleProps.value.class,
          ],
        },
        slots.default ? slots.default() : null
      );
  },
});

/**
 * A collapsible section in the accordion.
 */
export const Disclosure = defineComponent({
  name: "SpectrumDisclosure",
  inheritAttrs: false,
  props: {
    isExpanded: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
    },
    id: {
      type: [String, Number] as PropType<Key>,
      required: false,
    },
    onExpandedChange: {
      type: Function as PropType<(isExpanded: boolean) => void>,
      required: false,
    },
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
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
  setup(props, { attrs, slots, expose }) {
    const merged = useProviderProps({
      ...props,
      ...attrs,
    } as Record<string, unknown>) as SpectrumDisclosureProps & Record<string, unknown>;
    const groupContext = inject(AccordionContextKey, null);
    const fallbackId = useId();
    const disclosureId = computed(() => String(merged.id ?? fallbackId));
    const panelRef = ref<HTMLElement | null>(null);
    const domRef = ref<HTMLElement | null>(null);
    const isGroupQuiet = computed(() => groupContext?.isQuiet ?? false);
    const groupDisabled = computed(() => Boolean(merged.isDisabled || groupContext?.state.isDisabled));
    const isExpandedKey = computed(() => groupContext?.state.expandedKeys.has(disclosureId.value) ?? false);

    const state = groupContext
      ? createDisclosureStateFromGroup(disclosureId.value, groupContext.state, merged.onExpandedChange)
      : useDisclosureState({
          isExpanded: merged.isExpanded,
          defaultExpanded: false,
          onExpandedChange: merged.onExpandedChange,
        });

    const panelRefObject = {
      get current() {
        return panelRef.value;
      },
      set current(value: HTMLElement | null) {
        panelRef.value = value;
      },
    };

    const { buttonProps, panelProps } = useDisclosure(
      {
        isDisabled: groupDisabled.value,
      },
      state,
      panelRefObject
    );

    const mergedButtonProps = computed(() => ({
      ...buttonProps,
      "aria-expanded": state.isExpanded,
      class: ["spectrum-Accordion-itemHeader"],
    }));

    const mergedPanelProps = computed(() => ({
      ...panelProps,
      role: "group" as const,
      "aria-hidden": !isExpandedKey.value,
      class: ["spectrum-Accordion-itemContent"],
    }));

    const { styleProps } = useStyleProps(merged as Record<string, unknown>);
    const isQuiet = computed(() => merged.isQuiet ?? isGroupQuiet.value);

    provide(DisclosureContextKey, {
      get buttonProps() {
        return mergedButtonProps.value;
      },
      get panelProps() {
        return mergedPanelProps.value;
      },
      panelRef,
      role: "group",
      get isDisabled() {
        return groupDisabled.value;
      },
      get isExpanded() {
        return isExpandedKey.value;
      },
    });

    expose({
      UNSAFE_getDOMNode: () => domRef.value,
      focus: () => domRef.value?.focus(),
    });

    return () =>
      h(
        "div",
        {
          ...styleProps.value,
          ref: domRef,
          class: [
            "spectrum-Accordion-item",
            {
              "spectrum-Accordion-item--quiet": Boolean(isQuiet.value),
              "is-expanded": isExpandedKey.value,
              "is-disabled": groupDisabled.value,
              "in-accordion": Boolean(groupContext),
            },
            props.UNSAFE_className,
            styleProps.value.class,
          ],
        },
        slots.default ? slots.default() : null
      );
  },
});

/**
 * The panel that contains the content for a disclosure.
 */
export const DisclosurePanel = defineComponent({
  name: "SpectrumAccordionDisclosurePanel",
  inheritAttrs: false,
  props: {
    role: {
      type: String as PropType<"group" | "region">,
      required: false,
      default: "group",
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
    const context = inject(DisclosureContextKey, null);
    const panelRef = context?.panelRef ?? null;
    const { styleProps } = useStyleProps({
      ...props,
      ...attrs,
    } as Record<string, unknown>);

    return () =>
      h(
        "div",
        {
          ...styleProps.value,
          ref: panelRef ?? undefined,
          ...(context?.panelProps ?? {}),
          role: props.role,
          class: [
            "spectrum-Accordion-itemContent",
            props.UNSAFE_className,
            styleProps.value.class,
            context?.panelProps?.class as string | undefined,
          ],
        },
        slots.default ? slots.default() : null
      );
  },
});

/**
 * The title and trigger button of a disclosure.
 */
export const DisclosureTitle = defineComponent({
  name: "SpectrumAccordionDisclosureTitle",
  inheritAttrs: false,
  props: {
    level: {
      type: Number as PropType<1 | 2 | 3 | 4 | 5 | 6>,
      required: false,
      default: 3,
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
  setup(props, { slots }) {
    const context = inject(DisclosureContextKey, null);
    const { styleProps } = useStyleProps(props as Record<string, unknown>);
    const direction = useLocale();
    const chevron = computed(() => (isRTL(direction.value.direction) ? "‹" : "›"));

    return () =>
      h(
        Heading,
        {
          level: props.level ?? 3,
          ...styleProps.value,
          class: ["spectrum-Accordion-itemHeading", styleProps.value.class, props.UNSAFE_className],
        },
        {
          default: () =>
            h(
              Button,
              {
                isQuiet: true,
                ...context?.buttonProps,
                class: [
                  "spectrum-Accordion-itemHeader",
                  {
                    "is-hovered": false,
                    "is-pressed": false,
                    "focus-ring": false,
                  },
                  (context?.buttonProps as Record<string, unknown> | undefined)?.class as
                    | string
                    | undefined
                    | Record<string, unknown>,
                ],
                "aria-label": "Disclosure",
                "aria-hidden": false,
              } as Record<string, unknown>,
              {
                default: () => [
                  h("span", { class: "spectrum-Accordion-itemIndicator" }, chevron.value),
                  slots.default ? slots.default() : null,
                ],
              }
            )
        }
      );
  },
});

export type {
  SpectrumAccordionProps,
  SpectrumDisclosureProps,
  SpectrumDisclosurePanelProps,
  SpectrumDisclosureTitleProps,
};
