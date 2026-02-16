import { computed, type Ref } from "vue";
import { BaseCollection } from "./BaseCollection";

export interface CollectionBuilderProps<C extends BaseCollection<object>> {
  content: unknown;
  children: (collection: C) => unknown;
  createCollection?: () => C;
}

export interface CollectionProps<T> {
  items?: Iterable<T>;
  children?: unknown;
  dependencies?: ReadonlyArray<unknown>;
  idScope?: string | number;
}

export function CollectionBuilder<C extends BaseCollection<object>>(props: CollectionBuilderProps<C>) {
  const collection = props.createCollection?.() ?? (new BaseCollection<object>() as C);
  return props.children(collection);
}

export function Collection<T>(_props: CollectionProps<T>) {
  return null;
}

export function createLeafComponent<T extends (...args: any[]) => any>(
  _collectionNodeClass: unknown,
  render: T
): T {
  return render;
}

export function createBranchComponent<T extends (...args: any[]) => any>(
  _collectionNodeClass: unknown,
  render: T,
  _useChildren?: (props: unknown) => unknown
): T {
  return render;
}

export type CollectionBuilderResult<C extends BaseCollection<object>> = Ref<C>;

export function useCollectionBuilder<C extends BaseCollection<object>>(createCollection?: () => C) {
  const collection = computed(() => createCollection?.() ?? (new BaseCollection<object>() as C));
  return collection;
}
