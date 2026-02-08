import type { Key } from "@vue-aria/types";
import { ChildView, ReusableView, RootView } from "./ReusableView";
import type {
  InvalidationContext,
  Mutable,
  VirtualizerCollection,
  VirtualizerDelegate,
  VirtualizerRenderOptions,
} from "./types";
import { isSetEqual } from "./utils";
import { Layout } from "./Layout";
import { LayoutInfo } from "./LayoutInfo";
import { OverscanManager } from "./OverscanManager";
import { Point } from "./Point";
import { Rect } from "./Rect";
import { Size } from "./Size";

interface VirtualizerOptions<T extends object, V> {
  delegate: VirtualizerDelegate<T, V>;
  collection: VirtualizerCollection<T>;
  layout: Layout<T>;
}

export class Virtualizer<T extends object, V> {
  delegate: VirtualizerDelegate<T, V>;
  readonly collection: VirtualizerCollection<T>;
  readonly layout: Layout<T>;
  readonly contentSize: Size;
  readonly visibleRect: Rect;
  readonly persistedKeys: Set<Key>;

  private _visibleViews: Map<Key, ChildView<T, V>>;
  private _renderedContent: WeakMap<T, V>;
  private _rootView: RootView<T, V>;
  private _isScrolling: boolean;
  private _invalidationContext: InvalidationContext;
  private _overscanManager: OverscanManager;

  constructor(options: VirtualizerOptions<T, V>) {
    this.delegate = options.delegate;
    this.collection = options.collection;
    this.layout = options.layout;
    this.contentSize = new Size();
    this.visibleRect = new Rect();
    this.persistedKeys = new Set();
    this._visibleViews = new Map();
    this._renderedContent = new WeakMap();
    this._rootView = new RootView(this);
    this._isScrolling = false;
    this._invalidationContext = {};
    this._overscanManager = new OverscanManager();
  }

  isPersistedKey(key: Key): boolean {
    if (this.persistedKeys.has(key)) {
      return true;
    }

    for (let currentKey of this.persistedKeys) {
      while (currentKey != null) {
        const layoutInfo = this.layout.getLayoutInfo(currentKey);
        if (!layoutInfo || layoutInfo.parentKey == null) {
          break;
        }

        currentKey = layoutInfo.parentKey;
        if (currentKey === key) {
          return true;
        }
      }
    }

    return false;
  }

  private getParentView(layoutInfo: LayoutInfo): ReusableView<T, V> | undefined {
    return layoutInfo.parentKey != null
      ? this._visibleViews.get(layoutInfo.parentKey)
      : this._rootView;
  }

  private getReusableView(layoutInfo: LayoutInfo): ChildView<T, V> {
    const parentView = this.getParentView(layoutInfo)!;
    const view = parentView.getReusableView(layoutInfo.type);
    view.layoutInfo = layoutInfo;
    this.renderView(view);
    return view;
  }

  private renderView(view: ReusableView<T, V>): void {
    if (view.layoutInfo) {
      const { type, key, content } = view.layoutInfo;
      view.content = (content as T | null) || this.collection.getItem(key);
      view.rendered = this.renderContent(type, view.content);
    }
  }

  private renderContent(type: string, content: T | null): V {
    const cached = content != null ? this._renderedContent.get(content) : null;
    if (cached != null) {
      return cached;
    }

    const rendered = this.delegate.renderView(type, content);
    if (content) {
      this._renderedContent.set(content, rendered);
    }

    return rendered;
  }

  keyAtPoint(point: Point): Key | null {
    const rect = new Rect(point.x, point.y, 1, 1);
    const layoutInfos = rect.area === 0 ? [] : this.layout.getVisibleLayoutInfos(rect);
    for (const layoutInfo of layoutInfos) {
      if (layoutInfo.rect.intersects(rect)) {
        return layoutInfo.key;
      }
    }

    return null;
  }

  private relayout(context: InvalidationContext = {}): void {
    this.layout.update(context);
    (this as Mutable<this>).contentSize = this.layout.getContentSize();

    const visibleRect = this.visibleRect;
    let contentOffsetX = context.contentChanged ? 0 : visibleRect.x;
    let contentOffsetY = context.contentChanged ? 0 : visibleRect.y;
    contentOffsetX = Math.max(
      0,
      Math.min(this.contentSize.width - visibleRect.width, contentOffsetX)
    );
    contentOffsetY = Math.max(
      0,
      Math.min(this.contentSize.height - visibleRect.height, contentOffsetY)
    );

    if (contentOffsetX !== visibleRect.x || contentOffsetY !== visibleRect.y) {
      const rect = new Rect(contentOffsetX, contentOffsetY, visibleRect.width, visibleRect.height);
      this.delegate.setVisibleRect(rect);
    } else {
      this.updateSubviews();
    }
  }

  getVisibleLayoutInfos(): Map<Key, LayoutInfo> {
    const isTestEnv = process.env.NODE_ENV === "test" && !process.env.VIRT_ON;
    const isClientWidthMocked =
      isTestEnv &&
      typeof HTMLElement !== "undefined" &&
      Object.getOwnPropertyNames(HTMLElement.prototype).includes("clientWidth");
    const isClientHeightMocked =
      isTestEnv &&
      typeof HTMLElement !== "undefined" &&
      Object.getOwnPropertyNames(HTMLElement.prototype).includes("clientHeight");

    const rect =
      isTestEnv && !(isClientWidthMocked && isClientHeightMocked)
        ? new Rect(0, 0, this.contentSize.width, this.contentSize.height)
        : this._overscanManager.getOverscannedRect();

    const layoutInfos = this.layout.getVisibleLayoutInfos(rect);
    const map = new Map<Key, LayoutInfo>();
    for (const layoutInfo of layoutInfos) {
      map.set(layoutInfo.key, layoutInfo);
    }

    return map;
  }

  private updateSubviews(): void {
    const visibleLayoutInfos = this.getVisibleLayoutInfos();

    const removed = new Set<ChildView<T, V>>();
    for (const [key, view] of this._visibleViews) {
      const layoutInfo = visibleLayoutInfos.get(key);
      if (!layoutInfo || view.parent !== this.getParentView(layoutInfo)) {
        this._visibleViews.delete(key);
        view.parent.reuseChild(view);
        removed.add(view);
      }
    }

    for (const [key, layoutInfo] of visibleLayoutInfos) {
      let view = this._visibleViews.get(key);
      if (!view) {
        view = this.getReusableView(layoutInfo);
        view.parent.children.add(view);
        this._visibleViews.set(key, view);
        removed.delete(view);
      } else {
        view.layoutInfo = layoutInfo;
        const item = this.collection.getItem(layoutInfo.key);
        if (view.content !== item) {
          if (view.content != null) {
            this._renderedContent.delete(view.content);
          }
          this.renderView(view);
        }
      }
    }

    for (const view of removed) {
      view.parent.children.delete(view);
      view.parent.reusableViews.clear();
    }

    if (!this._isScrolling) {
      for (const key of visibleLayoutInfos.keys()) {
        const view = this._visibleViews.get(key)!;
        view.parent.children.delete(view);
        view.parent.children.add(view);
      }
    }
  }

  render<O = unknown>(opts: VirtualizerRenderOptions<T, O>): ReusableView<T, V>[] {
    const mutableThis: Mutable<this> = this;
    let needsLayout = false;
    let offsetChanged = false;
    let sizeChanged = false;
    let itemSizeChanged = false;
    let layoutOptionsChanged = false;
    let needsUpdate = false;

    if (opts.collection !== this.collection) {
      mutableThis.collection = opts.collection;
      needsLayout = true;
    }

    if (opts.layout !== this.layout || this.layout.virtualizer !== this) {
      if (this.layout) {
        this.layout.virtualizer = null;
      }

      opts.layout.virtualizer = this;
      mutableThis.layout = opts.layout;
      needsLayout = true;
    }

    if (opts.persistedKeys && !isSetEqual(opts.persistedKeys, this.persistedKeys)) {
      mutableThis.persistedKeys = opts.persistedKeys;
      needsUpdate = true;
    }

    if (!this.visibleRect.equals(opts.visibleRect)) {
      this._overscanManager.setVisibleRect(opts.visibleRect);
      const shouldInvalidate = this.layout.shouldInvalidate(opts.visibleRect, this.visibleRect);
      if (shouldInvalidate) {
        offsetChanged = !opts.visibleRect.pointEquals(this.visibleRect);
        sizeChanged = !opts.visibleRect.sizeEquals(this.visibleRect);
        needsLayout = true;
      } else {
        needsUpdate = true;
      }

      mutableThis.visibleRect = opts.visibleRect;
    }

    if (opts.invalidationContext !== this._invalidationContext) {
      if (opts.invalidationContext) {
        sizeChanged ||= opts.invalidationContext.sizeChanged || false;
        offsetChanged ||= opts.invalidationContext.offsetChanged || false;
        itemSizeChanged ||= opts.invalidationContext.itemSizeChanged || false;
        layoutOptionsChanged ||=
          opts.invalidationContext.layoutOptions != null &&
          this._invalidationContext.layoutOptions != null &&
          opts.invalidationContext.layoutOptions !== this._invalidationContext.layoutOptions &&
          this.layout.shouldInvalidateLayoutOptions(
            opts.invalidationContext.layoutOptions as O,
            this._invalidationContext.layoutOptions as O
          );
        needsLayout ||= itemSizeChanged || sizeChanged || offsetChanged || layoutOptionsChanged;
      }
      this._invalidationContext = opts.invalidationContext;
    }

    if (opts.isScrolling !== this._isScrolling) {
      this._isScrolling = opts.isScrolling;
      if (!opts.isScrolling) {
        needsUpdate = true;
      }
    }

    if (needsLayout) {
      this.relayout({
        offsetChanged,
        sizeChanged,
        itemSizeChanged,
        layoutOptionsChanged,
        layoutOptions: this._invalidationContext.layoutOptions,
      });
    } else if (needsUpdate) {
      this.updateSubviews();
    }

    return Array.from(this._rootView.children);
  }

  getVisibleView(key: Key): ReusableView<T, V> | undefined {
    return this._visibleViews.get(key);
  }

  invalidate(context: InvalidationContext): void {
    this.delegate.invalidate(context);
  }

  updateItemSize(key: Key, size: Size): void {
    if (!this.layout.updateItemSize) {
      return;
    }

    const changed = this.layout.updateItemSize(key, size);
    if (changed) {
      this.invalidate({
        itemSizeChanged: true,
      });
    }
  }
}
