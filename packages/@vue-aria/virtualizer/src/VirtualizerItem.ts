import type { CSSProperties } from "vue";
import type { LayoutInfo } from "@vue-aria/virtualizer-state";
import type { Direction } from "./utils";

const layoutStyleCache = new WeakMap<LayoutInfo, CSSProperties>();

export function layoutInfoToStyle(
  layoutInfo: LayoutInfo,
  dir: Direction,
  parent?: LayoutInfo | null
): CSSProperties {
  const xProperty = dir === "rtl" ? "right" : "left";
  const cached = layoutStyleCache.get(layoutInfo);
  if (cached && cached[xProperty] != null) {
    if (!parent) {
      return cached;
    }

    const top = layoutInfo.rect.y - parent.rect.y;
    const x = layoutInfo.rect.x - parent.rect.x;
    if (cached.top === top && cached[xProperty] === x) {
      return cached;
    }
  }

  const shouldOffsetByParent = !(parent?.allowOverflow && layoutInfo.isSticky);
  const rectStyles: Record<string, number | undefined> = {
    top: layoutInfo.rect.y - (parent && shouldOffsetByParent ? parent.rect.y : 0),
    [xProperty]:
      layoutInfo.rect.x - (parent && shouldOffsetByParent ? parent.rect.x : 0),
    width: layoutInfo.rect.width,
    height: layoutInfo.rect.height,
  };

  for (const [key, value] of Object.entries(rectStyles)) {
    if (!Number.isFinite(value)) {
      rectStyles[key] = undefined;
    }
  }

  const style: CSSProperties = {
    position: layoutInfo.isSticky ? "sticky" : "absolute",
    display: layoutInfo.isSticky ? "inline-block" : undefined,
    overflow: layoutInfo.allowOverflow ? "visible" : "hidden",
    opacity: layoutInfo.opacity,
    zIndex: layoutInfo.zIndex,
    transform: layoutInfo.transform ?? undefined,
    contain: "size layout style",
    ...rectStyles,
  };

  layoutStyleCache.set(layoutInfo, style);
  return style;
}
