import { computed, defineComponent, h, ref, watch } from "vue";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import {
  classNames,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import { ColorSwatch } from "./ColorSwatch";
import { colorSwatchPickerPropOptions } from "./types";
import { parseColor, tryParseColor, toColorLabel } from "./utils";

function getIndexFromKey(keys: string[], key: string | null | undefined): number {
  if (!key) {
    return keys.length > 0 ? 0 : -1;
  }

  const found = keys.findIndex((candidate) => candidate === key);
  return found < 0 ? (keys.length > 0 ? 0 : -1) : found;
}

export const ColorSwatchPicker = defineComponent({
  name: "ColorSwatchPicker",
  inheritAttrs: false,
  props: {
    ...colorSwatchPickerPropOptions,
  },
  setup(props, { attrs, expose }) {
    const rootRef = ref<HTMLElement | null>(null);

    const items = computed(() =>
      props.items.map((item) => ({
        ...item,
        color: parseColor(item.color),
      }))
    );
    const itemKeys = computed(() => items.value.map((item) => item.key));

    const selectedKeyControlled = computed(() => props.selectedKey !== undefined);
    const colorControlled = computed(() => props.value !== undefined);

    const initialKeyFromValue = (() => {
      const normalized = tryParseColor(props.defaultValue ?? undefined);
      if (!normalized) {
        return null;
      }

      const item = items.value.find((entry) => entry.color === normalized);
      return item?.key ?? null;
    })();

    const uncontrolledSelectedKey = ref<string | null>(
      props.defaultSelectedKey ?? initialKeyFromValue
    );

    watch(
      () => props.defaultSelectedKey,
      (nextValue) => {
        if (!selectedKeyControlled.value && !colorControlled.value) {
          uncontrolledSelectedKey.value = nextValue ?? null;
        }
      }
    );

    watch(
      () => props.defaultValue,
      (nextValue) => {
        if (!selectedKeyControlled.value && !colorControlled.value) {
          const normalized = tryParseColor(nextValue ?? undefined);
          const item = normalized
            ? items.value.find((entry) => entry.color === normalized)
            : undefined;
          uncontrolledSelectedKey.value = item?.key ?? null;
        }
      }
    );

    const selectedKey = computed<string | null>(() => {
      if (selectedKeyControlled.value) {
        return props.selectedKey ?? null;
      }

      if (colorControlled.value) {
        const normalized = tryParseColor(props.value ?? undefined);
        if (!normalized) {
          return null;
        }

        const item = items.value.find((entry) => entry.color === normalized);
        return item?.key ?? null;
      }

      return uncontrolledSelectedKey.value;
    });

    const focusIndex = ref(getIndexFromKey(itemKeys.value, selectedKey.value));

    watch(
      selectedKey,
      (nextKey) => {
        focusIndex.value = getIndexFromKey(itemKeys.value, nextKey);
      }
    );

    const setSelected = (key: string) => {
      if (!selectedKeyControlled.value && !colorControlled.value) {
        uncontrolledSelectedKey.value = key;
      }

      const item = items.value.find((entry) => entry.key === key);
      if (item) {
        props.onChange?.(item.color);
      }

      props.onSelectionChange?.(key);
    };

    const moveFocus = (delta: number) => {
      if (itemKeys.value.length === 0) {
        return;
      }

      const current = focusIndex.value < 0 ? 0 : focusIndex.value;
      const next = (current + delta + itemKeys.value.length) % itemKeys.value.length;
      focusIndex.value = next;

      const option = rootRef.value?.querySelector<HTMLElement>(`[data-color-index="${next}"]`);
      option?.focus();
    };

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
      focus: () => {
        const index = focusIndex.value < 0 ? 0 : focusIndex.value;
        const option = rootRef.value?.querySelector<HTMLElement>(`[data-color-index="${index}"]`);
        option?.focus();
      },
    });

    return () => {
      const domProps = filterDOMProps(attrs as Record<string, unknown>, {
        labelable: true,
      });
      const { styleProps } = useStyleProps({
        isHidden: props.isHidden,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      });

      return h(
        "div",
        mergeProps(domProps, {
          ref: (value: unknown) => {
            rootRef.value = value as HTMLElement | null;
          },
          role: "listbox",
          "aria-label": props["aria-label"] ?? props.ariaLabel ?? props.label ?? "Color swatches",
          "aria-labelledby": props["aria-labelledby"] ?? props.ariaLabelledby,
          "aria-describedby": props["aria-describedby"] ?? props.ariaDescribedby,
          class: classNames(
            "react-spectrum-ColorSwatchPicker",
            {
              "is-disabled": Boolean(props.isDisabled),
            },
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined
          ),
          style: {
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            ...(styleProps.style as Record<string, unknown> | undefined),
          },
          hidden: styleProps.hidden,
        }),
        items.value.map((item, index) => {
          const isSelected = selectedKey.value === item.key;
          const isFocused = focusIndex.value === index;

          return h(
            "div",
            {
              key: item.key,
              role: "option",
              tabindex: isFocused ? 0 : -1,
              "data-color-index": String(index),
              "aria-selected": isSelected ? "true" : "false",
              "aria-disabled":
                props.isDisabled || item.isDisabled ? "true" : undefined,
              class: classNames("react-spectrum-ColorSwatchPicker-item", {
                "is-selected": isSelected,
                "is-focused": isFocused,
                "is-disabled": Boolean(props.isDisabled) || Boolean(item.isDisabled),
              }),
              onFocus: () => {
                focusIndex.value = index;
              },
              onClick: () => {
                if (props.isDisabled || item.isDisabled) {
                  return;
                }
                setSelected(item.key);
              },
              onKeydown: (event: KeyboardEvent) => {
                if (props.isDisabled || item.isDisabled) {
                  return;
                }

                if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                  event.preventDefault();
                  moveFocus(1);
                  return;
                }

                if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                  event.preventDefault();
                  moveFocus(-1);
                  return;
                }

                if (event.key === "Home") {
                  event.preventDefault();
                  focusIndex.value = 0;
                  const option = rootRef.value?.querySelector<HTMLElement>("[data-color-index=\"0\"]");
                  option?.focus();
                  return;
                }

                if (event.key === "End") {
                  event.preventDefault();
                  const endIndex = itemKeys.value.length - 1;
                  focusIndex.value = endIndex;
                  const option = rootRef.value?.querySelector<HTMLElement>(
                    `[data-color-index="${endIndex}"]`
                  );
                  option?.focus();
                  return;
                }

                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelected(item.key);
                }
              },
            },
            [
              h(ColorSwatch as any, {
                color: item.color,
                label: item.label,
                "aria-label": item.label ?? toColorLabel(item.color),
                isDisabled: props.isDisabled || item.isDisabled,
              }),
            ]
          );
        })
      );
    };
  },
});
