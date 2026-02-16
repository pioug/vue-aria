import { computed, defineComponent, h, ref, toRaw, type PropType } from "vue";
import { useVisuallyHidden } from "@vue-aria/visually-hidden";
import { useFormReset } from "@vue-aria/utils";
import { useFormValidation } from "@vue-aria/form";
import { selectData, type SelectState } from "./useSelect";

export interface AriaHiddenSelectProps {
  autoComplete?: string;
  label?: string;
  name?: string;
  form?: string;
  isDisabled?: boolean;
}

export interface HiddenSelectProps extends AriaHiddenSelectProps {
  state: SelectState;
  triggerRef: { current: Element | null };
}

export interface AriaHiddenSelectOptions extends AriaHiddenSelectProps {
  selectRef?: { value: HTMLSelectElement | HTMLInputElement | null };
}

export interface HiddenSelectAria {
  containerProps: Record<string, unknown>;
  inputProps: Record<string, unknown>;
  selectProps: Record<string, unknown>;
}

export function useHiddenSelect(
  props: AriaHiddenSelectOptions,
  state: SelectState,
  triggerRef: { current: Element | null }
): HiddenSelectAria {
  const stateObject = (toRaw(state as object) as object) ?? (state as object);
  const data = selectData.get(stateObject) || selectData.get(state as object) || {};
  const name = props.name ?? data.name;
  const form = props.form ?? data.form;
  const isDisabled = props.isDisabled ?? data.isDisabled;
  const validationBehavior = data.validationBehavior;
  const isRequired = data.isRequired;

  const { visuallyHiddenProps } = useVisuallyHidden({
    style: {
      position: "fixed",
      top: 0,
      left: 0,
    },
  });

  useFormReset(
    props.selectRef as any,
    state.defaultValue,
    (value) => state.setValue?.(value as string | string[])
  );
  useFormValidation(
    {
      validationBehavior,
      focus: () => (triggerRef.current as HTMLElement | null)?.focus(),
    },
    state as any,
    props.selectRef as any
  );

  const onChange = (event: Event) => {
    const target = (event.target ?? event.currentTarget) as HTMLSelectElement;
    if (target.multiple) {
      state.setValue?.(Array.from(target.selectedOptions, (option) => option.value));
    } else {
      state.setValue?.(target.value);
    }
  };

  return {
    containerProps: {
      ...visuallyHiddenProps,
      "aria-hidden": true,
      "data-react-aria-prevent-focus": true,
      "data-a11y-ignore": "aria-hidden-focus",
    },
    inputProps: {
      style: { display: "none" },
    },
    selectProps: {
      tabIndex: -1,
      autoComplete: props.autoComplete,
      disabled: isDisabled,
      multiple: state.selectionManager.selectionMode === "multiple",
      required: validationBehavior === "native" && isRequired,
      name,
      form,
      onChange,
      onInput: onChange,
      onFocus: () => (triggerRef.current as HTMLElement | null)?.focus(),
    },
  };
}

export const HiddenSelect = defineComponent({
  name: "HiddenSelect",
  props: {
    autoComplete: String as PropType<string | undefined>,
    label: String as PropType<string | undefined>,
    name: String as PropType<string | undefined>,
    form: String as PropType<string | undefined>,
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    state: {
      type: Object as PropType<SelectState>,
      required: true,
    },
    triggerRef: {
      type: Object as PropType<{ current: Element | null }>,
      required: true,
    },
  },
  setup(props) {
    const selectRef = ref<HTMLSelectElement | HTMLInputElement | null>(null);
    const { containerProps, selectProps } = useHiddenSelect(
      { ...props, selectRef },
      props.state,
      props.triggerRef
    );

    const values = computed<(string | null)[]>(() =>
      Array.isArray(props.state.value) ? props.state.value : [props.state.value ?? null]
    );

    return () => {
      const resolvedName = selectProps.name as string | undefined;
      const resolvedForm = selectProps.form as string | undefined;
      const resolvedDisabled = selectProps.disabled as boolean | undefined;
      const resolvedDefaultValue = (props.state.defaultValue as string | string[] | null) ?? "";
      const resolvedValue = (props.state.value as string | string[]) ?? "";

      if (props.state.collection?.size <= 300) {
        const optionNodes: any[] = [];
        const defaultValue =
          props.state.defaultValue != null && !Array.isArray(props.state.defaultValue)
            ? String(props.state.defaultValue)
            : null;
        optionNodes.push(h("option", { selected: defaultValue == null }));
        for (const key of props.state.collection?.getKeys?.() ?? []) {
          const item = props.state.collection.getItem(key);
          if (item && item.type === "item") {
            const value = String(item.key);
            optionNodes.push(
              h(
                "option",
                {
                  value,
                  selected: defaultValue != null && value === defaultValue,
                },
                String(item.textValue)
              )
            );
          }
        }

        if ((props.state.collection?.size ?? 0) === 0 && resolvedName) {
          for (const [index, value] of values.value.entries()) {
            optionNodes.push(h("option", { key: index, value: value ?? "" }));
          }
        }

        return h(
          "div",
          { ...containerProps, "data-testid": "hidden-select-container" },
          h("label", [props.label, h("select", {
            ...selectProps,
            defaultValue: resolvedDefaultValue,
            value: resolvedValue,
            ref: selectRef,
          }, optionNodes)])
        );
      }

      if (resolvedName) {
        const nodes: any[] = [];
        const list = values.value.length === 0 ? [null] : values.value;
        const stateObject = (toRaw(props.state as object) as object) ?? (props.state as object);
        const data = selectData.get(stateObject) || selectData.get(props.state as object) || {};
        const validationBehavior = data.validationBehavior;
        for (const [index, value] of list.entries()) {
          nodes.push(
            h("input", {
              type: validationBehavior === "native" ? "text" : "hidden",
              style: validationBehavior === "native" ? { display: "none" } : undefined,
              autoComplete: selectProps.autoComplete as string | undefined,
              name: resolvedName,
              form: resolvedForm,
              disabled: resolvedDisabled,
              value: value ?? "",
              required: validationBehavior === "native" ? index === 0 && Boolean(selectProps.required) : undefined,
              onChange: () => {},
              ref: index === 0 ? selectRef : undefined,
            })
          );
        }
        return h("div", nodes);
      }

      return null;
    };
  },
});
