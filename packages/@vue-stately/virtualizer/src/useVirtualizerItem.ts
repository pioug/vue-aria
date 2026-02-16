import type { Rect, Size } from "./utils";

export type Key = string | number;
export interface IVirtualizer {
  updateItemSize: (key: Key, size: Size) => void;
}

export interface LayoutInfo extends Rect {
  key?: Key;
  estimatedSize?: number;
  isSticky?: boolean;
  allowOverflow?: boolean;
  opacity?: number;
  zIndex?: number;
  transform?: string;
}

export interface VirtualizerItemOptions {
  layoutInfo: LayoutInfo | null;
  virtualizer: IVirtualizer;
  ref: { current: Element | null };
}

export function useVirtualizerItem(options: VirtualizerItemOptions): { updateSize: () => void } {
  const {layoutInfo, virtualizer, ref} = options;

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

  return {updateSize};
}
