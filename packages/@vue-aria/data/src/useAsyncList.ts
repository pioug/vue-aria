import { computed, ref } from "vue";
import { createListActions, type ListData, type ListState, type Key } from "./useListData";

type LoadingState = "loading" | "sorting" | "loadingMore" | "error" | "idle" | "filtering";
export interface SortDescriptor {
  column: Key;
  direction: "ascending" | "descending";
}

export interface AsyncListOptions<T, C> {
  /** The keys for the initially selected items. */
  initialSelectedKeys?: Iterable<Key>;
  /** The initial sort descriptor. */
  initialSortDescriptor?: SortDescriptor;
  /** The initial filter text. */
  initialFilterText?: string;
  /** A function that returns a unique key for an item object. */
  getKey?: (item: T) => Key;
  /** A function that loads the data for the items in the list. */
  load: AsyncListLoadFunction<T, C>;
  /**
   * An optional function that performs sorting. If not provided,
   * then `sortDescriptor` is passed to the `load` function.
   */
  sort?: AsyncListLoadFunction<T, C, AsyncListLoadOptions<T, C> & {sortDescriptor: SortDescriptor}>;
}

type AsyncListLoadFunction<T, C, S extends AsyncListLoadOptions<T, C> = AsyncListLoadOptions<T, C>> =
  (state: S) => AsyncListStateUpdate<T, C> | Promise<AsyncListStateUpdate<T, C>>;

interface AsyncListLoadOptions<T, C> {
  /** The items currently in the list. */
  items: T[];
  /** The keys of the currently selected items in the list. */
  selectedKeys: Selection;
  /** The current sort descriptor for the list. */
  sortDescriptor?: SortDescriptor;
  /** An abort signal used to notify the load function that the request has been aborted. */
  signal: AbortSignal;
  /** The pagination cursor returned from the last page load. */
  cursor?: C;
  /** The current filter text used to perform server side filtering. */
  filterText?: string;
  /** The current loading state of the list. */
  loadingState?: LoadingState;
}

interface AsyncListStateUpdate<T, C> {
  /** The new items to append to the list. */
  items: Iterable<T>;
  /** The keys to add to the selection. */
  selectedKeys?: Iterable<Key>;
  /** The sort descriptor to set. */
  sortDescriptor?: SortDescriptor;
  /** The pagination cursor to be used for the next page load. */
  cursor?: C;
  /** The updated filter text for the list. */
  filterText?: string;
}

type Selection = "all" | Set<Key>;

interface AsyncListState<T, C> extends ListState<T> {
  state: LoadingState;
  selectedKeys: Selection;
  sortDescriptor?: SortDescriptor;
  error?: Error;
  abortController?: AbortController;
  cursor?: C;
}

type ActionType = "success" | "error" | "loading" | "loadingMore" | "sorting" | "update" | "filtering";
interface Action<T, C> {
  type: ActionType;
  items?: Iterable<T>;
  selectedKeys?: Iterable<Key>;
  sortDescriptor?: SortDescriptor;
  error?: Error;
  abortController?: AbortController;
  updater?: (state: ListState<T>) => ListState<T>;
  cursor?: C;
  filterText?: string;
}

export interface AsyncListData<T> extends ListData<T> {
  /** Whether data is currently being loaded. */
  isLoading: boolean;
  /** If loading data failed, then this contains the error that occurred. */
  error?: Error;
  /** The current sort descriptor for the list. */
  sortDescriptor?: SortDescriptor;
  /** Reloads the data in the list. */
  reload(): void;
  /** Loads the next page of data in the list. */
  loadMore(): void;
  /** Triggers sorting for the list. */
  sort(descriptor: SortDescriptor): void;
  /** The current loading state for the list. */
  loadingState: LoadingState;
}

function reducer<T, C>(data: AsyncListState<T, C>, action: Action<T, C>): AsyncListState<T, C> {
  let selectedKeys;
  switch (data.state) {
    case "idle":
    case "error":
      switch (action.type) {
        case "loading":
        case "loadingMore":
        case "sorting":
        case "filtering":
          return {
            ...data,
            filterText: action.filterText ?? data.filterText,
            state: action.type,
            items: action.type === "loading" ? [] : data.items,
            sortDescriptor: action.sortDescriptor ?? data.sortDescriptor,
            abortController: action.abortController,
          };
        case "update":
          return {
            ...data,
            ...action.updater?.(data),
          };
        case "success":
        case "error":
          return data;
        default:
          throw new Error(`Invalid action "${action.type}" in state "${data.state}"`);
      }
    case "loading":
    case "sorting":
    case "filtering":
      switch (action.type) {
        case "success":
          if (action.abortController !== data.abortController) {
            return data;
          }

          selectedKeys = action.selectedKeys ?? data.selectedKeys;
          return {
            ...data,
            filterText: action.filterText ?? data.filterText,
            state: "idle",
            items: [...(action.items ?? [])],
            selectedKeys: selectedKeys === "all" ? "all" : new Set(selectedKeys),
            sortDescriptor: action.sortDescriptor ?? data.sortDescriptor,
            abortController: undefined,
            cursor: action.cursor,
          };
        case "error":
          if (action.abortController !== data.abortController) {
            return data;
          }

          return {
            ...data,
            state: "error",
            error: action.error,
            abortController: undefined,
          };
        case "loading":
        case "loadingMore":
        case "sorting":
        case "filtering":
          data.abortController?.abort("aborting current load and starting new one");
          return {
            ...data,
            filterText: action.filterText ?? data.filterText,
            state: action.type,
            items: action.type === "loading" ? [] : data.items,
            abortController: action.abortController,
          };
        case "update":
          return {
            ...data,
            ...action.updater?.(data),
          };
        default:
          throw new Error(`Invalid action "${action.type}" in state "${data.state}"`);
      }
    case "loadingMore":
      switch (action.type) {
        case "success":
          selectedKeys = data.selectedKeys === "all" || action.selectedKeys === "all"
            ? "all"
            : new Set([...data.selectedKeys, ...(action.selectedKeys ?? [])]);
          return {
            ...data,
            state: "idle",
            items: [...data.items, ...(action.items ?? [])],
            selectedKeys,
            sortDescriptor: action.sortDescriptor ?? data.sortDescriptor,
            abortController: undefined,
            cursor: action.cursor,
          };
        case "error":
          if (action.abortController !== data.abortController) {
            return data;
          }

          return {
            ...data,
            state: "error",
            error: action.error,
          };
        case "loading":
        case "sorting":
        case "filtering":
          data.abortController?.abort();
          return {
            ...data,
            filterText: action.filterText ?? data.filterText,
            state: action.type,
            items: action.type === "loading" ? [] : data.items,
            abortController: action.abortController,
          };
        case "loadingMore":
          action.abortController?.abort();
          return data;
        case "update":
          return {
            ...data,
            ...action.updater?.(data),
          };
        default:
          throw new Error(`Invalid action "${action.type}" in state "${data.state}"`);
      }
    default:
      throw new Error(`Invalid state "${data.state}"`);
  }
}

export function useAsyncList<T, C = string>(options: AsyncListOptions<T, C>): AsyncListData<T> {
  const {
    load,
    sort,
    initialSelectedKeys,
    initialSortDescriptor,
    getKey = (item: any) => item.id || item.key,
    initialFilterText = "",
  } = options;

  const data = ref<AsyncListState<T, C>>({
    state: "idle",
    error: undefined,
    items: [],
    selectedKeys: initialSelectedKeys === "all" ? "all" : new Set(initialSelectedKeys),
    sortDescriptor: initialSortDescriptor,
    filterText: initialFilterText,
  });

  const dispatch = (action: Action<T, C>) => {
    data.value = reducer(data.value, action);
  };

  const dispatchFetch = async (action: Action<T, C>, fn: AsyncListLoadFunction<T, C>) => {
    const currentData = data.value;
    const abortController = new AbortController();
    try {
      dispatch({...action, abortController});
      const previousFilterText = action.filterText ?? currentData.filterText;

      const response = await fn({
        items: currentData.items.slice(),
        selectedKeys: currentData.selectedKeys,
        sortDescriptor: action.sortDescriptor ?? currentData.sortDescriptor,
        signal: abortController.signal,
        cursor: action.type === "loadingMore" ? currentData.cursor : undefined,
        filterText: previousFilterText,
        loadingState: currentData.state,
      });

      const filterText = response.filterText ?? previousFilterText;
      dispatch({type: "success", ...response, abortController});
      if (filterText && (filterText !== previousFilterText) && !abortController.signal.aborted) {
        dispatchFetch({type: "filtering", filterText}, load);
      }
    } catch (error) {
      dispatch({type: "error", error: error as Error, abortController});
    }
  };

  const didDispatchInitialFetch = ref(false);
  if (!didDispatchInitialFetch.value) {
    dispatchFetch({type: "loading"}, load);
    didDispatchInitialFetch.value = true;
  }

  return {
    get items() {
      return data.value.items;
    },
    get selectedKeys() {
      return data.value.selectedKeys;
    },
    get sortDescriptor() {
      return data.value.sortDescriptor;
    },
    get filterText() {
      return data.value.filterText;
    },
    get isLoading() {
      return data.value.state === "loading" || data.value.state === "loadingMore" || data.value.state === "sorting" || data.value.state === "filtering";
    },
    get loadingState() {
      return data.value.state;
    },
    get error() {
      return data.value.error;
    },
    getItem(key: Key) {
      return data.value.items.find((item) => getKey(item) === key);
    },
    reload() {
      dispatchFetch({type: "loading"}, load);
    },
    loadMore() {
      if (data.value.state === "loading" || data.value.state === "loadingMore" || data.value.state === "filtering" || data.value.cursor == null) {
        return;
      }

      dispatchFetch({type: "loadingMore"}, load);
    },
    sort(sortDescriptor: SortDescriptor) {
      dispatchFetch({type: "sorting", sortDescriptor}, (sort || load) as AsyncListLoadFunction<T, C>);
    },
    ...createListActions({...options, getKey, cursor: data.value.cursor}, (fn) => {
      dispatch({type: "update", updater: fn});
    }),
    setFilterText(filterText: string) {
      dispatchFetch({type: "filtering", filterText}, load);
    },
  };
}
