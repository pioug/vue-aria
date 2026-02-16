# @vue-aria/tabs

`@vue-aria/tabs` ports upstream `@react-aria/tabs` accessibility hooks for tab list, tab, and tab panel behavior.

## Implemented modules

- `useTabList`
- `useTab`
- `useTabPanel`

## Upstream-aligned example

```ts
import { useTab, useTabList, useTabPanel } from "@vue-aria/tabs";
import { useTabListState } from "@vue-stately/tabs";

const state = useTabListState({
  items: [
    { id: "FoR", title: "Founding of Rome", content: "Arma virumque cano." },
    { id: "MaR", title: "Monarchy and Republic", content: "Senatus Populusque Romanus." },
  ],
  getKey: (item) => item.id,
  getTextValue: (item) => item.title,
});

const tabListRef = { current: document.createElement("div") as HTMLElement | null };
const tabRef = { current: document.createElement("div") as HTMLElement | null };
const panelRef = { current: document.createElement("div") as Element | null };

const { tabListProps } = useTabList({ "aria-label": "History of Ancient Rome" }, state, tabListRef);
const { tabProps } = useTab({ key: "FoR" }, state, tabRef);
const { tabPanelProps } = useTabPanel({}, state, panelRef);
```

## Base style snippet parity

```css
.tabs {
  height: 150px;
  display: flex;
  flex-direction: column;
}

[role="tablist"] {
  display: flex;
  border-bottom: 1px solid gray;
}

[role="tab"] {
  padding: 10px;
  border-bottom: 3px solid transparent;
}

[role="tab"][aria-selected="true"] {
  border-color: var(--blue);
}

[role="tab"][aria-disabled] {
  opacity: 0.5;
}

[role="tabpanel"] {
  padding: 10px;
}
```

## Notes

- Keyboard behavior follows upstream orientation and RTL semantics via `TabsKeyboardDelegate`.
- This package is behavior-focused; visual parity is validated in downstream tab component integrations.
- `Spectrum S2` is out of scope unless explicitly requested.
