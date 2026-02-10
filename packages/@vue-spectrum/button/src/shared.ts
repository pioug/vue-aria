import {
  Comment,
  Fragment,
  Text as VNodeText,
  h,
  isVNode,
  type VNodeChild,
} from "vue";
import { Text } from "@vue-spectrum/text";

export type ButtonElementType = "button" | "a" | "div" | "span";

export interface BaseButtonProps {
  elementType?: ButtonElementType | undefined;
  isDisabled?: boolean | undefined;
  autoFocus?: boolean | undefined;
  href?: string | undefined;
  target?: string | undefined;
  rel?: string | undefined;
  type?: "button" | "submit" | "reset" | undefined;
  onPressStart?: ((event: unknown) => void) | undefined;
  onPressEnd?: ((event: unknown) => void) | undefined;
  onPress?: ((event: unknown) => void) | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export function normalizeChildren(
  value: VNodeChild | VNodeChild[] | undefined
): VNodeChild[] {
  if (value === undefined || value === null || value === false || value === true) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => normalizeChildren(entry));
  }

  if (!isVNode(value)) {
    return [value];
  }

  if (value.type === Comment) {
    return [];
  }

  if (value.type === Fragment) {
    return normalizeChildren((value.children as VNodeChild[] | undefined) ?? []);
  }

  if (value.type === VNodeText) {
    const text = typeof value.children === "string" ? value.children : "";
    return text.trim().length > 0 ? [text] : [];
  }

  return [value];
}

export function wrapTextChildren(value: VNodeChild[]): VNodeChild[] {
  if (value.length === 0) {
    return value;
  }

  const isTextOnly = value.every(
    (child) => typeof child === "string" || typeof child === "number"
  );

  if (!isTextOnly) {
    return value;
  }

  return [h(Text, null, () => value)];
}
