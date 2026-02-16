import { useVirtualizerItem, type IVirtualizer, type LayoutInfo, type VirtualizerItemOptions } from "./useVirtualizerItem";
import type { Direction } from "./utils";
import type { Rect } from "./Rect";

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

function getRect(layoutInfo: LayoutInfo): Rect {
  if ("rect" in layoutInfo) {
    return layoutInfo.rect;
  }
  return layoutInfo;
}

export function layoutInfoToStyle(layoutInfo: LayoutInfo, dir: Direction, parent?: LayoutInfo | null) {
  const rect = getRect(layoutInfo);
  const parentRect = parent ? getRect(parent) : null;
  const xProperty = dir === "rtl" ? "right" : "left";
  const cacheKey = layoutInfo as object;
  const cached = styleCache.get(cacheKey);
  if (cached && cached[xProperty] != null) {
    if (!parentRect) return cached;
    const top = rect.y - (parentRect.allowOverflow ? 0 : parentRect.y);
    const x = rect.x - (parentRect.allowOverflow ? 0 : parentRect.x);
    if (cached.top === top && cached[xProperty] === x) return cached;
  }

  const rectStyles: Record<string, number | undefined> = {
    top: rect.y - (parentRect && !parentRect.allowOverflow ? parentRect.y : 0),
    [xProperty]: rect.x - (parentRect && !parentRect.allowOverflow ? parentRect.x : 0),
    width: rect.width,
    height: rect.height,
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
