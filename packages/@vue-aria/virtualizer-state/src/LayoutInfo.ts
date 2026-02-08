import type { Key } from "@vue-aria/types";
import { Rect } from "./Rect";

export class LayoutInfo {
  type: string;
  key: Key;
  parentKey: Key | null;
  content: unknown | null;
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
    copy.parentKey = this.parentKey;
    copy.content = this.content;
    copy.estimatedSize = this.estimatedSize;
    copy.isSticky = this.isSticky;
    copy.opacity = this.opacity;
    copy.transform = this.transform;
    copy.zIndex = this.zIndex;
    copy.allowOverflow = this.allowOverflow;
    return copy;
  }
}
