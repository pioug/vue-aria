import {
  computed,
  defineComponent,
  h,
  ref,
  type PropType,
} from "vue";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { useSeparator } from "@vue-aria/separator";
import {
  classNames,
  useSlotProps,
  type ClassValue,
} from "@vue-spectrum/utils";

const SIZE_TO_WEIGHT = {
  S: "small",
  M: "medium",
  L: "large",
} as const;

export type DividerSize = keyof typeof SIZE_TO_WEIGHT;
export type DividerOrientation = "horizontal" | "vertical";

export interface SpectrumDividerProps {
  size?: DividerSize | undefined;
  orientation?: DividerOrientation | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const Divider = defineComponent({
  name: "Divider",
  inheritAttrs: false,
  props: {
    size: {
      type: String as PropType<DividerSize>,
      default: "L",
    },
    orientation: {
      type: String as PropType<DividerOrientation>,
      default: "horizontal",
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
  setup(props, { attrs, slots, expose }) {
    const elementRef = ref<HTMLElement | null>(null);

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
    });

    const mergedProps = computed<Record<string, unknown>>(() =>
      useSlotProps(
        {
          ...(attrs as Record<string, unknown>),
          size: props.size,
          orientation: props.orientation,
          slot: props.slot,
          UNSAFE_className: props.UNSAFE_className,
          UNSAFE_style: props.UNSAFE_style,
        } as Record<string, unknown> & { slot?: string; id?: string },
        "divider"
      )
    );

    const size = computed<DividerSize>(() => {
      const currentSize = mergedProps.value.size;
      return currentSize === "S" || currentSize === "M" ? currentSize : "L";
    });

    const orientation = computed<DividerOrientation>(() =>
      mergedProps.value.orientation === "vertical" ? "vertical" : "horizontal"
    );

    const elementType = computed<"hr" | "div">(() =>
      orientation.value === "vertical" ? "div" : "hr"
    );

    const { separatorProps } = useSeparator({
      orientation,
      elementType,
      id: computed(() => asString(mergedProps.value.id)),
      "aria-label": computed(() => asString(mergedProps.value["aria-label"])),
      "aria-labelledby": computed(() =>
        asString(mergedProps.value["aria-labelledby"])
      ),
    });

    return () => {
      const forwardedProps = { ...mergedProps.value };
      delete forwardedProps.size;
      delete forwardedProps.orientation;
      delete forwardedProps.slot;
      delete forwardedProps.UNSAFE_className;
      delete forwardedProps.UNSAFE_style;

      const domProps = filterDOMProps(forwardedProps as Record<string, unknown>);
      const className = classNames(
        "spectrum-Rule",
        `spectrum-Rule--${SIZE_TO_WEIGHT[size.value]}`,
        {
          "spectrum-Rule--vertical": orientation.value === "vertical",
          "spectrum-Rule--horizontal": orientation.value === "horizontal",
        },
        mergedProps.value.UNSAFE_className as ClassValue | undefined,
        domProps.class as ClassValue | undefined
      );

      const elementProps = mergeProps(domProps, separatorProps.value, {
        class: className,
        style: mergedProps.value.UNSAFE_style as
          | Record<string, string | number>
          | undefined,
        ref: elementRef,
      });

      return h(elementType.value, elementProps, slots.default?.());
    };
  },
});
