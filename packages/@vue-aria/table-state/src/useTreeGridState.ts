import { tableNestedRows } from "@vue-aria/flags";
import { useControlledState } from "@vue-aria/utils-state";
import { computed } from "vue";
import { TableCollection } from "./TableCollection";
import type { GridNode, Key, TableCollection as ITableCollection } from "./types";
import { useTableState, type TableState, type TableStateProps } from "./useTableState";

export interface TreeGridState<T> extends TableState<T> {
  expandedKeys: "all" | Set<Key>;
  toggleKey(key: Key): void;
  keyMap: Map<Key, GridNode<T>>;
  userColumnCount: number;
}

export interface TreeGridStateProps<T>
  extends Omit<TableStateProps<T>, "collection" | "children"> {
  children?: Iterable<GridNode<T>>;
  /** @private pre-built collection fallback for Vue-only flows. */
  collection?: ITableCollection<T>;
  UNSTABLE_expandedKeys?: "all" | Iterable<Key>;
  UNSTABLE_defaultExpandedKeys?: "all" | Iterable<Key>;
  UNSTABLE_onExpandedChange?: (keys: Set<Key>) => unknown;
}

interface TreeGridCollectionOptions {
  showSelectionCheckboxes?: boolean;
  showDragButtons?: boolean;
  expandedKeys: "all" | Set<Key>;
}

interface TreeGridCollection<T> {
  keyMap: Map<Key, GridNode<T>>;
  tableNodes: GridNode<T>[];
  flattenedRows: GridNode<T>[];
  userColumnCount: number;
}

export function UNSTABLE_useTreeGridState<T extends object>(
  props: TreeGridStateProps<T>
): TreeGridState<T> {
  if (!tableNestedRows()) {
    throw new Error(
      "Feature flag for table nested rows must be enabled to use useTreeGridState."
    );
  }

  const [expandedKeysRef, setExpandedKeys] = useControlledState<
    "all" | Set<Key>,
    Set<Key>
  >(
    () =>
      props.UNSTABLE_expandedKeys != null
        ? convertExpanded(props.UNSTABLE_expandedKeys)
        : undefined,
    () =>
      props.UNSTABLE_defaultExpandedKeys != null
        ? convertExpanded(props.UNSTABLE_defaultExpandedKeys)
        : new Set<Key>(),
    props.UNSTABLE_onExpandedChange
  );

  const context = computed(() => ({
    showSelectionCheckboxes:
      !!props.showSelectionCheckboxes
      && (props.selectionMode ?? "none") !== "none",
    showDragButtons: !!props.showDragButtons,
    selectionMode: props.selectionMode ?? "none",
    columns: [] as GridNode<T>[],
  }));

  const sourceNodesRef = computed(() => {
    if (props.children != null && isIterable<GridNode<T>>(props.children)) {
      return [...props.children];
    }

    if (props.collection) {
      const body = props.collection.body;
      return [
        ...props.collection.columns,
        {
          ...body,
          childNodes: [...body.childNodes],
        },
      ] as GridNode<T>[];
    }

    return [] as GridNode<T>[];
  });

  const treeGridCollectionRef = computed(() =>
    generateTreeGridCollection(sourceNodesRef.value, {
      showSelectionCheckboxes: props.showSelectionCheckboxes,
      showDragButtons: props.showDragButtons,
      expandedKeys: expandedKeysRef.value,
    })
  );

  const collectionRef = computed(
    () =>
      new TableCollection(treeGridCollectionRef.value.tableNodes, null, {
        showSelectionCheckboxes:
          context.value.showSelectionCheckboxes,
        showDragButtons: context.value.showDragButtons,
      })
  );

  const tableStateProps = Object.create(props, {
    collection: {
      get() {
        return collectionRef.value;
      },
      enumerable: true,
      configurable: true,
    },
  }) as TableStateProps<T>;

  const tableState = useTableState(tableStateProps);

  const toggle = (key: Key) => {
    setExpandedKeys(
      toggleKey(expandedKeysRef.value, key, treeGridCollectionRef.value)
    );
  };

  return {
    get collection() {
      return tableState.collection;
    },
    get disabledKeys() {
      return tableState.disabledKeys;
    },
    get selectionManager() {
      return tableState.selectionManager;
    },
    get showSelectionCheckboxes() {
      return tableState.showSelectionCheckboxes;
    },
    get sortDescriptor() {
      return tableState.sortDescriptor;
    },
    sort(columnKey: Key, direction) {
      tableState.sort(columnKey, direction);
    },
    get isKeyboardNavigationDisabled() {
      return tableState.isKeyboardNavigationDisabled;
    },
    setKeyboardNavigationDisabled(val: boolean) {
      tableState.setKeyboardNavigationDisabled(val);
    },
    get expandedKeys() {
      return expandedKeysRef.value;
    },
    toggleKey: toggle,
    get keyMap() {
      return treeGridCollectionRef.value.keyMap;
    },
    get userColumnCount() {
      return treeGridCollectionRef.value.userColumnCount;
    },
  };
}

function toggleKey<T>(
  currentExpandedKeys: "all" | Set<Key>,
  key: Key,
  collection: TreeGridCollection<T>
): Set<Key> {
  let updatedExpandedKeys: Set<Key>;
  if (currentExpandedKeys === "all") {
    updatedExpandedKeys = new Set(
      collection.flattenedRows
        .filter((row) => rowSupportsExpansion(row, collection.userColumnCount))
        .map((row) => row.key)
    );
    updatedExpandedKeys.delete(key);
  } else {
    updatedExpandedKeys = new Set(currentExpandedKeys);
    if (updatedExpandedKeys.has(key)) {
      updatedExpandedKeys.delete(key);
    } else {
      updatedExpandedKeys.add(key);
    }
  }

  return updatedExpandedKeys;
}

function convertExpanded(
  expanded: "all" | Iterable<Key>
): "all" | Set<Key> {
  return expanded === "all" ? "all" : new Set(expanded);
}

function generateTreeGridCollection<T>(
  nodes: Iterable<GridNode<T>>,
  opts: TreeGridCollectionOptions
): TreeGridCollection<T> {
  const { expandedKeys = new Set<Key>() } = opts;

  let body: GridNode<T> | null = null;
  const flattenedRows: GridNode<T>[] = [];
  let columnCount = 0;
  let userColumnCount = 0;
  const originalColumns: GridNode<T>[] = [];
  const keyMap = new Map<Key, GridNode<T>>();

  if (opts.showSelectionCheckboxes) {
    columnCount += 1;
  }

  if (opts.showDragButtons) {
    columnCount += 1;
  }

  const topLevelRows: GridNode<T>[] = [];
  const visit = (node: GridNode<T>) => {
    switch (node.type) {
      case "body":
        body = node;
        keyMap.set(body.key, body);
        break;
      case "column":
        if (!node.hasChildNodes) {
          userColumnCount += 1;
        }
        break;
      case "item":
        topLevelRows.push(node);
        return;
    }

    for (const child of node.childNodes) {
      visit(child);
    }
  };

  for (const node of nodes) {
    if (node.type === "column") {
      originalColumns.push(node);
    }
    visit(node);
  }

  columnCount += userColumnCount;

  if (!body) {
    body = {
      type: "body",
      key: "body",
      value: null,
      level: 0,
      hasChildNodes: false,
      childNodes: [],
      rendered: null,
      textValue: "",
      index: 0,
      parentKey: null,
      prevKey: null,
      nextKey: null,
      firstChildKey: null,
      lastChildKey: null,
      props: {},
    };
  }
  const bodyNode = body;

  let globalRowCount = 0;
  const visitNode = (node: GridNode<T>, i?: number) => {
    if (node.type === "item") {
      const childNodes: GridNode<T>[] = [];
      for (const child of node.childNodes) {
        if (child.type === "cell") {
          const cellClone = { ...child };
          if (cellClone.index + 1 === columnCount) {
            cellClone.nextKey = null;
          }
          childNodes.push({ ...cellClone });
        }
      }
      const clone: GridNode<T> = {
        ...node,
        childNodes,
        parentKey: bodyNode.key,
        level: 1,
        index: globalRowCount,
        indexOfType: i,
      };
      globalRowCount += 1;
      flattenedRows.push(clone);
    }

    const newProps: Record<string, unknown> = {};
    if (node.type !== "placeholder" && node.type !== "column") {
      newProps.indexOfType = i;
    }
    Object.assign(node, newProps);
    keyMap.set(node.key, node);

    let lastNode: GridNode<T> | null = null;
    let rowIndex = 0;
    for (const child of node.childNodes) {
      if (
        !(
          child.type === "item"
          && expandedKeys !== "all"
          && !expandedKeys.has(node.key)
        )
      ) {
        if (child.parentKey == null) {
          child.parentKey = node.key;
        }

        if (lastNode) {
          lastNode.nextKey = child.key;
          child.prevKey = lastNode.key;
        } else {
          child.prevKey = null;
        }

        if (child.type === "item") {
          visitNode(child, rowIndex);
          rowIndex += 1;
        } else {
          visitNode(child, child.index);
        }

        lastNode = child;
      }
    }

    if (lastNode) {
      lastNode.nextKey = null;
    }
  };

  let last: GridNode<T> | null = null;
  for (const [index, node] of topLevelRows.entries()) {
    visitNode(node, index);

    if (last) {
      last.nextKey = node.key;
      node.prevKey = last.key;
    } else {
      node.prevKey = null;
    }

    last = node;
  }

  if (last) {
    last.nextKey = null;
  }

  return {
    keyMap,
    userColumnCount,
    flattenedRows,
    tableNodes: [
      ...originalColumns,
      {
        ...bodyNode,
        childNodes: flattenedRows,
        hasChildNodes: flattenedRows.length > 0,
        firstChildKey: flattenedRows[0]?.key ?? null,
        lastChildKey: flattenedRows[flattenedRows.length - 1]?.key ?? null,
      },
    ],
  };
}

function rowSupportsExpansion<T>(
  row: GridNode<T>,
  userColumnCount: number
): boolean {
  const props = row.props as
    | {
      UNSTABLE_childItems?: Iterable<unknown>;
      children?: unknown[];
    }
    | undefined;
  return (
    !!props?.UNSTABLE_childItems
    || (Array.isArray(props?.children)
      && props.children.length > userColumnCount)
  );
}

function isIterable<T>(value: unknown): value is Iterable<T> {
  return (
    value != null
    && typeof (value as { [Symbol.iterator]?: unknown })[Symbol.iterator] ===
      "function"
  );
}
