import { computed, defineComponent, h, ref, watch } from "vue";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { useId } from "@vue-aria/ssr";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import {
  classNames,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import { ColorSwatch } from "./ColorSwatch";
import { colorFieldPropOptions } from "./types";
import { parseColor, tryParseColor } from "./utils";

const COLORFIELD_INTL_MESSAGES = {
  "en-US": {
    selectedColor: "Selected color",
  },
  "fr-FR": {
    selectedColor: "Couleur sélectionnée",
  },
} as const;

export const ColorField = defineComponent({
  name: "ColorField",
  inheritAttrs: false,
  props: {
    ...colorFieldPropOptions,
  },
  setup(props, { attrs, expose }) {
    const stringFormatter = useLocalizedStringFormatter(
      COLORFIELD_INTL_MESSAGES,
      "@vue-spectrum/color"
    );
    const rootRef = ref<HTMLElement | null>(null);
    const inputRef = ref<HTMLInputElement | null>(null);
    const labelId = useId(undefined, "v-spectrum-colorfield-label");
    const descriptionId = useId(undefined, "v-spectrum-colorfield-description");
    const errorId = useId(undefined, "v-spectrum-colorfield-error");

    const isControlled = computed(() => props.value !== undefined);

    const normalizeOrNull = (value: string | null | undefined) => {
      if (!value) {
        return null;
      }

      try {
        return parseColor(value);
      } catch {
        return null;
      }
    };

    const uncontrolledValue = ref<string | null>(normalizeOrNull(props.defaultValue));

    watch(
      () => props.defaultValue,
      (nextValue) => {
        if (!isControlled.value) {
          uncontrolledValue.value = normalizeOrNull(nextValue);
        }
      }
    );

    const resolvedValue = computed<string | null>(() => {
      if (isControlled.value) {
        return normalizeOrNull(props.value);
      }

      return uncontrolledValue.value;
    });

    const draftValue = ref<string>(resolvedValue.value ?? "");

    watch(resolvedValue, (nextValue) => {
      draftValue.value = nextValue ?? "";
    });

    const describedBy = computed(() => {
      const explicit = props["aria-describedby"] ?? props.ariaDescribedby;
      if (explicit) {
        return explicit;
      }

      const ids = [
        props.description ? descriptionId.value : undefined,
        props.errorMessage ? errorId.value : undefined,
      ].filter(Boolean);
      return ids.join(" ") || undefined;
    });

    const commitValue = () => {
      const parsed = tryParseColor(draftValue.value);

      if (!isControlled.value) {
        uncontrolledValue.value = parsed;
      }

      draftValue.value = parsed ?? "";
      props.onChange?.(parsed);
    };

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
      focus: () => {
        inputRef.value?.focus();
      },
      blur: () => {
        inputRef.value?.blur();
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
            "react-spectrum-ColorField",
            {
              "is-disabled": Boolean(props.isDisabled),
              "is-invalid":
                Boolean(props.isInvalid) || props.validationState === "invalid",
            },
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined
          ),
          style: styleProps.style,
          hidden: styleProps.hidden,
        }),
        [
          props.label
            ? h(
                "label",
                {
                  id: labelId.value,
                  class: classNames("spectrum-FieldLabel"),
                },
                props.label
              )
            : null,
          h("div", { class: classNames("react-spectrum-ColorField-inputGroup") }, [
            h(ColorSwatch as any, {
              color: resolvedValue.value ?? "#000000",
              label: stringFormatter.value.format("selectedColor"),
              size: "M",
            }),
            h("input", {
              ref: (value: unknown) => {
                inputRef.value = value as HTMLInputElement | null;
              },
              id: props.id,
              type: "text",
              role: "textbox",
              value: draftValue.value,
              placeholder: props.placeholder,
              disabled: props.isDisabled,
              readonly: props.isReadOnly,
              required: props.isRequired,
              autofocus: props.autoFocus,
              name: props.name,
              form: props.form,
              autocomplete: "off",
              autocorrect: "off",
              spellcheck: "false",
              "aria-label": props["aria-label"] ?? props.ariaLabel,
              "aria-labelledby":
                props["aria-labelledby"] ??
                props.ariaLabelledby ??
                (props.label ? labelId.value : undefined),
              "aria-describedby": describedBy.value,
              "aria-invalid":
                Boolean(props.isInvalid) || props.validationState === "invalid"
                  ? "true"
                  : undefined,
              class: classNames("react-spectrum-ColorField-input"),
              onInput: (event: Event) => {
                const target = event.target as HTMLInputElement | null;
                draftValue.value = target?.value ?? "";
              },
              onBlur: () => {
                commitValue();
              },
              onKeydown: (event: KeyboardEvent) => {
                if (event.key === "Enter") {
                  commitValue();
                }
              },
            }),
          ]),
          props.description
            ? h(
                "div",
                {
                  id: descriptionId.value,
                  class: classNames("spectrum-FieldDescription"),
                },
                props.description
              )
            : null,
          props.errorMessage
            ? h(
                "div",
                {
                  id: errorId.value,
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
