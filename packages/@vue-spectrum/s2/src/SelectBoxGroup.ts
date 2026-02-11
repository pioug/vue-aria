import clsx from "clsx";
import {
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  inject,
  onBeforeUnmount,
  provide,
  ref,
  watch,
  type InjectionKey,
  type PropType,
} from "vue";
import { useProviderProps } from "@vue-spectrum/provider";

export type SelectBoxKey = string | number;
export type SelectBoxGroupSelectionMode = "single" | "multiple";
export type SelectBoxGroupOrientation = "horizontal" | "vertical";

export interface S2SelectBoxGroupProps {
  selectionMode?: SelectBoxGroupSelectionMode | undefined;
  selectedKeys?: Iterable<SelectBoxKey> | undefined;
  defaultSelectedKeys?: Iterable<SelectBoxKey> | undefined;
  onSelectionChange?: ((keys: Set<SelectBoxKey>) => void) | undefined;
  orientation?: SelectBoxGroupOrientation | undefined;
  isDisabled?: boolean | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export interface S2SelectBoxProps {
  id?: SelectBoxKey | undefined;
  textValue?: string | undefined;
  ariaLabel?: string | undefined;
  isDisabled?: boolean | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

interface SelectBoxGroupContextValue {
  getSelectionMode: () => SelectBoxGroupSelectionMode;
  getOrientation: () => SelectBoxGroupOrientation;
  isGroupDisabled: () => boolean;
  isSelected: (key: SelectBoxKey) => boolean;
  isOptionDisabled: (optionDisabled: boolean | undefined) => boolean;
  toggleSelection: (key: SelectBoxKey, optionDisabled: boolean | undefined) => void;
  registerKey: (key: SelectBoxKey) => void;
  unregisterKey: (key: SelectBoxKey) => void;
}

const SelectBoxGroupContext: InjectionKey<SelectBoxGroupContextValue> = Symbol(
  "S2SelectBoxGroupContext"
);

function keyToString(key: SelectBoxKey): string {
  return String(key);
}

function normalizeKeySet(keys: Iterable<SelectBoxKey> | undefined): Set<string> {
  if (!keys) {
    return new Set<string>();
  }

  return new Set(Array.from(keys, (key) => keyToString(key)));
}

function setsEqual(first: Set<string>, second: Set<string>): boolean {
  if (first.size !== second.size) {
    return false;
  }

  for (const value of first) {
    if (!second.has(value)) {
      return false;
    }
  }

  return true;
}

export const SelectBox = defineComponent({
  name: "S2SelectBox",
  inheritAttrs: false,
  props: {
    id: {
      type: [String, Number] as PropType<SelectBoxKey | undefined>,
      default: undefined,
    },
    textValue: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    slot: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, string | number> | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const context = inject(SelectBoxGroupContext, null);
    const instance = getCurrentInstance();
    const fallbackKey = `s2-select-box-${instance?.uid ?? "unknown"}`;
    const resolvedKey = computed<SelectBoxKey>(() => props.id ?? fallbackKey);

    watch(
      resolvedKey,
      (next, previous) => {
        if (!context) {
          return;
        }

        if (previous !== undefined) {
          context.unregisterKey(previous);
        }

        context.registerKey(next);
      },
      { immediate: true }
    );

    onBeforeUnmount(() => {
      context?.unregisterKey(resolvedKey.value);
    });

    const selectionMode = computed<SelectBoxGroupSelectionMode>(
      () => context?.getSelectionMode() ?? "single"
    );
    const orientation = computed<SelectBoxGroupOrientation>(
      () => context?.getOrientation() ?? "vertical"
    );
    const isDisabled = computed(() =>
      context ? context.isOptionDisabled(props.isDisabled) : Boolean(props.isDisabled)
    );
    const isSelected = computed(() =>
      context ? context.isSelected(resolvedKey.value) : false
    );

    const activate = () => {
      if (!context) {
        return;
      }

      context.toggleSelection(resolvedKey.value, props.isDisabled);
    };

    return () =>
      h(
        "div",
        {
          ...(attrs as Record<string, unknown>),
          role: selectionMode.value === "single" ? "radio" : "checkbox",
          "aria-checked": String(isSelected.value),
          "aria-disabled": isDisabled.value ? "true" : undefined,
          "aria-label": props.ariaLabel,
          "data-s2-key": keyToString(resolvedKey.value),
          "data-s2-orientation": orientation.value,
          "data-s2-selected": isSelected.value ? "true" : undefined,
          tabindex: isDisabled.value ? -1 : 0,
          class: clsx(
            "s2-SelectBox",
            `s2-SelectBox--${orientation.value}`,
            {
              "is-selected": isSelected.value,
              "is-disabled": isDisabled.value,
            },
            props.UNSAFE_className
          ),
          style: props.UNSAFE_style,
          onClick: () => {
            if (isDisabled.value) {
              return;
            }

            activate();
          },
          onKeydown: (event: KeyboardEvent) => {
            if (isDisabled.value) {
              return;
            }

            if (event.key !== " " && event.key !== "Enter") {
              return;
            }

            event.preventDefault();
            activate();
          },
        },
        [
          h(
            "div",
            {
              class: "s2-SelectBox-label",
            },
            slots.default?.() ?? []
          ),
          slots.description
            ? h(
                "div",
                {
                  class: "s2-SelectBox-description",
                },
                slots.description()
              )
            : null,
        ]
      );
  },
});

export const SelectBoxGroup = defineComponent({
  name: "S2SelectBoxGroup",
  inheritAttrs: false,
  props: {
    selectionMode: {
      type: String as PropType<SelectBoxGroupSelectionMode | undefined>,
      default: undefined,
    },
    selectedKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<SelectBoxKey> | undefined>,
      default: undefined,
    },
    defaultSelectedKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<SelectBoxKey> | undefined>,
      default: undefined,
    },
    onSelectionChange: {
      type: Function as PropType<((keys: Set<SelectBoxKey>) => void) | undefined>,
      default: undefined,
    },
    orientation: {
      type: String as PropType<SelectBoxGroupOrientation | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    ariaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    ariaLabelledby: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    slot: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_className: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    UNSAFE_style: {
      type: Object as PropType<Record<string, string | number> | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const keyMap = new Map<string, SelectBoxKey>();
    const selectionMode = computed<SelectBoxGroupSelectionMode>(
      () => props.selectionMode ?? "single"
    );
    const orientation = computed<SelectBoxGroupOrientation>(
      () => props.orientation ?? "vertical"
    );

    const mergedProps = computed(() =>
      useProviderProps({
        ...(attrs as Record<string, unknown>),
        isDisabled: props.isDisabled,
        slot: props.slot,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      })
    );
    const isDisabled = computed(() => Boolean(mergedProps.value.isDisabled));

    const uncontrolledSelectedKeys = ref<Set<string>>(
      normalizeKeySet(props.defaultSelectedKeys)
    );

    const selectedKeys = computed<Set<string>>(() =>
      props.selectedKeys !== undefined
        ? normalizeKeySet(props.selectedKeys)
        : uncontrolledSelectedKeys.value
    );

    const emitSelection = (nextSelection: Set<string>) => {
      if (setsEqual(nextSelection, selectedKeys.value)) {
        return;
      }

      if (props.selectedKeys === undefined) {
        uncontrolledSelectedKeys.value = nextSelection;
      }

      const external = new Set<SelectBoxKey>();
      for (const key of nextSelection) {
        external.add(keyMap.get(key) ?? key);
      }

      props.onSelectionChange?.(external);
    };

    const contextValue: SelectBoxGroupContextValue = {
      getSelectionMode: () => selectionMode.value,
      getOrientation: () => orientation.value,
      isGroupDisabled: () => isDisabled.value,
      isSelected: (key) => selectedKeys.value.has(keyToString(key)),
      isOptionDisabled: (optionDisabled) => Boolean(isDisabled.value || optionDisabled),
      toggleSelection: (key, optionDisabled) => {
        if (isDisabled.value || optionDisabled) {
          return;
        }

        const keyString = keyToString(key);
        keyMap.set(keyString, key);

        if (selectionMode.value === "single") {
          emitSelection(new Set([keyString]));
          return;
        }

        const next = new Set(selectedKeys.value);
        if (next.has(keyString)) {
          next.delete(keyString);
        } else {
          next.add(keyString);
        }

        emitSelection(next);
      },
      registerKey: (key) => {
        keyMap.set(keyToString(key), key);
      },
      unregisterKey: (key) => {
        keyMap.delete(keyToString(key));
      },
    };

    provide(SelectBoxGroupContext, contextValue);

    return () => {
      const role = selectionMode.value === "single" ? "radiogroup" : "group";

      return h(
        "div",
        {
          role,
          "aria-disabled": isDisabled.value ? "true" : undefined,
          "aria-label": props.ariaLabel,
          "aria-labelledby": props.ariaLabelledby,
          "data-s2-orientation": orientation.value,
          "data-s2-selection-mode": selectionMode.value,
          class: clsx(
            "s2-SelectBoxGroup",
            `s2-SelectBoxGroup--${orientation.value}`,
            mergedProps.value.UNSAFE_className
          ),
          style: mergedProps.value.UNSAFE_style,
        },
        slots.default?.() ?? []
      );
    };
  },
});
