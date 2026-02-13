import type { Key } from "@vue-aria/collections";
import type { LayoutDelegate, Rect, Size } from "./types";
import { getItemElement } from "./utils";

export class DOMLayoutDelegate implements LayoutDelegate {
  private ref: { current: HTMLElement | null };

  constructor(ref: { current: HTMLElement | null }) {
    this.ref = ref;
  }

  getItemRect(key: Key): Rect | null {
    const container = this.ref.current;
    if (!container) {
      return null;
    }

    const item = key != null ? getItemElement(this.ref, key) : null;
    if (!item) {
      return null;
    }

    const containerRect = container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    return {
      x: itemRect.left - containerRect.left - container.clientLeft + container.scrollLeft,
      y: itemRect.top - containerRect.top - container.clientTop + container.scrollTop,
      width: itemRect.width,
      height: itemRect.height,
    };
  }

  getContentSize(): Size {
    const container = this.ref.current;
    return {
      width: container?.scrollWidth ?? 0,
      height: container?.scrollHeight ?? 0,
    };
  }

  getVisibleRect(): Rect {
    const container = this.ref.current;
    return {
      x: container?.scrollLeft ?? 0,
      y: container?.scrollTop ?? 0,
      width: container?.clientWidth ?? 0,
      height: container?.clientHeight ?? 0,
    };
  }
}
