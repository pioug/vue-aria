# @vue-aria/disclosure

Disclosure/accordion-style accessibility primitives.

## `useDisclosureState`

State adapter for controlled and uncontrolled disclosure expansion.

## `useDisclosureGroupState`

State adapter for disclosure groups (accordion behavior), including
single-expand and multi-expand modes.

## `useDisclosure`

Provides button and panel props for disclosure interactions and ARIA wiring.

```ts
import {
  useAccordionItem,
  useDisclosure,
  useDisclosureState,
  useDisclosureGroupState,
} from "@vue-aria/disclosure";

const state = useDisclosureState({ defaultExpanded: false });
const group = useDisclosureGroupState({ allowsMultipleExpanded: false });
const { buttonProps, panelProps } = useDisclosure({}, state, panelRef);
const item = useAccordionItem({ id: "section-a" }, group, panelRef);
```

### Behavior

- Supports keyboard and pointer toggling semantics.
- Wires `aria-expanded`, `aria-controls`, and panel labeling.
- Handles `beforematch` events to reveal hidden content.
- Supports controlled/uncontrolled disclosure groups with key toggling.
- Supports accordion item wiring through disclosure-group state.
