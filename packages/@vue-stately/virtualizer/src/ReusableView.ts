import type { Key } from "@vue-stately/layout/src/types";
import { LayoutInfo } from "./LayoutInfo";
import type { Virtualizer } from "./Virtualizer";

let KEY = 0;

/**
 * `Virtualizer` creates instances of the `ReusableView` class to
 * represent views currently being displayed.
 */
export class ReusableView<T extends object, V> {
  /** The Virtualizer this view is a part of. */
  virtualizer: Virtualizer<T, V>;

  /** The LayoutInfo this view is currently representing. */
  layoutInfo: LayoutInfo | null;

  /** The content currently being displayed by this view, set by the virtualizer. */
  content: T | null;

  rendered: V | null;
  viewType: string;
  key: Key;
  children: Set<ChildView<T, V>>;
  reusableViews: Map<string, ChildView<T, V>[]>;

  constructor(virtualizer: Virtualizer<T, V>, viewType: string) {
    this.virtualizer = virtualizer;
    this.key = ++KEY;
    this.viewType = viewType;
    this.children = new Set();
    this.reusableViews = new Map();
    this.layoutInfo = null;
    this.content = null;
    this.rendered = null;
  }

  /**
   * Prepares the view for reuse. Called just before the view is removed from the DOM.
   */
  prepareForReuse(): void {
    this.content = null;
    this.rendered = null;
    this.layoutInfo = null;
  }

  getReusableView(reuseType: string): ChildView<T, V> {
    // Reusable view queue should be FIFO so that DOM order remains consistent during scrolling.
    // For example, cells within a row should remain in the same order even if the row changes contents.
    // The cells within a row are removed from their parent in order. If the row is reused, the cells
    // should be reused in the new row in the same order they were before.
    const reusable = this.reusableViews.get(reuseType);
    const view =
      reusable && reusable.length > 0
        ? reusable.shift()!
        : new ChildView<T, V>(this.virtualizer, this, reuseType);

    return view;
  }

  reuseChild(child: ChildView<T, V>): void {
    child.prepareForReuse();
    let reusable = this.reusableViews.get(child.viewType);
    if (!reusable) {
      reusable = [];
      this.reusableViews.set(child.viewType, reusable);
    }
    reusable.push(child);
  }
}

export class RootView<T extends object, V> extends ReusableView<T, V> {
  constructor(virtualizer: Virtualizer<T, V>) {
    super(virtualizer, "root");
  }
}

export class ChildView<T extends object, V> extends ReusableView<T, V> {
  parent: ReusableView<T, V>;

  constructor(virtualizer: Virtualizer<T, V>, parent: ReusableView<T, V>, viewType: string) {
    super(virtualizer, viewType);
    this.parent = parent;
  }
}
