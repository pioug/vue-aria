import type {
  ItemDropTarget,
  Key,
  LayoutDelegate,
  Node,
} from "@vue-stately/layout/src/types";
import type { InvalidationContext } from "./types";
import { LayoutInfo } from "./LayoutInfo";
import type { Rect } from "./Rect";
import type { Size } from "./Size";
import type { Virtualizer } from "./Virtualizer";

/**
 * Virtualizer supports arbitrary layout objects, which compute what items are visible, and how
 * layout info are positioned.
 *
 * Every layout extends from the Layout abstract base class. Layouts must implement the `getVisibleLayoutInfos`,
 * `getLayoutInfo`, and `getContentSize` methods. All other methods can be optionally overridden to implement custom behavior.
 */
export abstract class Layout<T extends object = Node<any>, O = any> implements LayoutDelegate {
  /** The Virtualizer the layout is currently attached to. */
  virtualizer: Virtualizer<T, any> | null = null;

  /**
   * Returns an array of `LayoutInfo` objects which are inside the given rectangle.
   * Should be implemented by subclasses.
   * @param rect The rectangle that should contain the returned LayoutInfo objects.
   */
  abstract getVisibleLayoutInfos(rect: Rect): LayoutInfo[];

  /**
   * Returns a `LayoutInfo` for the given key.
   * Should be implemented by subclasses.
   * @param key The key of the LayoutInfo to retrieve.
   */
  abstract getLayoutInfo(key: Key): LayoutInfo | null;

  /**
   * Returns size of the content. By default, it returns virtualizer's size.
   */
  abstract getContentSize(): Size;

  /**
   * Returns whether the layout should invalidate in response to
   * visible rectangle changes. By default, it only invalidates
   * when the virtualizer's size changes. Return true always
   * to make the layout invalidate while scrolling (e.g. sticky headers).
   */
  shouldInvalidate(newRect: Rect, oldRect: Rect): boolean {
    return newRect.width !== oldRect.width || newRect.height !== oldRect.height;
  }

  /**
   * Returns whether the layout should invalidate when the layout options change.
   * By default it invalidates when the object identity changes. Override this
   * method to optimize layout updates based on specific option changes.
   */
  shouldInvalidateLayoutOptions(newOptions: O, oldOptions: O): boolean {
    return newOptions !== oldOptions;
  }

  /**
   * This method allows the layout to perform any pre-computation
   * it needs to in order to prepare LayoutInfos for retrieval.
   * Called by the virtualizer before `getVisibleLayoutInfos`
   * or `getLayoutInfo` are called.
   */
  update(_invalidationContext: InvalidationContext): void {}

  /**
   * Updates the size of the given item.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateItemSize?(_key: Key, _size: Size): boolean;

  /**
   * Returns a `LayoutInfo` for the given drop target.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getDropTargetLayoutInfo?(_target: ItemDropTarget): LayoutInfo;

  /** @private */
  getItemRect(key: Key): Rect | null {
    return this.getLayoutInfo(key)?.rect ?? null;
  }

  /** @private */
  getVisibleRect(): Rect {
    return this.virtualizer!.visibleRect;
  }
}
