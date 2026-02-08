# @vue-aria/utils

Low-level shared helpers.

## `mergeProps`

Merges multiple prop objects with React Aria-style event chaining semantics.

```ts
import { mergeProps } from "@vue-aria/utils";

const props = mergeProps(
  { onClick: () => console.log("first"), class: "base" },
  { onClick: () => console.log("second"), class: "active" }
);
```

## Merge Rules

- Event handlers (`onX`) are chained in order.
- `class` values are merged into an array.
- `style` objects are shallow-merged.
- `undefined` values are ignored.

## `useLoadMore`

Triggers incremental loading callbacks as a scroll container approaches the end.

```ts
import { useLoadMore } from "@vue-aria/utils";

useLoadMore(
  {
    isLoading,
    onLoadMore: () => fetchNextPage(),
    scrollOffset: 1,
    items,
  },
  scrollRef
);
```

## `useLoadMoreSentinel`

Triggers incremental loading using an `IntersectionObserver` sentinel.

```ts
import { useLoadMoreSentinel } from "@vue-aria/utils";

useLoadMoreSentinel(
  {
    collection,
    onLoadMore: () => fetchNextPage(),
    scrollOffset: 1,
  },
  sentinelRef
);
```

## `isScrollable` and `getScrollParent`

Scroll utility helpers used by virtualized and drag/drop flows:

- `isScrollable(node, checkForOverflow?)`
- `getScrollParent(node, checkForOverflow?)`

## `filterDOMProps`

Filters arbitrary props down to DOM-safe props (`aria-*`, `data-*`, and known DOM attributes).

```ts
import { filterDOMProps } from "@vue-aria/utils";

const domProps = filterDOMProps({
  id: "calendar",
  "data-test": "calendar",
  "aria-label": "Calendar",
  customProp: "ignored",
});
```

## `nodeContains`

Safe helper for checking whether an event target is contained in an element.

```ts
import { nodeContains } from "@vue-aria/utils";

const isInside = nodeContains(rootElement, event.relatedTarget);
```

## `useDescription`

Provides hidden assistive text and returns `aria-describedby`.

```ts
import { useDescription } from "@vue-aria/utils";

const { descriptionProps } = useDescription("Long press to open menu");
```

## `useErrorMessage`

Provides shared error-message id and invalid-state derivation used by field hooks.

```ts
import { useErrorMessage } from "@vue-aria/utils";

const { errorMessageProps, errorMessageId, isInvalid } = useErrorMessage({
  errorMessage: "Email is required",
  validationState: "invalid",
});
```

## Router Utilities

- `provideRouter`
- `useRouter`
- `useLinkProps`
- `handleLinkClick`

These helpers mirror React Aria's router abstraction so hooks like `useLink` can
do framework-level client navigation while preserving native link semantics.
