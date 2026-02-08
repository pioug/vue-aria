import type { Key } from "@vue-aria/types";
import type { InvalidationContext, ItemDropTarget } from "./types";
import { LayoutInfo } from "./LayoutInfo";
import { Rect } from "./Rect";
import { Size } from "./Size";
import type { Virtualizer } from "./Virtualizer";

export abstract class Layout<T extends object = object, O = unknown> {
  virtualizer: Virtualizer<T, unknown> | null = null;

  abstract getVisibleLayoutInfos(rect: Rect): LayoutInfo[];

  abstract getLayoutInfo(key: Key): LayoutInfo | null;

  abstract getContentSize(): Size;

  shouldInvalidate(newRect: Rect, oldRect: Rect): boolean {
    return newRect.width !== oldRect.width || newRect.height !== oldRect.height;
  }

  shouldInvalidateLayoutOptions(newOptions: O, oldOptions: O): boolean {
    return newOptions !== oldOptions;
  }

  update(_invalidationContext: InvalidationContext<O>): void {}

  updateItemSize?(key: Key, size: Size): boolean;

  getDropTargetLayoutInfo?(target: ItemDropTarget): LayoutInfo;

  getItemRect(key: Key): Rect | null {
    return this.getLayoutInfo(key)?.rect ?? null;
  }

  getVisibleRect(): Rect {
    return this.virtualizer!.visibleRect;
  }
}
