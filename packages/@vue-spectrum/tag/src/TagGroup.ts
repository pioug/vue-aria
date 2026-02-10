import {
  computed,
  defineComponent,
  h,
  ref,
  watch,
  type PropType,
} from "vue";
import { useLocale } from "@vue-aria/i18n";
import { filterDOMProps } from "@vue-aria/utils";
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";
import {
  Tag,
  type SpectrumTagItemData,
  type TagKey,
} from "./Tag";

export interface SpectrumTagGroupProps {
  id?: string | undefined;
  items?: SpectrumTagItemData[] | undefined;
  disabledKeys?: Iterable<TagKey> | undefined;
  isDisabled?: boolean | undefined;
  allowsRemoving?: boolean | undefined;
  direction?: "ltr" | "rtl" | undefined;
  onRemove?: ((keys: Set<TagKey>) => void) | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  emptyStateLabel?: string | undefined;
  removeButtonLabel?: string | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

function normalizeKeySet(keys: Iterable<TagKey> | undefined): Set<string> {
  if (!keys) {
    return new Set<string>();
  }

  return new Set(Array.from(keys, (key) => String(key)));
}

function keyToString(key: TagKey | undefined): string | undefined {
  if (key === undefined || key === null) {
    return undefined;
  }

  return String(key);
}

export const TagGroup = defineComponent({
  name: "TagGroup",
  inheritAttrs: false,
  props: {
    id: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    items: {
      type: Array as PropType<SpectrumTagItemData[] | undefined>,
      default: undefined,
    },
    disabledKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<TagKey> | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    allowsRemoving: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    direction: {
      type: String as PropType<"ltr" | "rtl" | undefined>,
      default: undefined,
    },
    onRemove: {
      type: Function as PropType<((keys: Set<TagKey>) => void) | undefined>,
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
    "aria-label": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    "aria-labelledby": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    emptyStateLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    removeButtonLabel: {
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
  setup(props, { attrs, expose }) {
    const locale = useLocale();
    const rootRef = ref<HTMLDivElement | null>(null);
    const rowRefs = new Map<string, HTMLDivElement>();
    const removedKeys = ref(new Set<string>());
    const focusedKey = ref<string | null>(null);

    const disabledKeys = computed(() => normalizeKeySet(props.disabledKeys));

    const items = computed(() => {
      const source = props.items ?? [];
      return source.filter((item) => !removedKeys.value.has(String(item.key)));
    });

    const keyMap = computed(() => {
      const map = new Map<string, TagKey>();
      for (const item of items.value) {
        map.set(String(item.key), item.key);
      }

      return map;
    });

    const isItemDisabled = (item: SpectrumTagItemData): boolean =>
      Boolean(props.isDisabled || item.isDisabled || disabledKeys.value.has(String(item.key)));

    const enabledKeys = computed(() =>
      items.value
        .filter((item) => !isItemDisabled(item))
        .map((item) => String(item.key))
    );

    const focusKey = (key: string | null) => {
      if (!key) {
        return;
      }

      focusedKey.value = key;
      rowRefs.get(key)?.focus();
    };

    const moveFocus = (offset: 1 | -1) => {
      const keys = enabledKeys.value;
      if (keys.length === 0) {
        return;
      }

      const current = focusedKey.value;
      const currentIndex = current ? keys.indexOf(current) : -1;
      const baseIndex = currentIndex >= 0 ? currentIndex : 0;
      const nextIndex = (baseIndex + offset + keys.length) % keys.length;
      focusKey(keys[nextIndex] ?? null);
    };

    watch(
      enabledKeys,
      (keys) => {
        if (keys.length === 0) {
          focusedKey.value = null;
          return;
        }

        if (focusedKey.value && keys.includes(focusedKey.value)) {
          return;
        }

        focusedKey.value = keys[0] ?? null;
      },
      { immediate: true }
    );

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
    });

    const removeKey = (itemKey: string) => {
      const originalKey = keyMap.value.get(itemKey) ?? itemKey;
      const next = new Set<TagKey>([originalKey]);

      props.onRemove?.(next);

      removedKeys.value = new Set([...removedKeys.value, itemKey]);
    };

    return () => {
      const attrsRecord = attrs as Record<string, unknown>;
      const styleInput = {
        ...attrsRecord,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      } as Record<string, unknown>;
      const { styleProps } = useStyleProps(styleInput);
      const domProps = filterDOMProps(attrsRecord, { labelable: false });

      const direction = props.direction ?? locale.value.direction;
      const ariaLabel =
        props.ariaLabel ??
        props["aria-label"] ??
        (attrsRecord["aria-label"] as string | undefined);
      const ariaLabelledby =
        props.ariaLabelledby ??
        props["aria-labelledby"] ??
        (attrsRecord["aria-labelledby"] as string | undefined);

      const visibleItems = items.value;

      return h(
        "div",
        {
          ...domProps,
          id: props.id,
          ref: (value: unknown) => {
            rootRef.value = value as HTMLDivElement | null;
          },
          class: classNames(
            "spectrum-Tags-container",
            {
              "spectrum-Tags-container--empty": visibleItems.length === 0,
            },
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined,
            props.UNSAFE_className as ClassValue | undefined
          ),
          style: {
            ...(styleProps.style ?? {}),
            ...(props.UNSAFE_style ?? {}),
          },
        },
        [
          h(
            "div",
            {
              role: "grid",
              class: classNames("spectrum-Tags"),
              "aria-label": ariaLabel,
              "aria-labelledby": ariaLabelledby,
            },
            visibleItems.length === 0
              ? [
                  h(
                    "div",
                    {
                      class: classNames("spectrum-Tags-empty-state"),
                    },
                    props.emptyStateLabel ?? "No tags"
                  ),
                ]
              : visibleItems.map((item) => {
                  const itemKey = keyToString(item.key) ?? "";
                  const disabled = isItemDisabled(item);

                  return h(Tag, {
                    key: itemKey,
                    ref: (value: unknown) => {
                      if (!value) {
                        rowRefs.delete(itemKey);
                        return;
                      }

                      const element = (value as { $el?: unknown }).$el as
                        | HTMLDivElement
                        | undefined;
                      if (element) {
                        rowRefs.set(itemKey, element);
                      }
                    },
                    item,
                    tabIndex: focusedKey.value === itemKey ? 0 : -1,
                    isFocused: focusedKey.value === itemKey,
                    isDisabled: disabled,
                    allowsRemoving: props.allowsRemoving,
                    removeButtonLabel: props.removeButtonLabel,
                    onFocus: () => {
                      focusedKey.value = itemKey;
                    },
                    onKeydown: (event: KeyboardEvent) => {
                      const key = event.key;

                      if ((key === "Delete" || key === "Backspace") && !disabled) {
                        if (props.allowsRemoving) {
                          event.preventDefault();
                          removeKey(itemKey);
                        }
                        return;
                      }

                      let handled = true;
                      switch (key) {
                        case "ArrowRight":
                          moveFocus(direction === "rtl" ? -1 : 1);
                          break;
                        case "ArrowLeft":
                          moveFocus(direction === "rtl" ? 1 : -1);
                          break;
                        case "ArrowDown":
                          moveFocus(1);
                          break;
                        case "ArrowUp":
                          moveFocus(-1);
                          break;
                        case "Home":
                        case "PageUp":
                          focusKey(enabledKeys.value[0] ?? null);
                          break;
                        case "End":
                        case "PageDown":
                          focusKey(enabledKeys.value[enabledKeys.value.length - 1] ?? null);
                          break;
                        default:
                          handled = false;
                          break;
                      }

                      if (!handled) {
                        return;
                      }

                      event.preventDefault();
                    },
                    onRemove: () => {
                      if (!disabled && props.allowsRemoving) {
                        removeKey(itemKey);
                      }
                    },
                  });
                })
          ),
        ]
      );
    };
  },
});
