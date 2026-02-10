import {
  Fragment,
  computed,
  defineComponent,
  h,
  ref,
  type PropType,
} from "vue";
import { useBreadcrumbItem } from "@vue-aria/breadcrumbs";
import { useFocusRing } from "@vue-aria/focus";
import { useLocale } from "@vue-aria/i18n";
import { useHover } from "@vue-aria/interactions";
import type { PressEvent } from "@vue-aria/types";
import { filterDOMProps, mergeProps, type RouterOptions } from "@vue-aria/utils";
import { useProviderProps } from "@vue-spectrum/provider";
import {
  classNames,
  useSlotProps,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";

export interface SpectrumBreadcrumbItemProps {
  href?: string | undefined;
  target?: string | undefined;
  rel?: string | undefined;
  download?: string | boolean | undefined;
  routerOptions?: RouterOptions | undefined;
  isCurrent?: boolean | undefined;
  isDisabled?: boolean | undefined;
  isMenu?: boolean | undefined;
  showSeparator?: boolean | undefined;
  autoFocus?: boolean | undefined;
  onPress?: ((event: PressEvent) => void) | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export const BreadcrumbItem = defineComponent({
  name: "BreadcrumbItem",
  inheritAttrs: false,
  props: {
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
    download: {
      type: [String, Boolean] as PropType<string | boolean | undefined>,
      default: undefined,
    },
    routerOptions: {
      type: Object as PropType<RouterOptions | undefined>,
      default: undefined,
    },
    isCurrent: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isMenu: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    showSeparator: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    autoFocus: {
      type: Boolean as PropType<boolean | undefined>,
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
  setup(props, { attrs, expose, slots }) {
    const elementRef = ref<HTMLElement | null>(null);

    const locale = useLocale();
    const isRTL = computed(() => locale.value.direction === "rtl");

    const { itemProps } = useBreadcrumbItem({
      href: computed(() => props.href),
      target: computed(() => props.target),
      rel: computed(() => props.rel),
      download: computed(() => props.download),
      routerOptions: computed(() => props.routerOptions),
      isCurrent: computed(() => Boolean(props.isCurrent)),
      isDisabled: computed(() => Boolean(props.isDisabled)),
      autoFocus: computed(() => Boolean(props.autoFocus)),
      onPress: (event) =>
        props.onPress?.(event),
      elementType: computed(() =>
        props.href !== undefined ? "a" : "span"
      ),
    });

    const { hoverProps, isHovered } = useHover({
      isDisabled: computed(
        () => Boolean(props.isDisabled) || Boolean(props.isCurrent)
      ),
    });

    const focusRing = useFocusRing();

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
    });

    return () => {
      const slotProps = useSlotProps(
        {
          ...(attrs as Record<string, unknown>),
          href: props.href,
          target: props.target,
          rel: props.rel,
          download: props.download,
          routerOptions: props.routerOptions,
          isCurrent: props.isCurrent,
          isDisabled: props.isDisabled,
          isMenu: props.isMenu,
          showSeparator: props.showSeparator,
          autoFocus: props.autoFocus,
          onPress: props.onPress,
          slot: props.slot,
          UNSAFE_className: props.UNSAFE_className,
          UNSAFE_style: props.UNSAFE_style,
        } as Record<string, unknown> & { id?: string; slot?: string },
        "breadcrumbItem"
      );

      const resolvedProps = useProviderProps(slotProps);

      const { styleProps } = useStyleProps(resolvedProps);
      const domProps = filterDOMProps(resolvedProps as Record<string, unknown>);
      const isCurrent = Boolean(resolvedProps.isCurrent);
      const isDisabled = Boolean(resolvedProps.isDisabled);
      const isMenu = Boolean(resolvedProps.isMenu);
      const showSeparator = resolvedProps.showSeparator !== false;
      const elementType = resolvedProps.href ? "a" : "span";

      const element = h(
        elementType,
        mergeProps(
          domProps,
          styleProps,
          isMenu ? {} : itemProps.value,
          hoverProps,
          focusRing.focusProps,
          {
            ref: (value: unknown) => {
              elementRef.value = value as HTMLElement | null;
            },
            class: classNames(
              {
                "spectrum-Breadcrumbs-itemLink": !isMenu,
                "is-disabled": !isCurrent && isDisabled,
                "is-hovered": isHovered.value,
                "focus-ring": focusRing.isFocusVisible.value,
              },
              styleProps.class as ClassValue | undefined,
              domProps.class as ClassValue | undefined,
              resolvedProps.UNSAFE_className as ClassValue | undefined
            ),
            style: {
              ...(styleProps.style ?? {}),
              ...((resolvedProps.UNSAFE_style as
                | Record<string, string | number>
                | undefined) ?? {}),
            },
            tabindex: isCurrent ? -1 : undefined,
          }
        ),
        slots.default?.()
      );

      if (!showSeparator) {
        return element;
      }

      return h(Fragment, null, [
        element,
        h(
          "span",
          {
            class: classNames("spectrum-Breadcrumbs-itemSeparator", {
              "is-reversed": isRTL.value,
            }),
            "aria-hidden": "true",
          },
          isRTL.value ? "‹" : "›"
        ),
      ]);
    };
  },
});
