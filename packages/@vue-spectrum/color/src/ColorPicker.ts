import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import {
  classNames,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import { ColorEditor } from "./ColorEditor";
import { ColorSwatch } from "./ColorSwatch";
import { colorPickerPropOptions } from "./types";
import { parseColor, tryParseColor } from "./utils";

const COLORPICKER_INTL_MESSAGES = {
  "en-US": {
    selectedColor: "Selected color",
  },
  "fr-FR": {
    selectedColor: "Couleur sélectionnée",
  },
} as const;

export const ColorPicker = defineComponent({
  name: "ColorPicker",
  inheritAttrs: false,
  props: {
    ...colorPickerPropOptions,
  },
  setup(props, { attrs, expose, slots }) {
    const stringFormatter = useLocalizedStringFormatter(
      COLORPICKER_INTL_MESSAGES,
      "@vue-spectrum/color"
    );
    const rootRef = ref<HTMLElement | null>(null);
    const buttonRef = ref<HTMLButtonElement | null>(null);

    const normalizeColor = (value: string | null | undefined): string => {
      const parsed = tryParseColor(value ?? "");
      return parsed ?? "#000000";
    };

    const isColorControlled = computed(() => props.value !== undefined);
    const uncontrolledColor = ref<string>(normalizeColor(props.defaultValue));

    watch(
      () => props.defaultValue,
      (nextValue) => {
        if (!isColorControlled.value) {
          uncontrolledColor.value = normalizeColor(nextValue);
        }
      }
    );

    const currentColor = computed(() =>
      isColorControlled.value
        ? normalizeColor(props.value)
        : normalizeColor(uncontrolledColor.value)
    );

    const isOpenControlled = computed(() => props.isOpen !== undefined);
    const uncontrolledOpen = ref<boolean>(Boolean(props.defaultOpen));

    watch(
      () => props.defaultOpen,
      (nextOpen) => {
        if (!isOpenControlled.value) {
          uncontrolledOpen.value = Boolean(nextOpen);
        }
      }
    );

    const isOpen = computed(() =>
      isOpenControlled.value ? Boolean(props.isOpen) : uncontrolledOpen.value
    );

    const setOpen = (nextOpen: boolean) => {
      if (!isOpenControlled.value) {
        uncontrolledOpen.value = nextOpen;
      }

      props.onOpenChange?.(nextOpen);
    };

    const setColor = (nextColor: string) => {
      const normalized = parseColor(nextColor);
      if (!isColorControlled.value) {
        uncontrolledColor.value = normalized;
      }

      props.onChange?.(normalized);
    };

    const onDocumentMouseDown = (event: MouseEvent) => {
      if (!isOpen.value) {
        return;
      }

      const target = event.target as Node | null;
      if (!target) {
        return;
      }

      if (rootRef.value?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    const onDocumentKeydown = (event: KeyboardEvent) => {
      if (!isOpen.value) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        buttonRef.value?.focus();
      }
    };

    onMounted(() => {
      if (typeof document !== "undefined") {
        document.addEventListener("mousedown", onDocumentMouseDown, true);
        document.addEventListener("keydown", onDocumentKeydown, true);
      }
    });

    onBeforeUnmount(() => {
      if (typeof document !== "undefined") {
        document.removeEventListener("mousedown", onDocumentMouseDown, true);
        document.removeEventListener("keydown", onDocumentKeydown, true);
      }
    });

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
      focus: () => {
        buttonRef.value?.focus();
      },
      open: () => {
        setOpen(true);
      },
      close: () => {
        setOpen(false);
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
          class: classNames(
            "react-spectrum-ColorPicker",
            {
              "is-open": isOpen.value,
              "is-disabled": Boolean(props.isDisabled),
            },
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined
          ),
          style: {
            display: "grid",
            gap: "8px",
            ...(styleProps.style as Record<string, unknown> | undefined),
          },
          hidden: styleProps.hidden,
        }),
        [
          props.label
            ? h(
                "label",
                {
                  class: classNames("spectrum-FieldLabel"),
                },
                props.label
              )
            : null,
          h(
            "button",
            {
              ref: (value: unknown) => {
                buttonRef.value = value as HTMLButtonElement | null;
              },
              type: "button",
              disabled: props.isDisabled,
              class: classNames("react-spectrum-ColorPicker-button"),
              "aria-haspopup": "dialog",
              "aria-expanded": isOpen.value ? "true" : "false",
              "aria-label": props["aria-label"] ?? props.ariaLabel ?? props.label,
              "aria-labelledby": props["aria-labelledby"] ?? props.ariaLabelledby,
              "aria-describedby": props["aria-describedby"] ?? props.ariaDescribedby,
              onClick: () => {
                if (props.isDisabled || props.isReadOnly) {
                  return;
                }

                setOpen(!isOpen.value);
              },
            },
            [
              h(ColorSwatch as any, {
                color: currentColor.value,
                label: stringFormatter.value.format("selectedColor"),
              }),
              h(
                "span",
                { class: classNames("react-spectrum-ColorPicker-buttonLabel") },
                props.label ?? currentColor.value
              ),
            ]
          ),
          isOpen.value
            ? h(
                "div",
                {
                  role: "dialog",
                  class: classNames("react-spectrum-ColorPicker-popover"),
                  style: {
                    border: "1px solid rgba(15, 23, 42, 0.15)",
                    borderRadius: "10px",
                    background: "white",
                    padding: "12px",
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
                  },
                },
                slots.default
                  ? slots.default({
                      color: currentColor.value,
                      onChange: setColor,
                    })
                  : [
                      h(ColorEditor as any, {
                        label: "Hex",
                        value: currentColor.value,
                        onChange: setColor,
                        isDisabled: props.isDisabled,
                        isReadOnly: props.isReadOnly,
                      }),
                    ]
              )
            : null,
          props.description
            ? h(
                "div",
                {
                  class: classNames("spectrum-FieldDescription"),
                },
                props.description
              )
            : null,
          props.errorMessage
            ? h(
                "div",
                {
                  class: classNames("spectrum-FieldError"),
                },
                props.errorMessage
              )
            : null,
        ]
      );
    };
  },
});
