import { useFocusable, usePress } from "@vue-aria/interactions";
import {
  filterDOMProps,
  handleLinkClick,
  mergeProps,
  useLinkProps,
  useRouter,
} from "@vue-aria/utils";

export interface AriaLinkOptions {
  href?: string;
  target?: string;
  rel?: string;
  download?: string | boolean;
  ping?: string;
  referrerPolicy?: string;
  routerOptions?: Record<string, unknown>;
  isDisabled?: boolean;
  elementType?: string;
  onPress?: (event: unknown) => void;
  onPressStart?: (event: unknown) => void;
  onPressEnd?: (event: unknown) => void;
  onClick?: (event: MouseEvent) => void;
  "aria-current"?: string | boolean;
  [key: string]: unknown;
}

export interface LinkAria {
  linkProps: Record<string, unknown>;
  isPressed: boolean;
}

export function useLink(
  props: AriaLinkOptions,
  ref: { current: Element | null } = { current: null }
): LinkAria {
  const {
    elementType = "a",
    onPress,
    onPressStart,
    onPressEnd,
    onClick,
    isDisabled,
    ...otherProps
  } = props;

  let linkProps: Record<string, unknown> = {};
  if (elementType !== "a") {
    linkProps = {
      role: "link",
      tabIndex: !isDisabled ? 0 : undefined,
    };
  }

  const focusRef = {
    get value() {
      return ref.current;
    },
    set value(value: Element | null) {
      ref.current = value;
    },
  };

  const { focusableProps } = useFocusable(props as any, focusRef as any);
  const { pressProps, isPressed } = usePress({
    onPress,
    onPressStart,
    onPressEnd,
    onClick,
    isDisabled,
    ref,
  });

  const domProps = filterDOMProps(otherProps, { labelable: true });
  const interactionHandlers = mergeProps(focusableProps, pressProps);
  const router = useRouter();
  const routerLinkProps = useLinkProps(props);

  return {
    isPressed,
    linkProps: mergeProps(domProps, routerLinkProps, {
      ...interactionHandlers,
      ...linkProps,
      "aria-disabled": isDisabled || undefined,
      "aria-current": props["aria-current"],
      onClick: (event: MouseEvent) => {
        (pressProps.onClick as ((event: MouseEvent) => void) | undefined)?.(event);
        handleLinkClick(event, router, props.href, props.routerOptions);
      },
    }),
  };
}
