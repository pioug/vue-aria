import type { Key } from "@vue-aria/types";
import { LayoutInfo } from "./LayoutInfo";
import { Virtualizer } from "./Virtualizer";

let keyCounter = 0;

export class ReusableView<T extends object, V> {
  virtualizer: Virtualizer<T, V>;
  layoutInfo: LayoutInfo | null;
  content: T | null;
  rendered: V | null;
  viewType: string;
  key: Key;
  children: Set<ChildView<T, V>>;
  reusableViews: Map<string, ChildView<T, V>[]>;

  constructor(virtualizer: Virtualizer<T, V>, viewType: string) {
    this.virtualizer = virtualizer;
    this.key = ++keyCounter;
    this.viewType = viewType;
    this.children = new Set();
    this.reusableViews = new Map();
    this.layoutInfo = null;
    this.content = null;
    this.rendered = null;
  }

  prepareForReuse(): void {
    this.content = null;
    this.rendered = null;
    this.layoutInfo = null;
  }

  getReusableView(reuseType: string): ChildView<T, V> {
    const reusable = this.reusableViews.get(reuseType);
    const view =
      reusable && reusable.length > 0
        ? reusable.shift()
        : new ChildView<T, V>(this.virtualizer, this, reuseType);

    return view as ChildView<T, V>;
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
