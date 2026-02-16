import { useVirtualizerItem, type IVirtualizer, type LayoutInfo, type VirtualizerItemOptions } from "./useVirtualizerItem";
import type { Direction } from "./utils";

export interface VirtualizerItemProps extends Omit<VirtualizerItemOptions, "ref"> {
  layoutInfo: LayoutInfo;
  parent?: LayoutInfo | null;
  style?: Record<string, string | number | undefined>;
  className?: string;
  children?: unknown;
}

export interface VirtualizerItemHookOptions {
  layoutInfo: LayoutInfo;
  virtualizer: IVirtualizer;
  style?: Record<string, string | number | undefined>;
}

const styleCache = new WeakMap<object, Record<string, unknown>>();

export function layoutInfoToStyle(layoutInfo: LayoutInfo, dir: Direction, parent?: LayoutInfo | null) {
  const xProperty = dir === "rtl" ? "right" : "left";
  const cacheKey = layoutInfo as object;
  const cached = styleCache.get(cacheKey);
  if (cached && cached[xProperty] != null) {
    if (!parent) return cached;
    const top = layoutInfo.y - (parent?.y ?? 0);
    const x = layoutInfo.x - (parent?.x ?? 0);
    if (cached.top === top && cached[xProperty] === x) return cached;
  }

  const rectStyles: Record<string, number | undefined> = {
    top: layoutInfo.y - (parent && !parent.allowOverflow ? parent.y : 0),
    [xProperty]: layoutInfo.x - (parent && !parent.allowOverflow ? parent.x : 0),
    width: layoutInfo.width,
    height: layoutInfo.height,
  };

  const style: Record<string, unknown> = {
    position: "absolute",
    display: layoutInfo.isSticky ? "inline-block" : undefined,
    overflow: "hidden",
    opacity: 1,
    zIndex: 0,
    ...rectStyles,
  };
  styleCache.set(cacheKey, style);
  return style;
}

export function VirtualizerItem(props: VirtualizerItemProps): Record<string, unknown> {
  const ref: { current: HTMLElement | null } = {current: null};
  useVirtualizerItem({
    layoutInfo: props.layoutInfo,
    virtualizer: props.virtualizer,
    ref,
  });

  return {
    role: "presentation",
    className: props.className,
    style: {
      ...layoutInfoToStyle(props.layoutInfo, "ltr", props.parent),
      ...(props.style ?? {}),
    },
    children: props.children,
  };
}
