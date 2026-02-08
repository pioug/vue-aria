# @vue-aria/disclosure

Disclosure/accordion-style accessibility primitives.

## `useDisclosureState`

State adapter for controlled and uncontrolled disclosure expansion.

## `useDisclosure`

Provides button and panel props for disclosure interactions and ARIA wiring.

```ts
import { useDisclosure, useDisclosureState } from "@vue-aria/disclosure";

const state = useDisclosureState({ defaultExpanded: false });
const { buttonProps, panelProps } = useDisclosure({}, state, panelRef);
```

### Behavior

- Supports keyboard and pointer toggling semantics.
- Wires `aria-expanded`, `aria-controls`, and panel labeling.
- Handles `beforematch` events to reveal hidden content.
