# @vue-aria/radio

Radio-group accessibility primitives.

## `useRadioGroup`

Provides group semantics, label/description/error wiring, and arrow-key navigation.

```ts
import { useRadioGroup } from "@vue-aria/radio";

const state = {
  selectedValue: null,
  setSelectedValue: (value: string | null) => {},
};

const { radioGroupProps, labelProps, descriptionProps, errorMessageProps } =
  useRadioGroup(
    {
      label: "Favorite pet",
      orientation: "horizontal",
    },
    state
  );
```

## `useRadio`

Provides individual radio props tied to a shared radio-group state object.

```ts
import { useRadio } from "@vue-aria/radio";

const dogs = useRadio({ value: "dogs" }, state);
```

### Behavior

- Supports group-level keyboard navigation (`ArrowUp/Down/Left/Right`) with wrap-around.
- Composes `aria-describedby` with group description and error ids.
- Handles selection via input change and label press interactions.
