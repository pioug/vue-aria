import {
  Comment,
  Fragment,
  Text,
  cloneVNode,
  defineComponent,
  h,
  isVNode,
  nextTick,
  onMounted,
  ref,
  type PropType,
  type VNode,
  type VNodeChild,
} from "vue";
import { useFocusRing } from "@vue-aria/focus";
import { useHover } from "@vue-aria/interactions";
import { useLink } from "@vue-aria/link";
import type { PressEvent } from "@vue-aria/types";
import {
  filterDOMProps,
  mergeProps,
  type RouterOptions,
} from "@vue-aria/utils";
import { useProviderProps } from "@vue-spectrum/provider";
import {
  classNames,
  getWrappedElement,
  useSlotProps,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";

export type LinkVariant = "primary" | "secondary" | "overBackground";

export interface SpectrumLinkProps {
  variant?: LinkVariant | undefined;
  isQuiet?: boolean | undefined;
  slot?: string | undefined;
  autoFocus?: boolean | undefined;
  isDisabled?: boolean | undefined;
  href?: string | undefined;
  routerOptions?: RouterOptions | undefined;
  target?: string | undefined;
  rel?: string | undefined;
  download?: string | boolean | undefined;
  onPressStart?: ((event: PressEvent) => void) | undefined;
  onPressEnd?: ((event: PressEvent) => void) | undefined;
  onPress?: ((event: PressEvent) => void) | undefined;
  onClick?: ((event: MouseEvent) => void) | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

type NormalizedChild = string | number | VNode;

function normalizeSlotChildren(value: VNodeChild | VNodeChild[]): NormalizedChild[] {
  if (Array.isArray(value)) {
    return value.flatMap((child) => normalizeSlotChildren(child));
  }

  if (
    value === null ||
    value === undefined ||
    value === false ||
    value === true
  ) {
    return [];
  }

  if (typeof value === "string") {
    return value.trim().length > 0 ? [value] : [];
  }

  if (typeof value === "number") {
    return [value];
  }

  if (!isVNode(value)) {
    return [];
  }

  if (value.type === Comment) {
    return [];
  }

  if (value.type === Fragment) {
    return normalizeSlotChildren((value.children as VNodeChild[] | undefined) ?? []);
  }

  if (value.type === Text) {
    const text = typeof value.children === "string" ? value.children : "";
    return text.trim().length > 0 ? [text] : [];
  }

  return [value];
}

function isTextOnlyChildren(children: NormalizedChild[]): boolean {
  if (children.length === 0) {
    return true;
  }

  return children.every(
    (child) => typeof child === "string" || typeof child === "number"
  );
}

function resolveElement(value: unknown): HTMLElement | null {
  if (value instanceof HTMLElement) {
    return value;
  }

  if (value && typeof value === "object" && "$el" in value) {
    const maybeElement = (value as { $el?: unknown }).$el;
    if (maybeElement instanceof HTMLElement) {
      return maybeElement;
    }
  }

  return null;
}

function assignVNodeRef(vnodeRef: unknown, value: unknown): void {
  if (!vnodeRef) {
    return;
  }

  if (typeof vnodeRef === "function") {
    (vnodeRef as (resolved: unknown) => void)(value);
    return;
  }

  if (typeof vnodeRef === "object" && "value" in (vnodeRef as Record<string, unknown>)) {
    (vnodeRef as { value: unknown }).value = value;
  }
}

export const Link = defineComponent({
  name: "Link",
  inheritAttrs: false,
  props: {
    variant: {
      type: String as PropType<LinkVariant | undefined>,
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
    autoFocus: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    href: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    routerOptions: {
      type: Object as PropType<RouterOptions | undefined>,
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
    onPressStart: {
      type: Function as PropType<((event: PressEvent) => void) | undefined>,
      default: undefined,
    },
    onPressEnd: {
      type: Function as PropType<((event: PressEvent) => void) | undefined>,
      default: undefined,
    },
    onPress: {
      type: Function as PropType<((event: PressEvent) => void) | undefined>,
      default: undefined,
    },
    onClick: {
      type: Function as PropType<((event: MouseEvent) => void) | undefined>,
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

    const computeResolvedProps = (): Record<string, unknown> => {
      const slotProps = useSlotProps(
        {
          ...(attrs as Record<string, unknown>),
          variant: props.variant,
          isQuiet: props.isQuiet,
          slot: props.slot,
          autoFocus: props.autoFocus,
          isDisabled: props.isDisabled,
          href: props.href,
          routerOptions: props.routerOptions,
          target: props.target,
          rel: props.rel,
          download: props.download,
          onPressStart: props.onPressStart,
          onPressEnd: props.onPressEnd,
          onPress: props.onPress,
          onClick: props.onClick,
          UNSAFE_className: props.UNSAFE_className,
          UNSAFE_style: props.UNSAFE_style,
        } as Record<string, unknown> & { id?: string; slot?: string },
        "link"
      );

      return useProviderProps(slotProps);
    };

    let resolvedPropsSnapshot: Record<string, unknown> = {};

    const anchorLink = useLink({
      elementType: "a",
      isDisabled: () => Boolean(resolvedPropsSnapshot.isDisabled),
      href: () => resolvedPropsSnapshot.href as string | undefined,
      routerOptions: () =>
        resolvedPropsSnapshot.routerOptions as RouterOptions | undefined,
      target: () => resolvedPropsSnapshot.target as string | undefined,
      rel: () => resolvedPropsSnapshot.rel as string | undefined,
      download: () => resolvedPropsSnapshot.download as string | boolean | undefined,
      onPressStart: (event) =>
        (resolvedPropsSnapshot.onPressStart as
          | ((value: PressEvent) => void)
          | undefined)?.(
          event
        ),
      onPressEnd: (event) =>
        (resolvedPropsSnapshot.onPressEnd as ((value: PressEvent) => void) | undefined)?.(
          event
        ),
      onPress: (event) =>
        (resolvedPropsSnapshot.onPress as ((value: PressEvent) => void) | undefined)?.(
          event
        ),
      onClick: (event) =>
        (resolvedPropsSnapshot.onClick as
          | ((value: MouseEvent) => void)
          | undefined)?.(event),
    });

    const spanLink = useLink({
      elementType: "span",
      isDisabled: () => Boolean(resolvedPropsSnapshot.isDisabled),
      href: () => resolvedPropsSnapshot.href as string | undefined,
      routerOptions: () =>
        resolvedPropsSnapshot.routerOptions as RouterOptions | undefined,
      target: () => resolvedPropsSnapshot.target as string | undefined,
      rel: () => resolvedPropsSnapshot.rel as string | undefined,
      download: () => resolvedPropsSnapshot.download as string | boolean | undefined,
      onPressStart: (event) =>
        (resolvedPropsSnapshot.onPressStart as
          | ((value: PressEvent) => void)
          | undefined)?.(
          event
        ),
      onPressEnd: (event) =>
        (resolvedPropsSnapshot.onPressEnd as ((value: PressEvent) => void) | undefined)?.(
          event
        ),
      onPress: (event) =>
        (resolvedPropsSnapshot.onPress as ((value: PressEvent) => void) | undefined)?.(
          event
        ),
      onClick: (event) =>
        (resolvedPropsSnapshot.onClick as
          | ((value: MouseEvent) => void)
          | undefined)?.(event),
    });

    const { hoverProps, isHovered } = useHover({
      isDisabled: () => Boolean(resolvedPropsSnapshot.isDisabled),
    });
    const { focusProps, isFocusVisible } = useFocusRing();

    const setElementRef = (value: unknown) => {
      elementRef.value = resolveElement(value);
    };

    onMounted(() => {
      if (!resolvedPropsSnapshot.autoFocus) {
        return;
      }

      void nextTick(() => {
        elementRef.value?.focus();
      });
    });

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
    });

    return () => {
      resolvedPropsSnapshot = computeResolvedProps();
      const resolvedProps = resolvedPropsSnapshot;
      const variant = (resolvedProps.variant as LinkVariant | undefined) ?? "primary";
      const slotNodes = normalizeSlotChildren(slots.default?.() ?? []);
      const hasHref = Boolean(resolvedProps.href);
      const isTextOnly = !hasHref && isTextOnlyChildren(slotNodes);
      const { styleProps } = useStyleProps(resolvedProps as Record<string, unknown>);
      const domProps = filterDOMProps(resolvedProps as Record<string, unknown>);

      const linkProps = isTextOnly ? spanLink.linkProps.value : anchorLink.linkProps.value;

      const mergedProps = mergeProps(domProps, styleProps, linkProps, hoverProps, focusProps, {
        ref: setElementRef,
        class: classNames(
          "spectrum-Link",
          {
            "spectrum-Link--quiet": Boolean(resolvedProps.isQuiet),
            [`spectrum-Link--${variant}`]: Boolean(variant),
            "is-hovered": isHovered.value,
            "focus-ring": isFocusVisible.value,
          },
          styleProps.class as ClassValue | undefined,
          domProps.class as ClassValue | undefined
        ),
      });

      if (hasHref) {
        return h("a", mergedProps, slotNodes);
      }

      if (isTextOnly) {
        return h("span", mergedProps, slotNodes);
      }

      const wrappedChild = getWrappedElement(slotNodes);
      const childRef = (wrappedChild as VNode & { ref?: unknown }).ref;

      return cloneVNode(
        wrappedChild,
        mergeProps(wrappedChild.props ?? {}, mergedProps, {
          ref: (value: unknown) => {
            setElementRef(value);
            assignVNodeRef(childRef, value);
          },
        }),
        true
      );
    };
  },
});
