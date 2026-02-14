import { useLocale } from "@vue-aria/i18n";
import type { ReadonlyRef } from "@vue-aria/types";
import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { useBreakpoint } from "./BreakpointProvider";

export type Breakpoint = "base" | "S" | "M" | "L" | string;
export type Direction = "ltr" | "rtl";
export type ResponsiveProp<T> = { base?: T; [key: string]: T | undefined };
export type Responsive<T> = T | ResponsiveProp<T>;
export type StyleName = string | string[] | ((direction: Direction) => string);
export type StyleHandler = (value: unknown, colorVersion?: number) => unknown;

export interface StyleHandlers {
  [key: string]: [StyleName, StyleHandler];
}

export const baseStyleProps: StyleHandlers = {
  margin: ["margin", dimensionValue],
  marginStart: [rtl("marginLeft", "marginRight"), dimensionValue],
  marginEnd: [rtl("marginRight", "marginLeft"), dimensionValue],
  marginTop: ["marginTop", dimensionValue],
  marginBottom: ["marginBottom", dimensionValue],
  marginX: [["marginLeft", "marginRight"], dimensionValue],
  marginY: [["marginTop", "marginBottom"], dimensionValue],
  width: ["width", dimensionValue],
  height: ["height", dimensionValue],
  minWidth: ["minWidth", dimensionValue],
  minHeight: ["minHeight", dimensionValue],
  maxWidth: ["maxWidth", dimensionValue],
  maxHeight: ["maxHeight", dimensionValue],
  isHidden: ["display", hiddenValue],
  alignSelf: ["alignSelf", passthroughStyle],
  justifySelf: ["justifySelf", passthroughStyle],
  position: ["position", anyValue],
  zIndex: ["zIndex", anyValue],
  top: ["top", dimensionValue],
  bottom: ["bottom", dimensionValue],
  start: [rtl("left", "right"), dimensionValue],
  end: [rtl("right", "left"), dimensionValue],
  left: ["left", dimensionValue],
  right: ["right", dimensionValue],
  order: ["order", anyValue],
  flex: ["flex", flexValue],
  flexGrow: ["flexGrow", passthroughStyle],
  flexShrink: ["flexShrink", passthroughStyle],
  flexBasis: ["flexBasis", passthroughStyle],
  gridArea: ["gridArea", passthroughStyle],
  gridColumn: ["gridColumn", passthroughStyle],
  gridColumnEnd: ["gridColumnEnd", passthroughStyle],
  gridColumnStart: ["gridColumnStart", passthroughStyle],
  gridRow: ["gridRow", passthroughStyle],
  gridRowEnd: ["gridRowEnd", passthroughStyle],
  gridRowStart: ["gridRowStart", passthroughStyle],
};

const borderStyleProps = {
  borderWidth: "borderStyle",
  borderLeftWidth: "borderLeftStyle",
  borderRightWidth: "borderRightStyle",
  borderTopWidth: "borderTopStyle",
  borderBottomWidth: "borderBottomStyle",
};

function rtl(ltr: string, rtlValue: string) {
  return (direction: Direction) => (direction === "rtl" ? rtlValue : ltr);
}

const UNIT_RE = /(%|px|em|rem|vw|vh|auto|cm|mm|in|pt|pc|ex|ch|rem|vmin|vmax|fr)$/;
const FUNC_RE = /^\s*\w+\(/;
const SPECTRUM_VARIABLE_RE = /(static-)?size-\d+|single-line-(height|width)/g;

export function dimensionValue(value: unknown): string | undefined {
  if (typeof value === "number") {
    return `${value}px`;
  }

  if (!value || typeof value !== "string") {
    return undefined;
  }

  if (UNIT_RE.test(value)) {
    return value;
  }

  if (FUNC_RE.test(value)) {
    return value.replace(SPECTRUM_VARIABLE_RE, "var(--spectrum-global-dimension-$&, var(--spectrum-alias-$&))");
  }

  return `var(--spectrum-global-dimension-${value}, var(--spectrum-alias-${value}))`;
}

export function responsiveDimensionValue(
  value: Responsive<unknown>,
  matchedBreakpoints: Breakpoint[]
): string | undefined {
  const responsiveValue = getResponsiveProp(value, matchedBreakpoints);
  if (responsiveValue != null) {
    return dimensionValue(responsiveValue);
  }
}

function hiddenValue(value: unknown): string | undefined {
  return value === true ? "none" : undefined;
}

function anyValue<T>(value: T): T {
  return value;
}

function flexValue(value: unknown): string | undefined {
  if (typeof value === "boolean") {
    return value ? "1" : undefined;
  }

  if (value == null) {
    return undefined;
  }

  return `${value}`;
}

export function convertStyleProps(
  props: Record<string, unknown>,
  handlers: StyleHandlers,
  direction: Direction,
  matchedBreakpoints: Breakpoint[]
): Record<string, unknown> {
  const style: Record<string, unknown> = {};

  for (const key in props) {
    const styleProp = handlers[key];
    if (!styleProp || props[key] == null) {
      continue;
    }

    let [name, convert] = styleProp;
    if (typeof name === "function") {
      name = name(direction);
    }

    const prop = getResponsiveProp(props[key] as Responsive<unknown>, matchedBreakpoints);
    const value = convert(prop);
    if (Array.isArray(name)) {
      for (const styleKey of name) {
        style[styleKey] = value;
      }
    } else {
      style[name] = value;
    }
  }

  for (const prop in borderStyleProps) {
    if (style[prop]) {
      const borderStyleProp = borderStyleProps[prop as keyof typeof borderStyleProps];
      style[borderStyleProp] = "solid";
      style.boxSizing = "border-box";
    }
  }

  return style;
}

type StylePropsOptions = {
  matchedBreakpoints?: MaybeRefOrGetter<Breakpoint[]>;
};

export function useStyleProps<T extends Record<string, unknown>>(
  props: T,
  handlers: StyleHandlers = baseStyleProps,
  options: StylePropsOptions = {}
): { styleProps: ReadonlyRef<Record<string, unknown>> } {
  const locale = useLocale();
  const breakpointContext = useBreakpoint();
  const matchedBreakpoints = computed(
    () => toValue(options.matchedBreakpoints) ?? breakpointContext?.value.matchedBreakpoints ?? ["base"]
  );

  const styles = computed(() =>
    convertStyleProps(props, handlers, locale.value.direction, matchedBreakpoints.value)
  );

  if ("className" in props && process.env.NODE_ENV !== "production") {
    console.warn(
      "The className prop is unsafe and unsupported. Use style props or UNSAFE_className instead."
    );
  }

  if ("style" in props && process.env.NODE_ENV !== "production") {
    console.warn(
      "The style prop is unsafe and unsupported. Use style props or UNSAFE_style instead."
    );
  }

  const styleProps = computed<Record<string, unknown>>(() => {
    const unsafeStyle = (props.UNSAFE_style as Record<string, unknown> | undefined) ?? {};
    const resolved: Record<string, unknown> = {
      style: {
        ...unsafeStyle,
        ...styles.value,
      },
      class: props.UNSAFE_className as string | undefined,
    };

    if (getResponsiveProp(props.isHidden as Responsive<boolean>, matchedBreakpoints.value)) {
      resolved.hidden = true;
    }

    return resolved;
  });

  return { styleProps };
}

export function passthroughStyle<T>(value: T): T {
  return value;
}

export function getResponsiveProp<T>(
  prop: Responsive<T>,
  matchedBreakpoints: Breakpoint[]
): T | undefined {
  if (prop && typeof prop === "object" && !Array.isArray(prop)) {
    for (let i = 0; i < matchedBreakpoints.length; i += 1) {
      const breakpoint = matchedBreakpoints[i];
      if ((prop as ResponsiveProp<T>)[breakpoint] != null) {
        return (prop as ResponsiveProp<T>)[breakpoint];
      }
    }
    return (prop as ResponsiveProp<T>).base;
  }

  return prop as T;
}
