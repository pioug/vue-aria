import { computed, toValue } from "vue";
import { useFocus } from "@vue-aria/interactions";
import { usePress } from "@vue-aria/interactions";
import { mergeProps } from "@vue-aria/utils";
import type { MaybeReactive, PressEvent, ReadonlyRef } from "@vue-aria/types";

type LinkElementType = "a" | "span" | "div";

export interface UseLinkOptions {
  elementType?: MaybeReactive<LinkElementType>;
  isDisabled?: MaybeReactive<boolean>;
  href?: MaybeReactive<string | undefined>;
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
    const props: Record<string, unknown> = mergeProps(pressProps, focusProps, {
      onClick: (event: MouseEvent) => {
        if (disabled) {
          event.preventDefault();
        }
        options.onClick?.(event);
      },
      "aria-disabled": disabled || undefined,
    });

    if (!isAnchor) {
      props.role = "link";
      props.tabindex = disabled ? undefined : 0;
      return props;
    }

    props.tabindex = 0;
    if (!disabled) {
      const href = options.href === undefined ? undefined : toValue(options.href);
      if (href) {
        props.href = href;
      }
    }

    const target = options.target === undefined ? undefined : toValue(options.target);
    if (target) {
      props.target = target;
    }

    const rel = options.rel === undefined ? undefined : toValue(options.rel);
    if (rel) {
      props.rel = rel;
    }

    const download =
      options.download === undefined ? undefined : toValue(options.download);
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
