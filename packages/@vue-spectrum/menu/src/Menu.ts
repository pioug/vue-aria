import {
  computed,
  defineComponent,
  h,
  nextTick,
  ref,
  watch,
  type PropType,
} from "vue";
import { filterDOMProps } from "@vue-aria/utils";
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";
import { MenuItem } from "./MenuItem";
import {
  areSetsEqual,
  keyToString,
  normalizeKeySet,
  type MenuKey,
  type SpectrumMenuBaseProps,
  type SpectrumMenuItemData,
  type SpectrumMenuSelectionMode,
} from "./types";

export interface SpectrumMenuProps extends SpectrumMenuBaseProps {
  id?: string | undefined;
}

export const Menu = defineComponent({
  name: "Menu",
  inheritAttrs: false,
  props: {
    id: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    items: {
      type: Array as PropType<SpectrumMenuItemData[] | undefined>,
      default: undefined,
    },
    selectionMode: {
      type: String as PropType<SpectrumMenuSelectionMode | undefined>,
      default: undefined,
    },
    selectedKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<MenuKey> | undefined>,
      default: undefined,
    },
    defaultSelectedKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<MenuKey> | undefined>,
      default: undefined,
    },
    disabledKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<MenuKey> | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    closeOnSelect: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    shouldFocusWrap: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    autoFocus: {
      type: [Boolean, String] as PropType<true | "first" | "last" | undefined>,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<((key: MenuKey) => void) | undefined>,
      default: undefined,
    },
    onSelectionChange: {
      type: Function as PropType<((keys: Set<MenuKey>) => void) | undefined>,
      default: undefined,
    },
    onClose: {
      type: Function as PropType<(() => void) | undefined>,
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
    const rootRef = ref<HTMLUListElement | null>(null);
    const itemRefs = new Map<string, HTMLLIElement>();

    const items = computed<SpectrumMenuItemData[]>(() => props.items ?? []);
    const selectionMode = computed<SpectrumMenuSelectionMode>(
      () => props.selectionMode ?? "none"
    );

    const keyMap = computed(() => {
      const map = new Map<string, MenuKey>();
      for (const item of items.value) {
        map.set(String(item.key), item.key);
      }
      return map;
    });

    const disabledKeys = computed(() => normalizeKeySet(props.disabledKeys));
    const isItemDisabled = (item: SpectrumMenuItemData): boolean =>
      Boolean(props.isDisabled || item.isDisabled || disabledKeys.value.has(String(item.key)));

    const uncontrolledSelectedKeys = ref<Set<string>>(
      normalizeKeySet(props.defaultSelectedKeys)
    );

    const selectedKeys = computed<Set<string>>(() =>
      props.selectedKeys !== undefined
        ? normalizeKeySet(props.selectedKeys)
        : uncontrolledSelectedKeys.value
    );

    const focusedKey = ref<string | null>(null);

    const enabledKeys = computed(() =>
      items.value
        .filter((item) => !isItemDisabled(item))
        .map((item) => String(item.key))
    );

    const setFocusedKey = (key: string | null, shouldMoveFocus = true) => {
      focusedKey.value = key;
      if (!shouldMoveFocus || !key) {
        return;
      }

      void nextTick(() => {
        itemRefs.get(key)?.focus();
      });
    };

    const getNextKey = (offset: 1 | -1): string | null => {
      const keys = enabledKeys.value;
      if (keys.length === 0) {
        return null;
      }

      const currentIndex = focusedKey.value ? keys.indexOf(focusedKey.value) : -1;
      if (currentIndex === -1) {
        return keys[0] ?? null;
      }

      const nextIndex = currentIndex + offset;
      if (nextIndex < 0 || nextIndex >= keys.length) {
        if (!props.shouldFocusWrap) {
          return keys[currentIndex] ?? null;
        }

        return keys[(nextIndex + keys.length) % keys.length] ?? null;
      }

      return keys[nextIndex] ?? null;
    };

    const emitSelectionChange = (nextSelection: Set<string>) => {
      if (areSetsEqual(nextSelection, selectedKeys.value)) {
        return;
      }

      if (props.selectedKeys === undefined) {
        uncontrolledSelectedKeys.value = nextSelection;
      }

      const externalKeys = new Set<MenuKey>();
      for (const key of nextSelection) {
        externalKeys.add(keyMap.value.get(key) ?? key);
      }

      props.onSelectionChange?.(externalKeys);
    };

    const shouldCloseOnSelect = computed(() => {
      if (props.closeOnSelect !== undefined) {
        return props.closeOnSelect;
      }

      return selectionMode.value !== "multiple";
    });

    const activateKey = (key: string | null) => {
      if (!key) {
        return;
      }

      const item = items.value.find((candidate) => String(candidate.key) === key);
      if (!item || isItemDisabled(item)) {
        return;
      }

      if (selectionMode.value === "single") {
        emitSelectionChange(new Set([key]));
      }

      if (selectionMode.value === "multiple") {
        const next = new Set(selectedKeys.value);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        emitSelectionChange(next);
      }

      props.onAction?.(item.key);

      if (shouldCloseOnSelect.value) {
        props.onClose?.();
      }
    };

    watch(
      items,
      () => {
        if (selectionMode.value === "none") {
          return;
        }

        const validKeys = new Set(items.value.map((item) => String(item.key)));
        const next = new Set<string>();

        for (const key of selectedKeys.value) {
          if (validKeys.has(key)) {
            next.add(key);
          }
        }

        if (!areSetsEqual(next, selectedKeys.value)) {
          emitSelectionChange(next);
        }
      },
      { immediate: true }
    );

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

        const autoFocus = props.autoFocus;
        if (autoFocus === "last") {
          focusedKey.value = keys[keys.length - 1] ?? null;
          return;
        }

        focusedKey.value = keys[0] ?? null;
      },
      { immediate: true }
    );

    watch(
      () => props.autoFocus,
      (autoFocus) => {
        if (!autoFocus) {
          return;
        }

        const keys = enabledKeys.value;
        if (keys.length === 0) {
          return;
        }

        const targetKey =
          autoFocus === "last" ? keys[keys.length - 1] ?? null : keys[0] ?? null;
        setFocusedKey(targetKey, true);
      },
      { immediate: true }
    );

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
      focus: () => {
        if (!focusedKey.value) {
          return;
        }

        itemRefs.get(focusedKey.value)?.focus();
      },
    });

    return () => {
      const attrsRecord = attrs as Record<string, unknown>;
      const styleInput = {
        ...attrsRecord,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      } as Record<string, unknown>;
      const { styleProps } = useStyleProps(styleInput);
      const domProps = filterDOMProps(attrsRecord, { labelable: false });

      const ariaLabel =
        props.ariaLabel ??
        props["aria-label"] ??
        (attrsRecord["aria-label"] as string | undefined);
      const ariaLabelledby =
        props.ariaLabelledby ??
        props["aria-labelledby"] ??
        (attrsRecord["aria-labelledby"] as string | undefined);

      return h(
        "ul",
        {
          ...domProps,
          id: props.id,
          ref: (value: unknown) => {
            rootRef.value = value as HTMLUListElement | null;
          },
          role: "menu",
          tabIndex: 0,
          "aria-label": ariaLabel,
          "aria-labelledby": ariaLabelledby,
          class: classNames(
            "spectrum-Menu",
            styleProps.class as ClassValue | undefined,
            domProps.class as ClassValue | undefined,
            props.UNSAFE_className as ClassValue | undefined
          ),
          style: {
            ...(styleProps.style ?? {}),
            ...(props.UNSAFE_style ?? {}),
          },
          onFocus: (event: FocusEvent) => {
            if (event.target !== rootRef.value) {
              return;
            }

            if (!focusedKey.value) {
              setFocusedKey(enabledKeys.value[0] ?? null);
              return;
            }

            setFocusedKey(focusedKey.value);
          },
          onKeydown: (event: KeyboardEvent) => {
            switch (event.key) {
              case "ArrowDown":
                event.preventDefault();
                setFocusedKey(getNextKey(1));
                break;
              case "ArrowUp":
                event.preventDefault();
                setFocusedKey(getNextKey(-1));
                break;
              case "Home":
                event.preventDefault();
                setFocusedKey(enabledKeys.value[0] ?? null);
                break;
              case "End":
                event.preventDefault();
                setFocusedKey(enabledKeys.value[enabledKeys.value.length - 1] ?? null);
                break;
              case "Enter":
              case " ":
                event.preventDefault();
                activateKey(focusedKey.value);
                break;
              case "Escape":
                event.preventDefault();
                props.onClose?.();
                break;
              default:
                break;
            }
          },
        },
        items.value.map((item) => {
          const itemKey = keyToString(item.key) ?? "";

          return h(MenuItem, {
            key: itemKey,
            ref: (value: unknown) => {
              if (!value) {
                itemRefs.delete(itemKey);
                return;
              }

              const element = (value as { $el?: unknown }).$el as
                | HTMLLIElement
                | undefined;
              if (element) {
                itemRefs.set(itemKey, element);
              }
            },
            item,
            selectionMode: selectionMode.value,
            isSelected: selectedKeys.value.has(itemKey),
            isFocused: focusedKey.value === itemKey,
            isDisabled: isItemDisabled(item),
            tabIndex: focusedKey.value === itemKey ? 0 : -1,
            onFocus: () => {
              focusedKey.value = itemKey;
            },
            onHover: () => {
              focusedKey.value = itemKey;
            },
            onAction: () => {
              activateKey(itemKey);
            },
          });
        })
      );
    };
  },
});
