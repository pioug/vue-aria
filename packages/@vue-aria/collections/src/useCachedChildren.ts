import { cloneVNode, computed, type VNode, type VNodeArrayChildren } from "vue";
import type { Key } from "./BaseCollection";

export interface CachedChildrenOptions<T> {
  items?: Iterable<T>;
  children?: VNodeArrayChildren | ((item: T) => VNode);
  dependencies?: ReadonlyArray<unknown>;
  idScope?: Key;
  addIdAndValue?: boolean;
}

export function useCachedChildren<T extends object>(props: CachedChildrenOptions<T>) {
  const { items, children, idScope, addIdAndValue } = props;
  const cache = new WeakMap<T, VNode>();

  return computed(() => {
    if (items && typeof children === "function") {
      const result: VNode[] = [];
      for (const item of items) {
        let rendered = cache.get(item);

        if (!rendered) {
          rendered = children(item);
          const baseKey = (rendered.props as any)?.id ?? (item as any).key ?? (item as any).id;
          if (baseKey == null) {
            throw new Error("Could not determine key for item");
          }

          const key = idScope != null ? `${idScope}:${baseKey}` : baseKey;
          rendered = cloneVNode(
            rendered,
            addIdAndValue ? { key, id: key, value: item } : { key }
          );
          cache.set(item, rendered);
        }

        result.push(rendered);
      }
      return result;
    }

    if (typeof children !== "function") {
      return children;
    }

    return undefined;
  });
}
