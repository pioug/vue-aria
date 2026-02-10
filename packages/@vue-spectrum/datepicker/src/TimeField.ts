import { computed, defineComponent, h, ref, watch } from "vue";
import { useId } from "@vue-aria/ssr";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import {
  classNames,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import { timeFieldPropOptions } from "./types";
import { formatTimeValue, parseTimeValue } from "./utils";

export const TimeField = defineComponent({
  name: "TimeField",
  inheritAttrs: false,
  props: {
    ...timeFieldPropOptions,
  },
  setup(props, { attrs, expose }) {
    const rootRef = ref<HTMLElement | null>(null);
    const inputRef = ref<HTMLInputElement | null>(null);
    const labelId = useId(undefined, "v-spectrum-timefield-label");
    const descriptionId = useId(undefined, "v-spectrum-timefield-description");
    const errorId = useId(undefined, "v-spectrum-timefield-error");

    const isControlled = computed(() => props.value !== undefined);
    const uncontrolledValue = ref(props.defaultValue ?? null);

    watch(
      () => props.defaultValue,
      (nextValue) => {
        if (!isControlled.value) {
          uncontrolledValue.value = nextValue ?? null;
        }
      }
    );

    const currentValue = computed(() =>
      isControlled.value ? props.value ?? null : uncontrolledValue.value
    );
    const inputValue = computed(() =>
      formatTimeValue(currentValue.value, props.granularity)
    );

    const ariaLabel = computed(
      () => props["aria-label"] ?? props.ariaLabel
    );
    const ariaLabelledBy = computed(
      () =>
        props["aria-labelledby"] ??
        props.ariaLabelledby ??
        (props.label ? labelId.value : undefined)
    );
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

    const inputStep = computed(() => {
      if (props.granularity === "hour") {
        return 3600;
      }
      if (props.granularity === "second") {
        return 1;
      }
      return 60;
    });

    const setValue = (rawValue: string) => {
      const nextValue = parseTimeValue(rawValue, props.granularity);
      if (!isControlled.value) {
        uncontrolledValue.value = nextValue;
      }

      props.onChange?.(nextValue);
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
            "react-spectrum-TimeField",
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
          h("input", {
            ref: (value: unknown) => {
              inputRef.value = value as HTMLInputElement | null;
            },
            type: "time",
            value: inputValue.value,
            step: inputStep.value,
            disabled: props.isDisabled,
            readonly: props.isReadOnly,
            required: props.isRequired,
            autofocus: props.autoFocus,
            name: props.name,
            form: props.form,
            "aria-label": ariaLabel.value,
            "aria-labelledby": ariaLabelledBy.value,
            "aria-describedby": describedBy.value,
            "aria-invalid":
              Boolean(props.isInvalid) || props.validationState === "invalid"
                ? "true"
                : undefined,
            class: classNames("react-spectrum-TimeField-input"),
            onInput: (event: Event) => {
              if (props.isDisabled || props.isReadOnly) {
                return;
              }

              const target = event.target as HTMLInputElement | null;
              setValue(target?.value ?? "");
            },
          }),
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
