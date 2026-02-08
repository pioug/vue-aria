# @vue-aria/tabs

Tabs accessibility primitives and state adapters.

## `useTabListState`

Manages controlled/uncontrolled selected tab keys, disabled keys, and focused tab key.

## `useTabList`

Provides tab list semantics and keyboard navigation behavior (orientation-aware and RTL-aware).

## `useTab`

Provides tab semantics, selection wiring, and interaction props for each tab trigger.

## `useTabPanel`

Provides tab panel labeling and focusability behavior.

```ts
import {
  useTabListState,
  useTabList,
  useTab,
  useTabPanel,
} from "@vue-aria/tabs";

const state = useTabListState({
  collection: [{ key: "overview" }, { key: "details" }],
});
const { tabListProps } = useTabList({ "aria-label": "Tabs" }, state);
const { tabProps } = useTab({ key: "overview" }, state, tabRef);
const { tabPanelProps } = useTabPanel({}, state, panelRef);
```
