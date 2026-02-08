# @vue-aria/checkbox

Checkbox and checkbox-group accessibility primitives.

## `useCheckbox`

Provides input and label props for a single checkbox, including pressed-state handling.

```ts
import { ref } from "vue";
import { useCheckbox } from "@vue-aria/checkbox";

const isSelected = ref(false);
const { inputProps, labelProps } = useCheckbox(
  {
    "aria-label": "Subscribe",
  },
  {
    isSelected,
    setSelected: (value) => {
      isSelected.value = value;
    },
    toggle: () => {
      isSelected.value = !isSelected.value;
    },
  }
);
```

## `useCheckboxGroup` and `useCheckboxGroupItem`

Provides group-level semantics (`role="group"`, label/description/error wiring) and item-level behavior.

```ts
import { ref } from "vue";
import { useCheckboxGroup, useCheckboxGroupItem } from "@vue-aria/checkbox";

const values = ref<string[]>([]);
const state = {
  value: values,
  isSelected: (value: string) => values.value.includes(value),
  addValue: (value: string) => {
    if (!values.value.includes(value)) values.value.push(value);
  },
  removeValue: (value: string) => {
    values.value = values.value.filter((existing) => existing !== value);
  },
  toggleValue: (value: string) => {
    if (values.value.includes(value)) {
      values.value = values.value.filter((existing) => existing !== value);
    } else {
      values.value = [...values.value, value];
    }
  },
};

const { groupProps, labelProps } = useCheckboxGroup({ label: "Favorite pets" }, state);
const dogs = useCheckboxGroupItem({ value: "dogs" }, state);
```
