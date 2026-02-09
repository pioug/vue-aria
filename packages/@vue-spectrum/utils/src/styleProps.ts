import type { CSSProperties } from "vue";
import { useLocale } from "@vue-aria/i18n";

export type Direction = "ltr" | "rtl";
export type Breakpoint = "base" | "S" | "M" | "L" | string;
export type ResponsiveProp<T> = Record<string, T | undefined> & {
  base?: T | undefined;
};
export type Responsive<T> = T | ResponsiveProp<T> | undefined;
export type DimensionValue = string | number | undefined;

type StyleName = string | string[] | ((dir: Direction) => string);
type StyleHandler = (value: unknown, colorVersion?: number) => unknown;

export interface StyleHandlers {
  [key: string]: [StyleName, StyleHandler];
}

export interface StyleProps {
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: CSSProperties | undefined;
  isHidden?: Responsive<boolean>;
  colorVersion?: number | undefined;
  [key: string]: unknown;
}

const borderStyleProps: Record<string, string> = {
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

export function dimensionValue(value?: unknown): string | undefined {
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
    return value.replace(
      SPECTRUM_VARIABLE_RE,
      "var(--spectrum-global-dimension-$&, var(--spectrum-alias-$&))"
    );
  }

  return `var(--spectrum-global-dimension-${value}, var(--spectrum-alias-${value}))`;
}

export function responsiveDimensionValue(
  value: Responsive<DimensionValue>,
  matchedBreakpoints: Breakpoint[]
): string | undefined {
  const responsiveValue = getResponsiveProp(value, matchedBreakpoints);
  if (responsiveValue != null) {
    return dimensionValue(responsiveValue);
  }
}

type ColorType = "default" | "background" | "border" | "icon" | "status";

function colorValue(
  value: string,
  type: ColorType = "default",
  version = 5
): string {
  if (version > 5) {
    return `var(--spectrum-${value}, var(--spectrum-semantic-${value}-color-${type}))`;
  }

  return `var(--spectrum-legacy-color-${value}, var(--spectrum-global-color-${value}, var(--spectrum-semantic-${value}-color-${type})))`;
}

function backgroundColorValue(
  value: unknown,
  version = 5
): string | undefined {
  if (!value || typeof value !== "string") {
    return undefined;
  }

  return `var(--spectrum-alias-background-color-${value}, ${colorValue(value, "background", version)})`;
}

function borderColorValue(value: unknown, version = 5): string | undefined {
  if (!value || typeof value !== "string") {
    return undefined;
  }

  if (value === "default") {
    return "var(--spectrum-alias-border-color)";
  }

  return `var(--spectrum-alias-border-color-${value}, ${colorValue(value, "border", version)})`;
}

function borderSizeValue(value?: unknown): string {
  return value && value !== "none"
    ? `var(--spectrum-alias-border-size-${String(value)})`
    : "0";
}

function borderRadiusValue(value: unknown): string | undefined {
  if (!value || typeof value !== "string") {
    return undefined;
  }

  return `var(--spectrum-alias-border-radius-${value})`;
}

function hiddenValue(value: unknown): string | undefined {
  return value ? "none" : undefined;
}

function anyValue(value: unknown): unknown {
  return value;
}

function flexValue(value: unknown): string | undefined {
  if (typeof value === "boolean") {
    return value ? "1" : undefined;
  }

  if (value === undefined || value === null) {
    return undefined;
  }

  return String(value);
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
  alignSelf: ["alignSelf", anyValue],
  justifySelf: ["justifySelf", anyValue],
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
  flexGrow: ["flexGrow", anyValue],
  flexShrink: ["flexShrink", anyValue],
  flexBasis: ["flexBasis", anyValue],
  gridArea: ["gridArea", anyValue],
  gridColumn: ["gridColumn", anyValue],
  gridColumnEnd: ["gridColumnEnd", anyValue],
  gridColumnStart: ["gridColumnStart", anyValue],
  gridRow: ["gridRow", anyValue],
  gridRowEnd: ["gridRowEnd", anyValue],
  gridRowStart: ["gridRowStart", anyValue],
};

export const viewStyleProps: StyleHandlers = {
  ...baseStyleProps,
  backgroundColor: ["backgroundColor", backgroundColorValue],
  borderWidth: ["borderWidth", borderSizeValue],
  borderStartWidth: [rtl("borderLeftWidth", "borderRightWidth"), borderSizeValue],
  borderEndWidth: [rtl("borderRightWidth", "borderLeftWidth"), borderSizeValue],
  borderLeftWidth: ["borderLeftWidth", borderSizeValue],
  borderRightWidth: ["borderRightWidth", borderSizeValue],
  borderTopWidth: ["borderTopWidth", borderSizeValue],
  borderBottomWidth: ["borderBottomWidth", borderSizeValue],
  borderXWidth: [["borderLeftWidth", "borderRightWidth"], borderSizeValue],
  borderYWidth: [["borderTopWidth", "borderBottomWidth"], borderSizeValue],
  borderColor: ["borderColor", borderColorValue],
  borderStartColor: [rtl("borderLeftColor", "borderRightColor"), borderColorValue],
  borderEndColor: [rtl("borderRightColor", "borderLeftColor"), borderColorValue],
  borderLeftColor: ["borderLeftColor", borderColorValue],
  borderRightColor: ["borderRightColor", borderColorValue],
  borderTopColor: ["borderTopColor", borderColorValue],
  borderBottomColor: ["borderBottomColor", borderColorValue],
  borderXColor: [["borderLeftColor", "borderRightColor"], borderColorValue],
  borderYColor: [["borderTopColor", "borderBottomColor"], borderColorValue],
  borderRadius: ["borderRadius", borderRadiusValue],
  borderTopStartRadius: [rtl("borderTopLeftRadius", "borderTopRightRadius"), borderRadiusValue],
  borderTopEndRadius: [rtl("borderTopRightRadius", "borderTopLeftRadius"), borderRadiusValue],
  borderBottomStartRadius: [
    rtl("borderBottomLeftRadius", "borderBottomRightRadius"),
    borderRadiusValue,
  ],
  borderBottomEndRadius: [
    rtl("borderBottomRightRadius", "borderBottomLeftRadius"),
    borderRadiusValue,
  ],
  borderTopLeftRadius: ["borderTopLeftRadius", borderRadiusValue],
  borderTopRightRadius: ["borderTopRightRadius", borderRadiusValue],
  borderBottomLeftRadius: ["borderBottomLeftRadius", borderRadiusValue],
  borderBottomRightRadius: ["borderBottomRightRadius", borderRadiusValue],
  padding: ["padding", dimensionValue],
  paddingStart: [rtl("paddingLeft", "paddingRight"), dimensionValue],
  paddingEnd: [rtl("paddingRight", "paddingLeft"), dimensionValue],
  paddingLeft: ["paddingLeft", dimensionValue],
  paddingRight: ["paddingRight", dimensionValue],
  paddingTop: ["paddingTop", dimensionValue],
  paddingBottom: ["paddingBottom", dimensionValue],
  paddingX: [["paddingLeft", "paddingRight"], dimensionValue],
  paddingY: [["paddingTop", "paddingBottom"], dimensionValue],
  overflow: ["overflow", anyValue],
};

export function convertStyleProps(
  props: StyleProps,
  handlers: StyleHandlers,
  direction: Direction,
  matchedBreakpoints: Breakpoint[]
): CSSProperties {
  const style: CSSProperties = {};

  for (const key of Object.keys(props)) {
    const styleProp = handlers[key];
    if (!styleProp || props[key] == null) {
      continue;
    }

    let [name, convert] = styleProp;
    if (typeof name === "function") {
      name = name(direction);
    }

    const responsiveValue = getResponsiveProp(
      props[key] as Responsive<unknown>,
      matchedBreakpoints
    );
    const convertedValue = convert(responsiveValue, props.colorVersion);

    if (Array.isArray(name)) {
      for (const styleName of name) {
        (style as Record<string, unknown>)[styleName] = convertedValue;
      }
    } else {
      (style as Record<string, unknown>)[name] = convertedValue;
    }
  }

  for (const [widthProp, borderStyleProp] of Object.entries(borderStyleProps)) {
    if ((style as Record<string, unknown>)[widthProp]) {
      (style as Record<string, unknown>)[borderStyleProp] = "solid";
      (style as Record<string, unknown>).boxSizing = "border-box";
    }
  }

  return style;
}

interface StylePropsOptions {
  matchedBreakpoints?: Breakpoint[];
}

export function useStyleProps<T extends StyleProps>(
  props: T,
  handlers: StyleHandlers = baseStyleProps,
  options: StylePropsOptions = {}
): { styleProps: { style: CSSProperties; class?: string; hidden?: true } } {
  const { direction } = useLocale().value;
  const matchedBreakpoints = options.matchedBreakpoints ?? ["base"];
  const styles = convertStyleProps(props, handlers, direction, matchedBreakpoints);
  const style = {
    ...(props.UNSAFE_style ?? {}),
    ...styles,
  };

  const styleProps: {
    style: CSSProperties;
    class?: string;
    hidden?: true;
  } = {
    style,
    class: props.UNSAFE_className,
  };

  if (getResponsiveProp(props.isHidden, matchedBreakpoints)) {
    styleProps.hidden = true;
  }

  return { styleProps };
}

export function passthroughStyle(value: unknown): unknown {
  return value;
}

export function getResponsiveProp<T>(
  prop: Responsive<T>,
  matchedBreakpoints: Breakpoint[]
): T | undefined {
  if (prop && typeof prop === "object" && !Array.isArray(prop)) {
    const responsiveProp = prop as ResponsiveProp<T>;

    for (let index = 0; index < matchedBreakpoints.length; index += 1) {
      const breakpoint = matchedBreakpoints[index];
      if (responsiveProp[breakpoint] != null) {
        return responsiveProp[breakpoint];
      }
    }

    return responsiveProp.base;
  }

  return prop as T;
}
