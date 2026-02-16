import { ref } from "vue";

export type Key = string | number;

export interface TreeOptions<T extends object> {
  /** Initial root items in the tree. */
  initialItems?: T[];
  /** The keys for the initially selected items. */
  initialSelectedKeys?: Iterable<Key>;
  /** A function that returns a unique key for an item object. */
  getKey?: (item: T) => Key;
  /** A function that returns the children for an item object. */
  getChildren?: (item: T) => T[];
}

interface TreeNode<T extends object> {
  /** A unique key for the tree node. */
  key: Key;
  /** The key of the parent node. */
  parentKey?: Key | null;
  /** The value object for the tree node. */
  value: T;
  /** Children of the tree node. */
  children: TreeNode<T>[] | null;
}

export interface TreeData<T extends object> {
  /** The root nodes in the tree. */
  items: TreeNode<T>[];
  /** The keys of the currently selected items in the tree. */
  selectedKeys: Set<Key>;
  /** Sets the selected keys. */
  setSelectedKeys(keys: Set<Key>): void;
  /** Gets a node from the tree by key. */
  getItem(key: Key): TreeNode<T> | undefined;
  insert(parentKey: Key | null, index: number, ...values: T[]): void;
  insertBefore(key: Key, ...values: T[]): void;
  insertAfter(key: Key, ...values: T[]): void;
  append(parentKey: Key | null, ...values: T[]): void;
  prepend(parentKey: Key | null, ...value: T[]): void;
  remove(...keys: Key[]): void;
  removeSelectedItems(): void;
  move(key: Key, toParentKey: Key | null, index: number): void;
  moveBefore(key: Key, keys: Iterable<Key>): void;
  moveAfter(key: Key, keys: Iterable<Key>): void;
  update(oldKey: Key, newValue: T): void;
}

interface TreeDataState<T extends object> {
  items: TreeNode<T>[];
  nodeMap: Map<Key, TreeNode<T>>;
}

export function useTreeData<T extends object>(options: TreeOptions<T>): TreeData<T> {
  let {
    initialItems = [],
    initialSelectedKeys,
    getKey = (item: any) => item.id ?? item.key,
    getChildren = (item: any) => item.children,
  } = options;

  const state = ref<TreeDataState<T>>(buildTree(initialItems, new Map()));
  const selectedKeys = ref(new Set<Key>(initialSelectedKeys || []));

  const setState = (updater: (value: TreeDataState<T>) => TreeDataState<T>) => {
    state.value = updater(state.value);
  };

  const insert = (parentKey: Key | null, index: number, ...values: T[]) => {
    setState(({items, nodeMap}) => {
      if (parentKey == null) {
        const {items: newItems, nodeMap: newMap} = buildTree(values, new Map(nodeMap));
        return {
          items: [...items.slice(0, index), ...newItems, ...items.slice(index)],
          nodeMap: newMap,
        };
      }

      const {items: newItems, nodeMap: newMap} = buildTree(values, new Map(nodeMap), parentKey);
      return updateTree(
        items,
        parentKey,
        (parentNode) => {
          const children = parentNode.children ?? [];
          return {
            key: parentNode.key,
            parentKey: parentNode.parentKey,
            value: parentNode.value,
            children: [
              ...children.slice(0, index),
              ...newItems,
              ...children.slice(index),
            ],
          };
        },
        newMap
      );
    });
  };

  const appendWithLength = (parentKey: Key | null, values: T[]) => {
    setState(({items, nodeMap}) => {
      if (parentKey == null) {
        const {items: childItems, nodeMap: newMap} = buildTree(values, new Map(nodeMap));
        return {
          items: [...items, ...childItems],
          nodeMap: newMap,
        };
      }

      const parent = nodeMap.get(parentKey);
      if (!parent) {
        return {items, nodeMap};
      }

      const {items: childItems, nodeMap: newMap} = buildTree(values, new Map(nodeMap), parentKey);
      return updateTree(
        items,
        parentKey,
        (parentNode) => ({
          key: parentNode.key,
          parentKey: parentNode.parentKey,
          value: parentNode.value,
          children: [...(parentNode.children ?? []), ...childItems],
        }),
        newMap
      );
    });
  };

  const prepend = (parentKey: Key | null, ...values: T[]) => {
    insert(parentKey, 0, ...values);
  };

  const append = (parentKey: Key | null, ...values: T[]) => {
    appendWithLength(parentKey, values);
  };

  const insertBefore = (key: Key, ...values: T[]) => {
    const keyMap = state.value.nodeMap;
    const item = keyMap.get(key);
    if (!item) {
      return;
    }

    const parentNode = item.parentKey != null ? keyMap.get(item.parentKey) : null;
    const nodes = parentNode ? parentNode.children : state.value.items;
    const index = nodes?.indexOf(item) ?? -1;
    if (index === -1) {
      return;
    }

    insert(parentNode?.key ?? null, index, ...values);
  };

  const insertAfter = (key: Key, ...values: T[]) => {
    const keyMap = state.value.nodeMap;
    const item = keyMap.get(key);
    if (!item) {
      return;
    }

    const parentNode = item.parentKey != null ? keyMap.get(item.parentKey) : null;
    const nodes = parentNode ? parentNode.children : state.value.items;
    const index = nodes?.indexOf(item) ?? -1;
    if (index === -1) {
      return;
    }

    insert(parentNode?.key ?? null, index + 1, ...values);
  };

  const remove = (...keys: Key[]) => {
    if (keys.length === 0) {
      return;
    }

    setState(({items, nodeMap}) => {
      let nextItems = items;
      let nextMap = nodeMap;
      for (const key of keys) {
        const nextState = updateTree(nextItems, key, () => null, nextMap);
        nextItems = nextState.items;
        nextMap = nextState.nodeMap;
      }

      const nextSelectedKeys = new Set(selectedKeys.value);
      for (const key of selectedKeys.value) {
        if (!nextMap.has(key)) {
          nextSelectedKeys.delete(key);
        }
      }
      selectedKeys.value = nextSelectedKeys;

      return {
        items: nextItems,
        nodeMap: nextMap,
      };
    });
  };

  const move = (key: Key, toParentKey: Key | null, index: number) => {
    setState(({items, nodeMap}) => {
      const node = nodeMap.get(key);
      if (!node) {
        return {items, nodeMap};
      }

      const nextState = updateTree(items, key, () => null, nodeMap);
      const movedNode = {
        ...node,
        parentKey: toParentKey,
      };
      const safeIndex = Math.max(0, Math.min(index, nextState.items.length));

      if (toParentKey == null) {
        addNode(movedNode, nextState.nodeMap);
        return {
          items: [
            ...nextState.items.slice(0, safeIndex),
            movedNode,
            ...nextState.items.slice(safeIndex),
          ],
          nodeMap: nextState.nodeMap,
        };
      }

      const parent = nextState.nodeMap.get(toParentKey);
      if (!parent) {
        return {
          items: nextState.items,
          nodeMap: nextState.nodeMap,
        };
      }

      return updateTree(nextState.items, toParentKey, (parentNode) => ({
        key: parentNode.key,
        parentKey: parentNode.parentKey,
        value: parentNode.value,
        children: [
          ...(parentNode.children ?? []).slice(0, safeIndex),
          movedNode,
          ...(parentNode.children ?? []).slice(safeIndex),
        ],
      }), nextState.nodeMap);
    });
  };

  const moveBefore = (key: Key, keys: Iterable<Key>) => {
    const {items, nodeMap} = state.value;
    const target = nodeMap.get(key);
    if (!target) {
      return;
    }

    const toParentKey = target.parentKey ?? null;
    const parent = toParentKey == null ? null : nodeMap.get(toParentKey) ?? null;
    const toIndex = parent?.children ? parent.children.indexOf(target) : items.indexOf(target);
    if (toIndex === -1) {
      return;
    }

    setState((state) => moveItems(state, keys, parent, toIndex, updateTree, addNode));
  };

  const moveAfter = (key: Key, keys: Iterable<Key>) => {
    const {items, nodeMap} = state.value;
    const target = nodeMap.get(key);
    if (!target) {
      return;
    }

    const toParentKey = target.parentKey ?? null;
    const parent = toParentKey == null ? null : nodeMap.get(toParentKey) ?? null;
    const toIndex = (parent?.children ? parent.children.indexOf(target) : items.indexOf(target)) + 1;
    if (toIndex === 0) {
      return;
    }

    setState((state) => moveItems(state, keys, parent, toIndex, updateTree, addNode));
  };

  const update = (oldKey: Key, newValue: T) => {
    setState(({items, nodeMap}) => updateTree(items, oldKey, (oldNode) => {
      const node: TreeNode<T> = {
        key: oldNode.key,
        parentKey: oldNode.parentKey,
        value: newValue,
        children: null,
      };
      node.children = buildTree(getChildren(newValue) as T[] | null, new Map(), node.key).items;
      return node;
    }, nodeMap));
  };

  return {
    get items() {
      return state.value.items;
    },
    get selectedKeys() {
      return selectedKeys.value;
    },
    setSelectedKeys(keys: Set<Key>) {
      selectedKeys.value = keys;
    },
    getItem(key: Key) {
      return state.value.nodeMap.get(key);
    },
    insert,
    insertBefore,
    insertAfter,
    append,
    prepend,
    remove,
    removeSelectedItems() {
      remove(...selectedKeys.value);
    },
    move,
    moveBefore,
    moveAfter,
    update,
  };
}

function buildTree<T extends object>(
  initialItems: T[] | null = [],
  map: Map<Key, TreeNode<T>>,
  parentKey?: Key | null
): TreeDataState<T> {
  if (initialItems == null) {
    initialItems = [];
  }

  return {
    items: initialItems.map((item) => {
      const node: TreeNode<T> = {
        key: (item as any).id ?? (item as any).key,
        parentKey: parentKey ?? null,
        value: item,
        children: null,
      };
      node.children = buildTree((item as any).children, map, node.key).items;
      map.set(node.key, node);
      return node;
    }),
    nodeMap: map,
  };
}

function updateTree<T extends object>(
  items: TreeNode<T>[],
  key: Key | null,
  update: (node: TreeNode<T>) => TreeNode<T> | null,
  originalMap: Map<Key, TreeNode<T>>
): TreeDataState<T> {
  const node = key == null ? null : originalMap.get(key);
  if (node == null) {
    return {items, nodeMap: originalMap};
  }

  const map = new Map<Key, TreeNode<T>>(originalMap);
  const newNode = update(node);
  if (newNode == null) {
    deleteNode(node, map);
  } else {
    addNode(newNode, map);
  }

  let currentNode: TreeNode<T> | null = node;
  let pending = newNode;
  while (currentNode?.parentKey) {
    const nextParent = map.get(currentNode.parentKey);
    if (!nextParent) {
      break;
    }

    const copy: TreeNode<T> = {
      key: nextParent.key,
      parentKey: nextParent.parentKey,
      value: nextParent.value,
      children: null,
    };
    let children = nextParent.children;
    if (pending == null && children) {
      children = children.filter((child) => child !== currentNode);
    }

    copy.children = children?.map((child) => (child === currentNode ? pending! : child)) ?? null;
    if (pending == null) {
      copy.children = children ?? null;
    }

    map.set(copy.key, copy);
    pending = copy;
    currentNode = nextParent;
  }

  if (pending == null) {
    return {
      items: items.filter((child) => child !== currentNode),
      nodeMap: map,
    };
  }

  return {
    items: items.map((child) => (child === currentNode ? pending! : child)),
    nodeMap: map,
  };
}

function addNode<T extends object>(node: TreeNode<T>, map: Map<Key, TreeNode<T>>) {
  map.set(node.key, node);
  if (node.children) {
    for (const child of node.children) {
      addNode(child, map);
    }
  }
}

function deleteNode<T extends object>(node: TreeNode<T>, map: Map<Key, TreeNode<T>>) {
  map.delete(node.key);
  if (node.children) {
    for (const child of node.children) {
      deleteNode(child, map);
    }
  }
}

function moveItems<T extends object>(
  state: TreeDataState<T>,
  keys: Iterable<Key>,
  toParent: TreeNode<T> | null,
  toIndex: number,
  updateTree: (
    items: TreeNode<T>[],
    key: Key | null,
    update: (node: TreeNode<T>) => TreeNode<T> | null,
    originalMap: Map<Key, TreeNode<T>>
  ) => TreeDataState<T>,
  addNode: (node: TreeNode<T>, map: Map<Key, TreeNode<T>>) => void
): TreeDataState<T> {
  let {items, nodeMap} = state;

  let parent = toParent;
  const removeKeys = new Set(keys);
  while (parent?.parentKey != null) {
    if (removeKeys.has(parent.key)) {
      throw new Error("Cannot move an item to be a child of itself.");
    }
    parent = nodeMap.get(parent.parentKey) ?? null;
  }

  const originalToIndex = toIndex;
  const keyArray = Array.isArray(keys) ? keys : [...keys];
  const inOrderKeys = new Map<Key, number>();
  const removedItems: Array<TreeNode<T>> = [];
  let nextItems = items;
  let nextMap = nodeMap;
  let i = 0;

  const traversal = (node: {children: TreeNode<T>[] | null}, callbacks: {
    inorder?: (child: TreeNode<T>) => void;
    postorder?: (child: TreeNode<T>) => void;
  }) => {
    const {inorder, postorder} = callbacks;
    inorder?.(node as TreeNode<T>);
    if (node != null) {
      for (const child of node.children ?? []) {
        traversal(child as {children: TreeNode<T>[] | null}, callbacks);
        postorder?.(child);
      }
    }
  };

  const inorder = (child: TreeNode<T>) => {
    if (keyArray.includes(child.key)) {
      inOrderKeys.set(child.key, i++);
    }
  };

  const postorder = (child: TreeNode<T>) => {
    if (keyArray.includes(child.key)) {
      removedItems.push({...nextMap.get(child.key)!, parentKey: toParent?.key ?? null});
      const {items: newItems, nodeMap: newNodeMap} = updateTree(nextItems, child.key, () => null, nextMap);
      nextItems = newItems;
      nextMap = newNodeMap;
    }

    if (
      (child.parentKey === toParent || child.parentKey === toParent?.key) &&
      keyArray.includes(child.key) &&
      (toParent?.children ? toParent.children.indexOf(child) : items.indexOf(child)) < originalToIndex
    ) {
      toIndex--;
    }
  };

  traversal({children: items} as {children: TreeNode<T>[] | null}, {inorder, postorder});

  const inOrderItems = removedItems.sort((a, b) => (inOrderKeys.get(a.key)! > inOrderKeys.get(b.key)! ? 1 : -1));
  if (!toParent || toParent.key == null) {
    inOrderItems.forEach((movedNode) => {
      addNode(movedNode, nextMap);
    });
    return {
      items: [
        ...nextItems.slice(0, toIndex),
        ...inOrderItems,
        ...nextItems.slice(toIndex),
      ],
      nodeMap: nextMap,
    };
  }

  return updateTree(
    nextItems,
    toParent.key,
    (parentNode) => ({
      key: parentNode.key,
      parentKey: parentNode.parentKey,
      value: parentNode.value,
      children: [
        ...(parentNode.children ?? []).slice(0, toIndex),
        ...inOrderItems,
        ...(parentNode.children ?? []).slice(toIndex),
      ],
    }),
    nextMap
  );
}
