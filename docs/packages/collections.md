# @vue-aria/collections

`@vue-aria/collections` ports upstream `@react-stately/collections` primitives used to build and cache collection nodes in Vue.

## Implemented modules

- `BaseCollection`
- `CollectionBuilder`
- `createLeafComponent`
- `createBranchComponent`
- `createHideableComponent`
- `useIsHidden`
- `useCachedChildren`

## Upstream-aligned example

```ts
import { BaseCollection, ItemNode } from "@vue-aria/collections";

const collection = new BaseCollection<string>();

const a = new ItemNode<string>("a");
a.textValue = "alpha";
a.nextKey = "b";

const b = new ItemNode<string>("b");
b.textValue = "beta";
b.prevKey = "a";

collection.addNode(a);
collection.addNode(b);
collection.commit("a", "b");

const filtered = collection.filter((text) => text.startsWith("a"));
```

## Notes

- This is a non-visual data package; no base styles are required.
- `Spectrum S2` is out of scope unless explicitly requested.
