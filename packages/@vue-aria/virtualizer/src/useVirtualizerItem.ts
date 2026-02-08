import { toValue, watchPostEffect } from "vue";
import type { Key, MaybeReactive } from "@vue-aria/types";
import type { LayoutInfo, Size } from "@vue-aria/virtualizer-state";
import { Size as VirtualizerSize } from "@vue-aria/virtualizer-state";

export interface VirtualizerItemVirtualizer {
  updateItemSize: (key: Key, size: Size) => void;
}

export interface VirtualizerItemOptions {
  layoutInfo: MaybeReactive<LayoutInfo | null>;
  virtualizer: MaybeReactive<VirtualizerItemVirtualizer>;
  ref: MaybeReactive<HTMLElement | null | undefined>;
}

export interface UseVirtualizerItemResult {
  updateSize: () => void;
}

export function useVirtualizerItem(
  options: VirtualizerItemOptions
): UseVirtualizerItemResult {
  const updateSize = (): void => {
    const layoutInfo = toValue(options.layoutInfo);
    const key = layoutInfo?.key;
    const node = toValue(options.ref);

    if (key != null && node) {
      toValue(options.virtualizer).updateItemSize(key, getSize(node));
    }
  };

  watchPostEffect(() => {
    if (toValue(options.layoutInfo)?.estimatedSize) {
      updateSize();
    }
  });

  return {
    updateSize,
  };
}

function getSize(node: HTMLElement): Size {
  const height = node.style.height;
  node.style.height = "";
  const size = new VirtualizerSize(node.scrollWidth, node.scrollHeight);
  node.style.height = height;
  return size;
}
