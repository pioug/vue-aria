import type {
  Collection,
  Key,
  LayoutDelegate,
  Node,
  SizeLike,
  RectLike,
} from "./types";

export interface InvalidationContext<O = any> {
  contentChanged?: boolean;
  offsetChanged?: boolean;
  sizeChanged?: boolean;
  itemSizeChanged?: boolean;
  layoutOptionsChanged?: boolean;
  layoutOptions?: O;
}

export interface VirtualizerDelegate<T extends object, V> {
  setVisibleRect(rect: Rect): void;
  renderView(type: string, content: T | null): V;
  invalidate(ctx: InvalidationContext): void;
}

export interface VirtualizerRenderOptions<T extends object, O = any> {
  layout: Layout<T>;
  collection: Collection<Node<T>>;
  persistedKeys?: Set<Key> | null;
  visibleRect: Rect;
  invalidationContext: InvalidationContext;
  isScrolling: boolean;
  layoutOptions?: O;
}

export type RectCorner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

export class Point {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  copy(): Point {
    return new Point(this.x, this.y);
  }

  equals(point: Point): boolean {
    return this.x === point.x && this.y === point.y;
  }

  isOrigin(): boolean {
    return this.x === 0 && this.y === 0;
  }
}

export class Size {
  width: number;
  height: number;

  constructor(width = 0, height = 0) {
    this.width = Math.max(width, 0);
    this.height = Math.max(height, 0);
  }

  copy(): Size {
    return new Size(this.width, this.height);
  }

  equals(other: Size): boolean {
    return this.width === other.width && this.height === other.height;
  }

  get area(): number {
    return this.width * this.height;
  }
}

export class Rect {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  get maxX(): number {
    return this.x + this.width;
  }

  get maxY(): number {
    return this.y + this.height;
  }

  get area(): number {
    return this.width * this.height;
  }

  get topLeft(): Point {
    return new Point(this.x, this.y);
  }

  get topRight(): Point {
    return new Point(this.maxX, this.y);
  }

  get bottomLeft(): Point {
    return new Point(this.x, this.maxY);
  }

  get bottomRight(): Point {
    return new Point(this.maxX, this.maxY);
  }

  intersects(rect: Rect): boolean {
    const isTestEnv = process.env.NODE_ENV === "test" && !process.env.VIRT_ON;
    return (
      (isTestEnv || (this.area > 0 && rect.area > 0))
      && this.x <= rect.x + rect.width
      && rect.x <= this.x + this.width
      && this.y <= rect.y + rect.height
      && rect.y <= this.y + this.height
    );
  }

  containsRect(rect: Rect): boolean {
    return this.x <= rect.x
      && this.y <= rect.y
      && this.maxX >= rect.maxX
      && this.maxY >= rect.maxY;
  }

  containsPoint(point: Point): boolean {
    return this.x <= point.x
      && this.y <= point.y
      && this.maxX >= point.x
      && this.maxY >= point.y;
  }

  getCornerInRect(rect: Rect): RectCorner | null {
    for (const key of ["topLeft", "topRight", "bottomLeft", "bottomRight"] as const) {
      if (rect.containsPoint(this[key])) {
        return key;
      }
    }

    return null;
  }

  equals(rect: Rect): boolean {
    return rect.x === this.x
      && rect.y === this.y
      && rect.width === this.width
      && rect.height === this.height;
  }

  pointEquals(point: Point | Rect): boolean {
    return this.x === point.x && this.y === point.y;
  }

  sizeEquals(size: Size | Rect): boolean {
    return this.width === size.width && this.height === size.height;
  }

  union(other: Rect): Rect {
    const x = Math.min(this.x, other.x);
    const y = Math.min(this.y, other.y);
    const width = Math.max(this.maxX, other.maxX) - x;
    const height = Math.max(this.maxY, other.maxY) - y;
    return new Rect(x, y, width, height);
  }

  intersection(other: Rect): Rect {
    if (!this.intersects(other)) {
      return new Rect(0, 0, 0, 0);
    }

    const x = Math.max(this.x, other.x);
    const y = Math.max(this.y, other.y);
    return new Rect(
      x,
      y,
      Math.min(this.maxX, other.maxX) - x,
      Math.min(this.maxY, other.maxY) - y
    );
  }

  copy(): Rect {
    return new Rect(this.x, this.y, this.width, this.height);
  }
}

export class LayoutInfo {
  type: string;
  key: Key;
  parentKey: Key | null;
  content: any | null;
  rect: Rect;
  estimatedSize: boolean;
  isSticky: boolean;
  opacity: number;
  transform: string | null;
  zIndex: number;
  allowOverflow: boolean;

  constructor(type: string, key: Key, rect: Rect) {
    this.type = type;
    this.key = key;
    this.parentKey = null;
    this.content = null;
    this.rect = rect;
    this.estimatedSize = false;
    this.isSticky = false;
    this.opacity = 1;
    this.transform = null;
    this.zIndex = 0;
    this.allowOverflow = false;
  }

  copy(): LayoutInfo {
    const copy = new LayoutInfo(this.type, this.key, this.rect.copy());
    copy.estimatedSize = this.estimatedSize;
    copy.opacity = this.opacity;
    copy.transform = this.transform;
    copy.parentKey = this.parentKey;
    copy.content = this.content;
    copy.isSticky = this.isSticky;
    copy.zIndex = this.zIndex;
    copy.allowOverflow = this.allowOverflow;
    return copy;
  }
}

export abstract class Layout<T extends object = Node<any>, O = any> implements LayoutDelegate {
  virtualizer: {
    collection: Collection<Node<any>>;
    contentSize: Size;
    visibleRect: Rect;
    persistedKeys: Set<Key>;
    isPersistedKey: (key: Key) => boolean;
    keyAtPoint?: (point: Point) => Key | null;
  } | null = null;

  abstract getVisibleLayoutInfos(rect: Rect): LayoutInfo[];
  abstract getLayoutInfo(key: Key): LayoutInfo | null;
  abstract getContentSize(): Size;

  shouldInvalidate(newRect: Rect, oldRect: Rect): boolean {
    return newRect.width !== oldRect.width || newRect.height !== oldRect.height;
  }

  shouldInvalidateLayoutOptions(newOptions: O, oldOptions: O): boolean {
    return newOptions !== oldOptions;
  }

  update(_invalidationContext: InvalidationContext<O>): void {
    // Intentionally empty by default.
  }

  updateItemSize?(_key: Key, _size: Size): boolean;

  getDropTargetLayoutInfo?(_target: any): LayoutInfo;

  getItemRect(key: Key): Rect | null {
    return this.getLayoutInfo(key)?.rect ?? null;
  }

  getVisibleRect(): Rect {
    return this.virtualizer!.visibleRect;
  }
}
