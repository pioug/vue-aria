import type { Key } from "@vue-stately/layout/src/types";
import type { LayoutInfo as VirtualizerLayoutInfo } from "./LayoutInfo";
import type { Rect } from "./Rect";
import type { Size } from "./Size";

type LayoutInfo = VirtualizerLayoutInfo | (Rect & {
  key?: Key;
  estimatedSize?: boolean;
  isSticky?: boolean;
  allowOverflow?: boolean;
  opacity?: number;
  zIndex?: number;
  transform?: string;
});

export interface IVirtualizer {
  updateItemSize: (key: Key, size: Size) => void;
}

export interface VirtualizerItemOptions {
  layoutInfo: LayoutInfo | null;
  virtualizer: IVirtualizer;
  ref: { current: Element | null };
}

export function useVirtualizerItem(options: VirtualizerItemOptions): { updateSize: () => void } {
  const { layoutInfo, virtualizer, ref } = options;

  const updateSize = () => {
    if (layoutInfo == null || !ref.current || typeof virtualizer?.updateItemSize !== "function") {
      return;
    }

    const el = ref.current as HTMLElement;
    const key = layoutInfo.key;
    if (key == null) {
      return;
    }

    const rect = el.getBoundingClientRect?.();
    if (rect == null) return;
    const size: Size = {
      width: rect.width,
      height: rect.height,
    };
    virtualizer.updateItemSize(key, size);
  };

  if (layoutInfo?.estimatedSize != null) {
    updateSize();
  }

  return { updateSize };
}
