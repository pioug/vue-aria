import { computed, ref } from "vue";

export type Key = string | number;
export type Selection = "all" | Set<Key>;

export interface ListOptions<T> {
  /** Initial items in the list. */
  initialItems?: T[];
  /** The keys for the initially selected items. */
  initialSelectedKeys?: "all" | Iterable<Key>;
  /** The initial text to filter the list by. */
  initialFilterText?: string;
  /** A function that returns a unique key for an item object. */
  getKey?: (item: T) => Key;
  /** A function that returns whether a item matches the current filter text. */
  filter?: (item: T, filterText: string) => boolean;
}

export interface ListData<T> {
  /** The items in the list. */
  items: T[];
  /** The keys of the currently selected items in the list. */
  selectedKeys: Selection;
  /** Sets the selected keys. */
  setSelectedKeys(keys: Selection): void;
  /** Adds the given keys to the current selected keys. */
  addKeysToSelection(keys: Selection): void;
  /** Removes the given keys from the current selected keys. */
  removeKeysFromSelection(keys: Selection): void;
  /** The current filter text. */
  filterText: string;
  /** Sets the filter text. */
  setFilterText(filterText: string): void;
  /** Gets an item from the list by key. */
  getItem(key: Key): T | undefined;
  /** Inserts items into the list at the given index. */
  insert(index: number, ...values: T[]): void;
  /** Inserts items into the list before the item at the given key. */
  insertBefore(key: Key, ...values: T[]): void;
  /** Inserts items into the list after the item at the given key. */
  insertAfter(key: Key, ...values: T[]): void;
  /** Appends items to the list. */
  append(...values: T[]): void;
  /** Prepends items to the list. */
  prepend(...values: T[]): void;
  /** Removes items from the list by their keys. */
  remove(...keys: Key[]): void;
  /** Removes all items from the list that are currently selected. */
  removeSelectedItems(): void;
  /** Moves an item within the list. */
  move(key: Key, toIndex: number): void;
  /** Moves one or more items before a given key. */
  moveBefore(key: Key, keys: Iterable<Key>): void;
  /** Moves one or more items after a given key. */
  moveAfter(key: Key, keys: Iterable<Key>): void;
  /** Updates an item in the list. */
  update(key: Key, newValue: T | ((prev: T) => T)): void;
}

interface ListState<T> {
  items: T[];
  selectedKeys: Selection;
  filterText: string;
}

interface CreateListOptions<T, C> extends ListOptions<T> {
  cursor?: C;
}

export function useListData<T>(options: ListOptions<T>): ListData<T> {
  let {
    initialItems = [],
    initialSelectedKeys,
    getKey = (item: any) => item.id ?? item.key,
    filter,
    initialFilterText = "",
  } = options;

  const state = ref<ListState<T>>({
    items: initialItems,
    selectedKeys: initialSelectedKeys === "all" ? "all" : new Set(initialSelectedKeys || []),
    filterText: initialFilterText,
  });

  const filteredItems = computed(() => filter ? state.value.items.filter((item) => filter(item, state.value.filterText)) : state.value.items);

  return {
    get items() {
      return filteredItems.value;
    },
    get selectedKeys() {
      return state.value.selectedKeys;
    },
    get filterText() {
      return state.value.filterText;
    },
    setSelectedKeys(selectedKeys: Selection) {
      state.value = {...state.value, selectedKeys};
    },
    addKeysToSelection(selectedKeys: Selection) {
      state.value = (state => {
        if (state.selectedKeys === "all") {
          return state;
        }
        if (selectedKeys === "all") {
          return {...state, selectedKeys: "all"};
        }

        return {
          ...state,
          selectedKeys: new Set([...state.selectedKeys, ...selectedKeys]),
        };
      })(state.value);
    },
    removeKeysFromSelection(selectedKeys: Selection) {
      state.value = (state => {
        if (selectedKeys === "all") {
          return {...state, selectedKeys: new Set()};
        }

        let selection: Selection = state.selectedKeys === "all" ? new Set(state.items.map(getKey!)) : new Set(state.selectedKeys);
        for (let key of selectedKeys) {
          selection.delete(key);
        }
        return {
          ...state,
          selectedKeys: selection,
        };
      })(state.value);
    },
    setFilterText(filterText: string) {
      state.value = {...state.value, filterText};
    },
    ...createListActions({getKey}, (next) => {
      state.value = next(state.value);
    }),
    getItem(key: Key) {
      return state.value.items.find((item) => getKey(item) === key);
    },
  };
}

export function createListActions<T, C>(opts: CreateListOptions<T, C>, dispatch: (updater: (state: ListState<T>) => ListState<T>) => void): Omit<ListData<T>, "items" | "selectedKeys" | "getItem" | "filterText"> {
  let {cursor, getKey} = opts;

  return {
    setSelectedKeys(selectedKeys: Selection) {
      dispatch((state) => ({
        ...state,
        selectedKeys,
      }));
    },
    addKeysToSelection(selectedKeys: Selection) {
      dispatch((state) => {
        if (state.selectedKeys === "all") {
          return state;
        }
        if (selectedKeys === "all") {
          return {
            ...state,
            selectedKeys: "all",
          };
        }

        return {
          ...state,
          selectedKeys: new Set([...state.selectedKeys, ...selectedKeys]),
        };
      });
    },
    removeKeysFromSelection(selectedKeys: Selection) {
      dispatch((state) => {
        if (selectedKeys === "all") {
          return {
            ...state,
            selectedKeys: new Set(),
          };
        }

        let selection: Selection = state.selectedKeys === "all" ? new Set(state.items.map(getKey!)) : new Set(state.selectedKeys);
        for (let key of selectedKeys) {
          selection.delete(key);
        }
        return {
          ...state,
          selectedKeys: selection,
        };
      });
    },
    setFilterText(filterText: string) {
      dispatch((state) => ({
        ...state,
        filterText,
      }));
    },
    insert(index: number, ...values: T[]) {
      dispatch((state) => insert(state, index, ...values));
    },
    insertBefore(key: Key, ...values: T[]) {
      dispatch((state) => {
        let index = state.items.findIndex((item) => getKey?.(item) === key);
        if (index === -1) {
          if (state.items.length === 0) {
            index = 0;
          } else {
            return state;
          }
        }

        return insert(state, index, ...values);
      });
    },
    insertAfter(key: Key, ...values: T[]) {
      dispatch((state) => {
        let index = state.items.findIndex((item) => getKey?.(item) === key);
        if (index === -1) {
          if (state.items.length === 0) {
            index = 0;
          } else {
            return state;
          }
        }

        return insert(state, index + 1, ...values);
      });
    },
    prepend(...values: T[]) {
      dispatch((state) => insert(state, 0, ...values));
    },
    append(...values: T[]) {
      dispatch((state) => insert(state, state.items.length, ...values));
    },
    remove(...keys: Key[]) {
      dispatch((state) => {
        const keySet = new Set(keys);
        const items = state.items.filter((item) => !keySet.has(getKey!(item)));

        let selection: Selection = "all";
        if (state.selectedKeys !== "all") {
          selection = new Set(state.selectedKeys);
          for (let key of keys) {
            selection.delete(key);
          }
        }
        if (cursor == null && items.length === 0) {
          selection = new Set();
        }

        return {
          ...state,
          items,
          selectedKeys: selection,
        };
      });
    },
    removeSelectedItems() {
      dispatch((state) => {
        if (state.selectedKeys === "all") {
          return {
            ...state,
            items: [],
            selectedKeys: new Set(),
          };
        }

        const selectedKeys = state.selectedKeys;
        const items = state.items.filter((item) => !selectedKeys.has(getKey!(item)));
        return {
          ...state,
          items,
          selectedKeys: new Set(),
        };
      });
    },
    move(key: Key, toIndex: number) {
      dispatch((state) => {
        let index = state.items.findIndex((item) => getKey!(item) === key);
        if (index === -1) {
          return state;
        }

        let copy = state.items.slice();
        let [item] = copy.splice(index, 1);
        copy.splice(toIndex, 0, item);
        return {
          ...state,
          items: copy,
        };
      });
    },
    moveBefore(key: Key, keys: Iterable<Key>) {
      dispatch((state) => {
        let toIndex = state.items.findIndex((item) => getKey!(item) === key);
        if (toIndex === -1) {
          return state;
        }

        const keyArray = Array.isArray(keys) ? keys : [...keys];
        const indices = keyArray.map((key) => state.items.findIndex((item) => getKey!(item) === key)).sort((a, b) => a - b);
        return move(state, indices, toIndex);
      });
    },
    moveAfter(key: Key, keys: Iterable<Key>) {
      dispatch((state) => {
        let toIndex = state.items.findIndex((item) => getKey!(item) === key);
        if (toIndex === -1) {
          return state;
        }

        const keyArray = Array.isArray(keys) ? keys : [...keys];
        const indices = keyArray.map((key) => state.items.findIndex((item) => getKey!(item) === key)).sort((a, b) => a - b);
        return move(state, indices, toIndex + 1);
      });
    },
    update(key: Key, newValue: T | ((prev: T) => T)) {
      dispatch((state) => {
        let index = state.items.findIndex((item) => getKey!(item) === key);
        if (index === -1) {
          return state;
        }

        const value = state.items[index];
        const updatedValue = typeof newValue === "function" ? (newValue as (prev: T) => T)(value) : newValue;

        return {
          ...state,
          items: [
            ...state.items.slice(0, index),
            updatedValue,
            ...state.items.slice(index + 1),
          ],
        };
      });
    },
  };
}

function insert<T>(state: ListState<T>, index: number, ...values: T[]): ListState<T> {
  return {
    ...state,
    items: [
      ...state.items.slice(0, index),
      ...values,
      ...state.items.slice(index),
    ],
  };
}

function move<T>(state: ListState<T>, indices: number[], toIndex: number): ListState<T> {
  toIndex -= indices.filter((index) => index < toIndex).length;

  let moves = indices.map((from) => ({
    from,
    to: toIndex++,
  }));

  for (let i = 0; i < moves.length; i++) {
    let a = moves[i].from;
    for (let j = i; j < moves.length; j++) {
      let b = moves[j].from;
      if (b > a) {
        moves[j].to--;
      }
    }
  }

  for (let i = 0; i < moves.length; i++) {
    let a = moves[i];
    for (let j = moves.length - 1; j > i; j--) {
      let b = moves[j];
      if (b.from < a.to) {
        a.to++;
      } else {
        b.from++;
      }
    }
  }

  let copy = state.items.slice();
  for (let move of moves) {
    let [item] = copy.splice(move.from, 1);
    copy.splice(move.to, 0, item);
  }

  return {
    ...state,
    items: copy,
  };
}
