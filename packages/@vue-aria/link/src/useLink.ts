import { computed, toValue } from "vue";
import { useFocus } from "@vue-aria/interactions";
import { usePress } from "@vue-aria/interactions";
import { handleLinkClick, mergeProps, useRouter } from "@vue-aria/utils";
import type { MaybeReactive, PressEvent, ReadonlyRef } from "@vue-aria/types";
import type { RouterOptions } from "@vue-aria/utils";

type LinkElementType = "a" | "span" | "div";

export interface UseLinkOptions {
  elementType?: MaybeReactive<LinkElementType>;
  isDisabled?: MaybeReactive<boolean>;
  href?: MaybeReactive<string | undefined>;
  routerOptions?: MaybeReactive<RouterOptions | undefined>;
  target?: MaybeReactive<string | undefined>;
  rel?: MaybeReactive<string | undefined>;
  download?: MaybeReactive<string | boolean | undefined>;
  onPressStart?: (event: PressEvent) => void;
  onPressEnd?: (event: PressEvent) => void;
  onPress?: (event: PressEvent) => void;
  onClick?: (event: MouseEvent) => void;
}

export interface UseLinkResult {
  linkProps: ReadonlyRef<Record<string, unknown>>;
  isPressed: ReadonlyRef<boolean>;
}

export function useLink(options: UseLinkOptions = {}): UseLinkResult {
  const router = useRouter();

  const elementType = computed<LinkElementType>(() => {
    if (options.elementType === undefined) {
      return "a";
    }

    return toValue(options.elementType);
  });

  const isDisabled = computed(() => {
    if (options.isDisabled === undefined) {
      return false;
    }
    return Boolean(toValue(options.isDisabled));
  });

  const { pressProps, isPressed } = usePress({
    isDisabled,
    onPressStart: options.onPressStart,
    onPressEnd: options.onPressEnd,
    onPress: options.onPress,
  });
  const { focusProps } = useFocus({ isDisabled });

  const linkProps = computed<Record<string, unknown>>(() => {
    const isAnchor = elementType.value === "a";
    const disabled = isDisabled.value;
    const href = options.href === undefined ? undefined : toValue(options.href);
    const target = options.target === undefined ? undefined : toValue(options.target);
    const rel = options.rel === undefined ? undefined : toValue(options.rel);
    const download =
      options.download === undefined ? undefined : toValue(options.download);
    const routerOptions =
      options.routerOptions === undefined
        ? undefined
        : toValue(options.routerOptions);
    const resolvedHref = href ? router.useHref(href) : undefined;

    const props: Record<string, unknown> = mergeProps(pressProps, focusProps, {
      onClick: (event: MouseEvent) => {
        if (disabled) {
          event.preventDefault();
        }

        options.onClick?.(event);

        if (disabled || !href || event.defaultPrevented) {
          return;
        }

        if (!isAnchor) {
          const currentTarget = event.currentTarget;
          if (currentTarget instanceof Element) {
            router.open(currentTarget, event, href, routerOptions);
          }
          return;
        }

        handleLinkClick(event, router, href, routerOptions);
      },
      "aria-disabled": disabled || undefined,
    });

    if (!isAnchor) {
      props.role = "link";
      props.tabindex = disabled ? undefined : 0;
      props["data-href"] = resolvedHref;
      props["data-target"] = target;
      props["data-rel"] = rel;
      props["data-download"] = download === undefined ? undefined : String(download);
      return props;
    }

    props.tabindex = 0;
    if (!disabled && resolvedHref) {
      props.href = resolvedHref;
    }

    if (target) {
      props.target = target;
    }

    if (rel) {
      props.rel = rel;
    }

    if (download !== undefined) {
      props.download = download;
    }

    return props;
  });

  return {
    linkProps,
    isPressed,
  };
}
