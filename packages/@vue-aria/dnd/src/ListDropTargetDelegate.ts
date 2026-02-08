import type {
  Direction,
  DropTarget,
  DropTargetDelegate,
  CollectionNode,
  Orientation,
} from "./types";
import type { MaybeReactive } from "@vue-aria/types";
import { toValue } from "vue";

interface ListDropTargetDelegateOptions {
  layout?: "stack" | "grid";
  orientation?: Orientation;
  direction?: Direction;
}

function escapeCssValue(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }

  return value.replace(/["\\]/g, "\\$&");
}

export class ListDropTargetDelegate implements DropTargetDelegate {
  private readonly collection: Iterable<CollectionNode>;
  private readonly ref: MaybeReactive<HTMLElement | null | undefined>;
  private readonly layout: "stack" | "grid";
  private readonly orientation: Orientation;
  protected readonly direction: Direction;

  constructor(
    collection: Iterable<CollectionNode>,
    ref: MaybeReactive<HTMLElement | null | undefined>,
    options?: ListDropTargetDelegateOptions
  ) {
    this.collection = collection;
    this.ref = ref;
    this.layout = options?.layout ?? "stack";
    this.orientation = options?.orientation ?? "vertical";
    this.direction = options?.direction ?? "ltr";
  }

  private getPrimaryStart(rect: DOMRect): number {
    return this.orientation === "horizontal" ? rect.left : rect.top;
  }

  private getPrimaryEnd(rect: DOMRect): number {
    return this.orientation === "horizontal" ? rect.right : rect.bottom;
  }

  private getSecondaryStart(rect: DOMRect): number {
    return this.orientation === "horizontal" ? rect.top : rect.left;
  }

  private getSecondaryEnd(rect: DOMRect): number {
    return this.orientation === "horizontal" ? rect.bottom : rect.right;
  }

  private getFlowStart(rect: DOMRect): number {
    return this.layout === "stack" ? this.getPrimaryStart(rect) : this.getSecondaryStart(rect);
  }

  private getFlowEnd(rect: DOMRect): number {
    return this.layout === "stack" ? this.getPrimaryEnd(rect) : this.getSecondaryEnd(rect);
  }

  private getFlowSize(rect: DOMRect): number {
    return this.getFlowEnd(rect) - this.getFlowStart(rect);
  }

  getDropTargetFromPoint(
    x: number,
    y: number,
    isValidDropTarget: (target: DropTarget) => boolean
  ): DropTarget {
    const container = toValue(this.ref);

    if (this.collection[Symbol.iterator]().next().done || !container) {
      return { type: "root" };
    }

    let rect: DOMRect | undefined = container.getBoundingClientRect();
    let primary = this.orientation === "horizontal" ? x : y;
    let secondary = this.orientation === "horizontal" ? y : x;
    primary += this.getPrimaryStart(rect);
    secondary += this.getSecondaryStart(rect);

    const flow = this.layout === "stack" ? primary : secondary;
    const isPrimaryRTL = this.orientation === "horizontal" && this.direction === "rtl";
    const isSecondaryRTL =
      this.layout === "grid" && this.orientation === "vertical" && this.direction === "rtl";
    const isFlowRTL = this.layout === "stack" ? isPrimaryRTL : isSecondaryRTL;

    const collectionId = container.dataset.collection;
    const selector = collectionId
      ? `[data-collection="${escapeCssValue(collectionId)}"]`
      : "[data-key]";

    const elements = container.querySelectorAll(selector);
    const elementMap = new Map<string, HTMLElement>();

    elements.forEach((item) => {
      if (item instanceof HTMLElement && item.dataset.key != null) {
        elementMap.set(item.dataset.key, item);
      }
    });

    const items = [...this.collection].filter((item) => item.type === "item");

    if (items.length < 1) {
      return { type: "root" };
    }

    let low = 0;
    let high = items.length;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const item = items[mid];
      const element = elementMap.get(String(item.key));

      if (!element) {
        break;
      }

      rect = element.getBoundingClientRect();
      const update = (isGreater: boolean) => {
        if (isGreater) {
          low = mid + 1;
        } else {
          high = mid;
        }
      };

      if (primary < this.getPrimaryStart(rect)) {
        update(isPrimaryRTL);
      } else if (primary > this.getPrimaryEnd(rect)) {
        update(!isPrimaryRTL);
      } else if (secondary < this.getSecondaryStart(rect)) {
        update(isSecondaryRTL);
      } else if (secondary > this.getSecondaryEnd(rect)) {
        update(!isSecondaryRTL);
      } else {
        const target: DropTarget = {
          type: "item",
          key: item.key,
          dropPosition: "on",
        };

        if (isValidDropTarget(target)) {
          if (
            flow <= this.getFlowStart(rect) + 5 &&
            isValidDropTarget({ ...target, dropPosition: "before" })
          ) {
            target.dropPosition = isFlowRTL ? "after" : "before";
          } else if (
            flow >= this.getFlowEnd(rect) - 5 &&
            isValidDropTarget({ ...target, dropPosition: "after" })
          ) {
            target.dropPosition = isFlowRTL ? "before" : "after";
          }
        } else {
          const middle = this.getFlowStart(rect) + this.getFlowSize(rect) / 2;
          if (
            flow <= middle &&
            isValidDropTarget({ ...target, dropPosition: "before" })
          ) {
            target.dropPosition = isFlowRTL ? "after" : "before";
          } else if (
            flow >= middle &&
            isValidDropTarget({ ...target, dropPosition: "after" })
          ) {
            target.dropPosition = isFlowRTL ? "before" : "after";
          }
        }

        return target;
      }
    }

    const item = items[Math.min(low, items.length - 1)];
    const element = elementMap.get(String(item.key));
    rect = element?.getBoundingClientRect();

    if (
      rect &&
      (primary < this.getPrimaryStart(rect) ||
        Math.abs(flow - this.getFlowStart(rect)) < Math.abs(flow - this.getFlowEnd(rect)))
    ) {
      return {
        type: "item",
        key: item.key,
        dropPosition: isFlowRTL ? "after" : "before",
      };
    }

    return {
      type: "item",
      key: item.key,
      dropPosition: isFlowRTL ? "before" : "after",
    };
  }
}
