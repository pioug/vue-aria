import type {
  Collection,
  CollectionNode,
  DropTarget,
  KeyboardDelegate,
} from "./types";
import type { Key } from "@vue-aria/types";

export function navigate(
  keyboardDelegate: KeyboardDelegate,
  collection: Collection,
  target: DropTarget | null | undefined,
  direction: "left" | "right" | "up" | "down",
  rtl = false,
  wrap = false
): DropTarget | null {
  switch (direction) {
    case "left":
      return rtl
        ? nextDropTarget(keyboardDelegate, collection, target, wrap, "left")
        : previousDropTarget(keyboardDelegate, collection, target, wrap, "left");
    case "right":
      return rtl
        ? previousDropTarget(keyboardDelegate, collection, target, wrap, "right")
        : nextDropTarget(keyboardDelegate, collection, target, wrap, "right");
    case "up":
      return previousDropTarget(keyboardDelegate, collection, target, wrap);
    case "down":
      return nextDropTarget(keyboardDelegate, collection, target, wrap);
  }
}

function nextDropTarget(
  keyboardDelegate: KeyboardDelegate,
  collection: Collection,
  target: DropTarget | null | undefined,
  wrap = false,
  horizontal: "left" | "right" | null = null
): DropTarget | null {
  if (!target) {
    return { type: "root" };
  }

  if (target.type === "root") {
    const nextKey = keyboardDelegate.getFirstKey?.() ?? null;
    if (nextKey != null) {
      return {
        type: "item",
        key: nextKey,
        dropPosition: "before",
      };
    }

    return null;
  }

  if (target.type === "item") {
    let nextKey: Key | null | undefined = null;
    if (horizontal) {
      nextKey =
        horizontal === "right"
          ? keyboardDelegate.getKeyRightOf?.(target.key)
          : keyboardDelegate.getKeyLeftOf?.(target.key);
    } else {
      nextKey = keyboardDelegate.getKeyBelow?.(target.key);
    }

    const nextCollectionKey = collection.getKeyAfter(target.key);

    if (nextKey != null && nextKey !== nextCollectionKey) {
      return {
        type: "item",
        key: nextKey,
        dropPosition: target.dropPosition,
      };
    }

    switch (target.dropPosition) {
      case "before":
        return {
          type: "item",
          key: target.key,
          dropPosition: "on",
        };
      case "on": {
        const targetNode = collection.getItem(target.key);
        const nextNode = nextKey != null ? collection.getItem(nextKey) : null;

        if (targetNode && nextNode && nextNode.level >= targetNode.level) {
          return {
            type: "item",
            key: nextNode.key,
            dropPosition: "before",
          };
        }

        return {
          type: "item",
          key: target.key,
          dropPosition: "after",
        };
      }
      case "after": {
        const targetNode = collection.getItem(target.key);
        let nextItemInSameLevel =
          targetNode?.nextKey != null ? collection.getItem(targetNode.nextKey) : null;
        while (nextItemInSameLevel != null && nextItemInSameLevel.type !== "item") {
          nextItemInSameLevel =
            nextItemInSameLevel.nextKey != null
              ? collection.getItem(nextItemInSameLevel.nextKey)
              : null;
        }

        if (targetNode && nextItemInSameLevel == null && targetNode.parentKey != null) {
          const parentNode = collection.getItem(targetNode.parentKey);
          const nextNode =
            parentNode?.nextKey != null ? collection.getItem(parentNode.nextKey) : null;

          if (nextNode?.type === "item") {
            return {
              type: "item",
              key: nextNode.key,
              dropPosition: "before",
            };
          }

          if (parentNode?.type === "item") {
            return {
              type: "item",
              key: parentNode.key,
              dropPosition: "after",
            };
          }
        }

        if (nextItemInSameLevel) {
          return {
            type: "item",
            key: nextItemInSameLevel.key,
            dropPosition: "on",
          };
        }
      }
    }
  }

  if (wrap) {
    return { type: "root" };
  }

  return null;
}

function previousDropTarget(
  keyboardDelegate: KeyboardDelegate,
  collection: Collection,
  target: DropTarget | null | undefined,
  wrap = false,
  horizontal: "left" | "right" | null = null
): DropTarget | null {
  if (!target || (wrap && target.type === "root")) {
    let prevKey: Key | null = null;
    let lastKey = keyboardDelegate.getLastKey?.() ?? null;

    while (lastKey != null) {
      const node = collection.getItem(lastKey);
      if (node?.type !== "item") {
        break;
      }

      prevKey = lastKey;
      lastKey = node.parentKey;
    }

    if (prevKey != null) {
      return {
        type: "item",
        key: prevKey,
        dropPosition: "after",
      };
    }

    return null;
  }

  if (target.type === "item") {
    let prevKey: Key | null | undefined = null;
    if (horizontal) {
      prevKey =
        horizontal === "left"
          ? keyboardDelegate.getKeyLeftOf?.(target.key)
          : keyboardDelegate.getKeyRightOf?.(target.key);
    } else {
      prevKey = keyboardDelegate.getKeyAbove?.(target.key);
    }

    const prevCollectionKey = collection.getKeyBefore(target.key);

    if (prevKey != null && prevKey !== prevCollectionKey) {
      return {
        type: "item",
        key: prevKey,
        dropPosition: target.dropPosition,
      };
    }

    switch (target.dropPosition) {
      case "before": {
        const targetNode = collection.getItem(target.key);
        if (targetNode && targetNode.prevKey != null) {
          const lastChild = getLastChild(collection, targetNode.prevKey);
          if (lastChild) {
            return lastChild;
          }
        }

        if (prevKey != null) {
          return {
            type: "item",
            key: prevKey,
            dropPosition: "on",
          };
        }

        return { type: "root" };
      }
      case "on":
        return {
          type: "item",
          key: target.key,
          dropPosition: "before",
        };
      case "after": {
        const lastChild = getLastChild(collection, target.key);
        if (lastChild) {
          return lastChild;
        }

        return {
          type: "item",
          key: target.key,
          dropPosition: "on",
        };
      }
    }
  }

  if (target.type !== "root") {
    return { type: "root" };
  }

  return null;
}

function getLastChild(collection: Collection, key: Key): DropTarget | null {
  const targetNode = collection.getItem(key);
  const nextKey = collection.getKeyAfter(key);
  const nextNode = nextKey != null ? collection.getItem(nextKey) : null;

  if (targetNode && nextNode && nextNode.level > targetNode.level) {
    const children = getChildNodes(targetNode);
    let lastChild: CollectionNode | null = null;
    for (const child of children) {
      if (child.type === "item") {
        lastChild = child;
      }
    }

    if (lastChild) {
      return {
        type: "item",
        key: lastChild.key,
        dropPosition: "after",
      };
    }
  }

  return null;
}

function getChildNodes(node: CollectionNode): Iterable<CollectionNode> {
  return node.childNodes;
}
