import {
  computed,
  defineComponent,
  h,
  ref,
  watch,
  type PropType,
} from "vue";
import { useProviderProps } from "@vue-spectrum/provider";
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";
import { StepListItem } from "./StepListItem";
import {
  provideStepListContext,
  type SpectrumStepListItemData,
  type StepKey,
} from "./StepListContext";

export interface SpectrumStepListProps {
  id?: string | undefined;
  items?: SpectrumStepListItemData[] | undefined;
  isEmphasized?: boolean | undefined;
  orientation?: "horizontal" | "vertical" | undefined;
  size?: "S" | "M" | "L" | "XL" | undefined;
  selectedKey?: StepKey | undefined;
  defaultSelectedKey?: StepKey | undefined;
  lastCompletedStep?: StepKey | undefined;
  defaultLastCompletedStep?: StepKey | undefined;
  disabledKeys?: Iterable<StepKey> | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  onSelectionChange?: ((key: StepKey) => void) | undefined;
  onLastCompletedStepChange?: ((key: StepKey) => void) | undefined;
  ariaLabel?: string | undefined;
  "aria-label"?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

function normalizeKeySet(keys: Iterable<StepKey> | undefined): Set<StepKey> {
  if (!keys) {
    return new Set<StepKey>();
  }

  return new Set<StepKey>(Array.from(keys));
}

function keyToString(key: StepKey | undefined): string | undefined {
  if (key === undefined || key === null) {
    return undefined;
  }

  return String(key);
}

export const StepList = defineComponent({
  name: "StepList",
  inheritAttrs: false,
  props: {
    id: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    items: {
      type: Array as PropType<SpectrumStepListItemData[] | undefined>,
      default: undefined,
    },
    isEmphasized: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    orientation: {
      type: String as PropType<"horizontal" | "vertical" | undefined>,
      default: undefined,
    },
    size: {
      type: String as PropType<"S" | "M" | "L" | "XL" | undefined>,
      default: undefined,
    },
    selectedKey: {
      type: [String, Number] as PropType<StepKey | undefined>,
      default: undefined,
    },
    defaultSelectedKey: {
      type: [String, Number] as PropType<StepKey | undefined>,
      default: undefined,
    },
    lastCompletedStep: {
      type: [String, Number] as PropType<StepKey | undefined>,
      default: undefined,
    },
    defaultLastCompletedStep: {
      type: [String, Number] as PropType<StepKey | undefined>,
      default: undefined,
    },
    disabledKeys: {
      type: Object as PropType<Iterable<StepKey> | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isReadOnly: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    onSelectionChange: {
      type: Function as PropType<((key: StepKey) => void) | undefined>,
      default: undefined,
    },
    onLastCompletedStepChange: {
      type: Function as PropType<((key: StepKey) => void) | undefined>,
      default: undefined,
    },
    ariaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-label": {
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
  setup(props, { attrs, expose }) {
    const resolvedProps = computed(() =>
      useProviderProps(props as unknown as Record<string, unknown>)
    );

    const stepItems = computed<SpectrumStepListItemData[]>(() => props.items ?? []);
    const keyOrder = computed<StepKey[]>(() => stepItems.value.map((item) => item.key));
    const disabledKeys = computed(() => normalizeKeySet(props.disabledKeys));
    const isDisabled = computed(() =>
      Boolean((resolvedProps.value.isDisabled as boolean | undefined) ?? props.isDisabled)
    );
    const isReadOnly = computed(() =>
      Boolean((resolvedProps.value.isReadOnly as boolean | undefined) ?? props.isReadOnly)
    );

    const resolveStepIndex = (key: StepKey | undefined): number => {
      if (key === undefined || key === null) {
        return -1;
      }

      return keyOrder.value.findIndex(
        (itemKey) => keyToString(itemKey) === keyToString(key)
      );
    };

    const resolveInitialSelectedKey = (): StepKey | null => {
      if (props.selectedKey !== undefined) {
        return props.selectedKey;
      }

      if (props.defaultSelectedKey !== undefined) {
        return props.defaultSelectedKey;
      }

      const lastCompleted = props.lastCompletedStep ?? props.defaultLastCompletedStep;
      const lastCompletedIndex = resolveStepIndex(lastCompleted);
      if (lastCompletedIndex >= 0 && lastCompletedIndex + 1 < keyOrder.value.length) {
        return keyOrder.value[lastCompletedIndex + 1] ?? null;
      }

      return keyOrder.value[0] ?? null;
    };

    const resolveInitialLastCompletedStep = (
      selected: StepKey | null
    ): StepKey | null => {
      if (props.lastCompletedStep !== undefined) {
        return props.lastCompletedStep;
      }

      if (props.defaultLastCompletedStep !== undefined) {
        return props.defaultLastCompletedStep;
      }

      const selectedIndex = resolveStepIndex(selected ?? undefined);
      if (selectedIndex > 0) {
        return keyOrder.value[selectedIndex - 1] ?? null;
      }

      return null;
    };

    const uncontrolledSelectedKey = ref<StepKey | null>(resolveInitialSelectedKey());
    const uncontrolledLastCompletedStep = ref<StepKey | null>(
      resolveInitialLastCompletedStep(uncontrolledSelectedKey.value)
    );

    const selectedKey = computed<StepKey | null>(() =>
      props.selectedKey !== undefined ? props.selectedKey : uncontrolledSelectedKey.value
    );

    const lastCompletedStep = computed<StepKey | null>(() =>
      props.lastCompletedStep !== undefined
        ? props.lastCompletedStep
        : uncontrolledLastCompletedStep.value
    );

    watch(
      keyOrder,
      (keys) => {
        if (keys.length === 0) {
          if (props.selectedKey === undefined) {
            uncontrolledSelectedKey.value = null;
          }
          return;
        }

        const selectedIndex = resolveStepIndex(selectedKey.value ?? undefined);
        if (selectedIndex === -1 && props.selectedKey === undefined) {
          uncontrolledSelectedKey.value = keys[0] ?? null;
        }
      },
      { immediate: true }
    );

    const completedIndex = computed(() =>
      resolveStepIndex(lastCompletedStep.value ?? undefined)
    );

    const isCompleted = (key: StepKey): boolean => {
      const index = resolveStepIndex(key);
      return index !== -1 && index <= completedIndex.value;
    };

    const isSelectable = (key: StepKey): boolean => {
      const index = resolveStepIndex(key);
      if (index === -1) {
        return false;
      }

      if (isDisabled.value || isReadOnly.value || disabledKeys.value.has(key)) {
        return false;
      }

      return index <= completedIndex.value + 1;
    };

    const updateLastCompletedStep = (nextSelected: StepKey) => {
      if (props.lastCompletedStep !== undefined) {
        return;
      }

      const selectedIndex = resolveStepIndex(nextSelected);
      if (selectedIndex <= 0) {
        return;
      }

      const nextCompleted = keyOrder.value[selectedIndex - 1] ?? null;
      const currentCompletedIndex = resolveStepIndex(
        uncontrolledLastCompletedStep.value ?? undefined
      );
      const nextCompletedIndex = resolveStepIndex(nextCompleted ?? undefined);

      if (nextCompleted && nextCompletedIndex > currentCompletedIndex) {
        uncontrolledLastCompletedStep.value = nextCompleted;
        props.onLastCompletedStepChange?.(nextCompleted);
      }
    };

    const selectStep = (key: StepKey) => {
      if (!isSelectable(key)) {
        return;
      }

      if (props.selectedKey === undefined) {
        uncontrolledSelectedKey.value = key;
      }

      props.onSelectionChange?.(key);
      updateLastCompletedStep(key);
    };

    if (selectedKey.value !== null) {
      props.onSelectionChange?.(selectedKey.value);
    }

    provideStepListContext({
      selectedKey: computed(() => selectedKey.value),
      isCompleted,
      isSelectable,
      isDisabled,
      isReadOnly,
      selectStep,
      getItemIndex: (key: StepKey) => resolveStepIndex(key),
    });

    const { styleProps } = useStyleProps({
      UNSAFE_className: props.UNSAFE_className,
      UNSAFE_style: props.UNSAFE_style,
    });

    const rootRef = ref<HTMLOListElement | null>(null);
    const ariaLabel = computed(
      () =>
        props.ariaLabel ??
        props["aria-label"] ??
        (attrs["aria-label"] as string | undefined) ??
        (attrs["ariaLabel"] as string | undefined)
    );

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
    });

    return () => {
      const size = props.size ?? "M";
      const orientation = props.orientation ?? "horizontal";
      const attrsRecord = {
        ...(attrs as Record<string, unknown>),
      };

      delete attrsRecord["aria-label"];
      delete attrsRecord.ariaLabel;

      return h(
        "ol",
        {
          ...attrsRecord,
          id: props.id,
          ref: (value: unknown) => {
            rootRef.value = value as HTMLOListElement | null;
          },
          role: "list",
          "aria-label": ariaLabel.value,
          class: classNames(
            "spectrum-Steplist",
            styleProps.class as ClassValue | undefined,
            {
              "spectrum-Steplist--small": size === "S",
              "spectrum-Steplist--medium": size === "M",
              "spectrum-Steplist--large": size === "L",
              "spectrum-Steplist--xlarge": size === "XL",
              "spectrum-Steplist--emphasized": Boolean(props.isEmphasized),
              "spectrum-Steplist--horizontal": orientation === "horizontal",
              "spectrum-Steplist--vertical": orientation === "vertical",
            }
          ),
          style: styleProps.style,
        },
        stepItems.value.map((item) =>
          h(StepListItem, {
            key: keyToString(item.key),
            item,
            isEmphasized: props.isEmphasized,
          })
        )
      );
    };
  },
});
