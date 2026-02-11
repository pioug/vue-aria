import {
  Fragment,
  computed,
  defineComponent,
  h,
  isVNode,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type VNode,
  type VNodeChild,
  type PropType,
} from "vue";
import { useComboBox } from "@vue-aria/combobox";
import {
  useComboBoxState,
  type FilterFn,
  type FocusStrategy,
  type MenuTriggerAction,
} from "@vue-aria/combobox-state";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { useOption } from "@vue-aria/listbox";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import type { Key } from "@vue-aria/types";
import { ClearButton } from "@vue-spectrum/button";
import { ProgressCircle } from "@vue-spectrum/progress";
import {
  classNames,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import {
  searchAutocompletePropOptions,
  type SpectrumSearchAutocompleteItemProps,
  type SpectrumSearchAutocompleteItemData,
  type SpectrumSearchAutocompleteSectionProps,
} from "./types";

interface NormalizedSearchAutocompleteItem {
  key: Key;
  textValue?: string | undefined;
  label: string;
  isDisabled?: boolean | undefined;
  "aria-label"?: string | undefined;
  sectionKey?: Key | undefined;
}

interface NormalizedSearchAutocompleteItemEntry {
  type: "item";
  key: Key;
}

interface NormalizedSearchAutocompleteSectionEntry {
  type: "section";
  key: Key;
  title?: string | undefined;
  "aria-label"?: string | undefined;
  itemKeys: Key[];
}

type NormalizedSearchAutocompleteEntry =
  | NormalizedSearchAutocompleteItemEntry
  | NormalizedSearchAutocompleteSectionEntry;

interface NormalizedSearchAutocompleteSlotModel {
  items: NormalizedSearchAutocompleteItem[];
  entries: NormalizedSearchAutocompleteEntry[];
}

const DEFAULT_FILTER: FilterFn = (textValue, inputValue) =>
  textValue.toLowerCase().includes(inputValue.toLowerCase());

const PLACEHOLDER_DEPRECATION_WARNING =
  "Placeholders are deprecated due to accessibility issues. Please use help text instead.";
const searchAutocompleteMessages = {
  "en-US": {
    "Clear search": "Clear search",
  },
  "fr-FR": {
    "Clear search": "Effacer la recherche",
  },
} as const;

function normalizeSearchAutocompleteKey(value: unknown, fallback: Key): Key {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  return fallback;
}

function getComponentName(node: VNode): string | undefined {
  if (typeof node.type === "string") {
    return node.type;
  }

  if (typeof node.type === "symbol") {
    return undefined;
  }

  const componentType = node.type as { name?: string | undefined };
  return componentType.name;
}

function flattenVNodeChildren(input: unknown): VNode[] {
  if (input === null || input === undefined) {
    return [];
  }

  if (Array.isArray(input)) {
    return input.flatMap((entry) => flattenVNodeChildren(entry));
  }

  if (!isVNode(input)) {
    return [];
  }

  if (input.type === Fragment) {
    return flattenVNodeChildren(input.children);
  }

  return [input];
}

function getSlotChildren(node: VNode): VNode[] {
  if (Array.isArray(node.children)) {
    return flattenVNodeChildren(node.children);
  }

  if (node.children && typeof node.children === "object") {
    const maybeDefault = (node.children as { default?: (() => unknown) | undefined })
      .default;
    if (typeof maybeDefault === "function") {
      return flattenVNodeChildren(maybeDefault());
    }
  }

  return [];
}

function getSlotContent(node: VNode): VNodeChild | undefined {
  if (Array.isArray(node.children)) {
    return node.children as VNodeChild;
  }

  if (node.children && typeof node.children === "object") {
    const maybeDefault = (node.children as { default?: (() => unknown) | undefined })
      .default;
    if (typeof maybeDefault === "function") {
      return maybeDefault() as VNodeChild;
    }
  }

  if (typeof node.children === "string") {
    return node.children;
  }

  return undefined;
}

function extractTextContent(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => extractTextContent(entry)).join("");
  }

  if (isVNode(value)) {
    if (typeof value.children === "string") {
      return value.children;
    }

    if (Array.isArray(value.children)) {
      return extractTextContent(value.children);
    }

    if (value.children && typeof value.children === "object") {
      const maybeDefault = (value.children as { default?: (() => unknown) | undefined })
        .default;
      if (typeof maybeDefault === "function") {
        return extractTextContent(maybeDefault());
      }
    }
  }

  return "";
}

function parseSearchAutocompleteItemNode(
  node: VNode,
  fallback: Key,
  sectionKey?: Key
): NormalizedSearchAutocompleteItem {
  const props = (node.props ?? {}) as Record<string, unknown>;
  const labelFromSlot = extractTextContent(getSlotContent(node)).trim();
  const textValue =
    typeof props.textValue === "string" ? props.textValue : labelFromSlot;
  const resolvedLabel = textValue || String(fallback);

  return {
    key: normalizeSearchAutocompleteKey(node.key ?? props.id, fallback),
    label: resolvedLabel,
    textValue: resolvedLabel,
    isDisabled: Boolean(props.isDisabled),
    "aria-label":
      typeof props["aria-label"] === "string" ? props["aria-label"] : undefined,
    sectionKey,
  };
}

function parseSearchAutocompleteSlotItems(
  nodes: VNode[] | undefined
): NormalizedSearchAutocompleteSlotModel {
  if (!nodes || nodes.length === 0) {
    return { items: [], entries: [] };
  }

  const topLevelNodes = flattenVNodeChildren(nodes);
  const items: NormalizedSearchAutocompleteItem[] = [];
  const entries: NormalizedSearchAutocompleteEntry[] = [];
  let itemIndex = 0;
  let sectionIndex = 0;

  for (const node of topLevelNodes) {
    const componentName = getComponentName(node);
    if (componentName === "SearchAutocompleteItem") {
      const item = parseSearchAutocompleteItemNode(node, `item-${itemIndex}`);
      items.push(item);
      entries.push({
        type: "item",
        key: item.key,
      });
      itemIndex += 1;
      continue;
    }

    if (componentName === "SearchAutocompleteSection") {
      const sectionProps = (node.props ?? {}) as Record<string, unknown>;
      const sectionKey = normalizeSearchAutocompleteKey(
        node.key ?? sectionProps.id,
        `section-${sectionIndex}`
      );
      const sectionTitle =
        typeof sectionProps.title === "string" ? sectionProps.title : undefined;
      const sectionAriaLabel =
        typeof sectionProps["aria-label"] === "string"
          ? sectionProps["aria-label"]
          : undefined;
      const sectionChildren = getSlotChildren(node).filter(
        (child) => getComponentName(child) === "SearchAutocompleteItem"
      );
      const sectionItemKeys: Key[] = [];

      for (const child of sectionChildren) {
        const item = parseSearchAutocompleteItemNode(
          child,
          `item-${itemIndex}`,
          sectionKey
        );
        items.push(item);
        sectionItemKeys.push(item.key);
        itemIndex += 1;
      }

      if (sectionItemKeys.length > 0) {
        entries.push({
          type: "section",
          key: sectionKey,
          title: sectionTitle,
          "aria-label": sectionAriaLabel,
          itemKeys: sectionItemKeys,
        });
      }

      sectionIndex += 1;
    }
  }

  return { items, entries };
}

function areNormalizedItemsEqual(
  left: NormalizedSearchAutocompleteItem[],
  right: NormalizedSearchAutocompleteItem[]
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    const current = left[index];
    const candidate = right[index];
    if (
      current.key !== candidate.key ||
      current.label !== candidate.label ||
      current.textValue !== candidate.textValue ||
      current.isDisabled !== candidate.isDisabled ||
      current["aria-label"] !== candidate["aria-label"] ||
      current.sectionKey !== candidate.sectionKey
    ) {
      return false;
    }
  }

  return true;
}

function areNormalizedEntriesEqual(
  left: NormalizedSearchAutocompleteEntry[],
  right: NormalizedSearchAutocompleteEntry[]
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    const current = left[index];
    const candidate = right[index];
    if (
      !current ||
      !candidate ||
      current.type !== candidate.type ||
      current.key !== candidate.key
    ) {
      return false;
    }

    if (current.type === "item") {
      continue;
    }

    if (candidate.type !== "section") {
      return false;
    }

    if (
      current.title !== candidate.title ||
      current["aria-label"] !== candidate["aria-label"] ||
      current.itemKeys.length !== candidate.itemKeys.length
    ) {
      return false;
    }

    for (let keyIndex = 0; keyIndex < current.itemKeys.length; keyIndex += 1) {
      if (current.itemKeys[keyIndex] !== candidate.itemKeys[keyIndex]) {
        return false;
      }
    }
  }

  return true;
}

function areNormalizedSlotModelsEqual(
  left: NormalizedSearchAutocompleteSlotModel,
  right: NormalizedSearchAutocompleteSlotModel
): boolean {
  return (
    areNormalizedItemsEqual(left.items, right.items) &&
    areNormalizedEntriesEqual(left.entries, right.entries)
  );
}

function normalizeIdSegment(value: Key): string {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "-");
}

function createStaticSearchAutocompleteComponent(
  name: string,
  props: Record<string, unknown>
) {
  return defineComponent({
    name,
    props: props as any,
    setup() {
      return () => null;
    },
  });
}

export const SearchAutocompleteItem = createStaticSearchAutocompleteComponent(
  "SearchAutocompleteItem",
  {
    id: {
      type: [String, Number] as PropType<SpectrumSearchAutocompleteItemProps["id"]>,
      default: undefined,
    },
    textValue: {
      type: String as PropType<SpectrumSearchAutocompleteItemProps["textValue"]>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<SpectrumSearchAutocompleteItemProps["isDisabled"]>,
      default: undefined,
    },
    "aria-label": {
      type: String as PropType<SpectrumSearchAutocompleteItemProps["aria-label"]>,
      default: undefined,
    },
  }
);

export const SearchAutocompleteSection = createStaticSearchAutocompleteComponent(
  "SearchAutocompleteSection",
  {
    id: {
      type: [String, Number] as PropType<SpectrumSearchAutocompleteSectionProps["id"]>,
      default: undefined,
    },
    title: {
      type: String as PropType<SpectrumSearchAutocompleteSectionProps["title"]>,
      default: undefined,
    },
    "aria-label": {
      type: String as PropType<SpectrumSearchAutocompleteSectionProps["aria-label"]>,
      default: undefined,
    },
  }
);

const SearchAutocompleteOption = defineComponent({
  name: "SearchAutocompleteOption",
  props: {
    item: {
      type: Object as PropType<NormalizedSearchAutocompleteItem>,
      required: true,
    },
    state: {
      type: Object as PropType<
        ReturnType<typeof useComboBoxState<NormalizedSearchAutocompleteItem>>
      >,
      required: true,
    },
  },
  setup(props) {
    const optionRef = ref<HTMLElement | null>(null);

    const option = useOption(
      {
        key: props.item.key,
        isDisabled: props.item.isDisabled,
        "aria-label": props.item["aria-label"],
        shouldFocusOnHover: true,
        shouldSelectOnPressUp: true,
      },
      props.state,
      optionRef
    );

    const toVueOptionProps = (
      optionProps: Record<string, unknown>
    ): Record<string, unknown> => {
      const mapped = { ...optionProps };
      if ("onMouseDown" in mapped) {
        mapped.onMousedown = mapped.onMouseDown;
        delete mapped.onMouseDown;
      }
      if ("onMouseUp" in mapped) {
        mapped.onMouseup = mapped.onMouseUp;
        delete mapped.onMouseUp;
      }
      if ("onMouseEnter" in mapped) {
        mapped.onMouseenter = mapped.onMouseEnter;
        delete mapped.onMouseEnter;
      }
      if ("onMouseLeave" in mapped) {
        mapped.onMouseleave = mapped.onMouseLeave;
        delete mapped.onMouseLeave;
      }
      return mapped;
    };

    return () => {
      const optionProps = toVueOptionProps(
        option.optionProps.value as Record<string, unknown>
      );

      return h(
        "div",
        mergeProps(optionProps, {
          ref: (value: unknown) => {
            optionRef.value = value as HTMLElement | null;
          },
          class: classNames("spectrum-Menu-item", {
            "is-focused": option.isFocused.value,
            "is-selected": option.isSelected.value,
            "is-disabled": option.isDisabled.value,
          }),
        }),
        [
          h(
            "span",
            mergeProps(option.labelProps.value, {
              class: classNames("spectrum-Menu-itemLabel"),
            }),
            props.item.label
          ),
        ]
      );
    };
  },
});

export const SearchAutocomplete = defineComponent({
  name: "SearchAutocomplete",
  inheritAttrs: false,
  props: {
    ...searchAutocompletePropOptions,
  },
  setup(props, { attrs, expose, slots }) {
    const stringFormatter = useLocalizedStringFormatter(
      searchAutocompleteMessages,
      "@vue-spectrum/autocomplete"
    );
    const rootRef = ref<HTMLElement | null>(null);
    const inputRef = ref<HTMLInputElement | null>(null);
    const popoverRef = ref<HTMLElement | null>(null);
    const listBoxRef = ref<HTMLElement | null>(null);
    const formRef = ref<HTMLFormElement | null>(null);
    const loadMoreRequested = ref(false);
    const hasWarnedPlaceholder = ref(false);
    const slotModel = ref<NormalizedSearchAutocompleteSlotModel>({
      items: [],
      entries: [],
    });
    const isProduction =
      typeof process !== "undefined" && process.env.NODE_ENV === "production";

    watch(
      () => props.placeholder,
      (placeholder) => {
        if (isProduction || hasWarnedPlaceholder.value || !placeholder) {
          return;
        }

        console.warn(PLACEHOLDER_DEPRECATION_WARNING);
        hasWarnedPlaceholder.value = true;
      },
      { immediate: true }
    );

    const normalizedItems = computed<NormalizedSearchAutocompleteItem[]>(() => {
      const source = props.items ?? props.defaultItems;
      if (source) {
        return source.map((item: SpectrumSearchAutocompleteItemData) => ({
          key: item.key,
          label: item.label,
          textValue: item.textValue ?? item.label,
          isDisabled: item.isDisabled,
          "aria-label": item["aria-label"],
        }));
      }

      return slotModel.value.items;
    });

    const isAsync = computed(() => props.loadingState !== undefined);

    const state = useComboBoxState<NormalizedSearchAutocompleteItem>({
      collection: normalizedItems,
      selectedKey: props.selectedKey,
      defaultSelectedKey: props.defaultSelectedKey,
      onSelectionChange: (key) => {
        props.onSelectionChange?.(key);
        if (key !== null) {
          const selectedItem = normalizedItems.value.find((item) => item.key === key);
          props.onSubmit?.(selectedItem?.label ?? "", key);
        }
      },
      inputValue: props.inputValue,
      defaultInputValue: props.defaultInputValue,
      onInputChange: props.onInputChange,
      isOpen: props.isOpen,
      defaultOpen: props.defaultOpen,
      onOpenChange: (isOpen, trigger) => {
        if (props.isDisabled || props.isReadOnly) {
          return;
        }

        props.onOpenChange?.(isOpen, trigger);
      },
      defaultFilter: props.defaultFilter ?? DEFAULT_FILTER,
      completionMode: props.completionMode,
      menuTrigger: props.menuTrigger ?? "input",
      allowsEmptyCollection: computed(
        () => props.allowsEmptyCollection ?? isAsync.value
      ),
      allowsCustomValue: computed(() => props.allowsCustomValue ?? true),
      shouldCloseOnBlur: props.shouldCloseOnBlur,
      isReadOnly: props.isReadOnly,
    });

    const submitCurrentValue = (key: Key | null = state.selectedKey.value) => {
      let value = state.inputValue.value;
      if (key !== null) {
        const selectedItem = normalizedItems.value.find((item) => item.key === key);
        if (selectedItem) {
          value = selectedItem.label;
        }
      }

      props.onSubmit?.(value, key);
    };

    const {
      labelProps,
      inputProps,
      listBoxProps,
      descriptionProps,
      errorMessageProps,
    } = useComboBox(
      {
        id: props.id,
        label: props.label,
        description: props.description,
        errorMessage: props.errorMessage,
        isDisabled: props.isDisabled,
        isReadOnly: props.isReadOnly,
        isRequired: props.isRequired,
        inputRef,
        popoverRef,
        listBoxRef,
        "aria-label": props["aria-label"] ?? props.ariaLabel,
        "aria-labelledby": props["aria-labelledby"] ?? props.ariaLabelledby,
        "aria-describedby": props["aria-describedby"] ?? props.ariaDescribedby,
        onFocus: props.onFocus,
        onBlur: props.onBlur,
        onKeydown: (event) => {
          if (props.isReadOnly && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            event.preventDefault();
            state.close();
            props.onKeydown?.(event);
            return;
          }

          if (event.key === "Escape" && !props.isDisabled && !props.isReadOnly) {
            if (state.inputValue.value.length > 0) {
              state.setSelectedKey(null);
              state.setInputValue("");
              props.onClear?.();
            }
          }

          if (event.key === "Enter") {
            const focusedKey = state.isOpen.value ? state.focusedKey.value : null;
            if (focusedKey !== null && focusedKey !== state.selectedKey.value) {
              return;
            }

            submitCurrentValue(focusedKey ?? state.selectedKey.value);
          }

          props.onKeydown?.(event);
        },
      },
      state
    );

    watch(
      () => [props.isDisabled, props.isReadOnly, state.isOpen.value] as const,
      ([isDisabled, isReadOnly, isOpen]) => {
        if ((isDisabled || isReadOnly) && isOpen) {
          state.close();
        }
      }
    );

    const clearSearch = () => {
      if (props.isDisabled || props.isReadOnly) {
        return;
      }

      state.setSelectedKey(null);
      state.setInputValue("");
      state.close();
      props.onClear?.();
      inputRef.value?.focus();
    };

    const onListBoxScroll = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target || !props.onLoadMore || isLoadingList.value) {
        loadMoreRequested.value = false;
        return;
      }

      const distance = target.scrollHeight - target.scrollTop - target.clientHeight;
      if (distance > 4) {
        loadMoreRequested.value = false;
        return;
      }

      if (loadMoreRequested.value) {
        return;
      }

      loadMoreRequested.value = true;
      props.onLoadMore();
    };

    const getItemTextByKey = (key: Key | null): string => {
      if (key === null) {
        return "";
      }

      const item = normalizedItems.value.find((entry) => entry.key === key);
      return item?.textValue ?? item?.label ?? "";
    };

    const onFormReset = () => {
      const defaultSelectedKey = props.defaultSelectedKey ?? null;

      if (props.selectedKey === undefined) {
        state.setSelectedKey(defaultSelectedKey);
      }

      if (props.inputValue === undefined) {
        const resetInputValue =
          props.defaultInputValue ??
          getItemTextByKey(
            props.selectedKey !== undefined
              ? props.selectedKey ?? null
              : defaultSelectedKey
          );
        state.setInputValue(resetInputValue);
      }

      state.close();
    };

    const resolveFormElement = (): HTMLFormElement | null => {
      if (typeof document === "undefined") {
        return null;
      }

      if (props.form) {
        const target = document.getElementById(props.form);
        return target instanceof HTMLFormElement ? target : null;
      }

      return rootRef.value?.closest("form") ?? null;
    };

    const detachFormListener = () => {
      if (formRef.value) {
        formRef.value.removeEventListener("reset", onFormReset);
        formRef.value = null;
      }
    };

    const attachFormListener = () => {
      detachFormListener();

      const formElement = resolveFormElement();
      if (!formElement) {
        return;
      }

      formElement.addEventListener("reset", onFormReset);
      formRef.value = formElement;
    };

    onMounted(() => {
      attachFormListener();
    });

    onBeforeUnmount(() => {
      detachFormListener();
    });

    watch(
      () => props.form,
      () => {
        attachFormListener();
      }
    );

    const isLoadingInput = computed(
      () => props.loadingState === "loading" || props.loadingState === "filtering"
    );
    const isLoadingList = computed(
      () => props.loadingState === "loading" || props.loadingState === "loadingMore"
    );

    const shouldShowClearButton = computed(() => {
      if (props.isReadOnly) {
        return false;
      }

      return state.inputValue.value.length > 0 || props.loadingState === "filtering";
    });

    const shouldShowList = computed(
      () =>
        state.isOpen.value &&
        (state.collection.value.length > 0 ||
          Boolean(props.allowsEmptyCollection ?? isAsync.value) ||
          isLoadingList.value)
    );

    const resolvedIcon = computed(() => {
      if (props.icon === "" || props.icon === null) {
        return null;
      }

      if (props.icon !== undefined) {
        return props.icon;
      }

      return h("span", {
        "data-testid": "searchicon",
        class: classNames("react-spectrum-SearchAutocomplete-icon"),
        "aria-hidden": "true",
      });
    });

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
      focus: () => {
        inputRef.value?.focus();
      },
      blur: () => {
        inputRef.value?.blur();
      },
      open: (focusStrategy: FocusStrategy = null, trigger: MenuTriggerAction = "manual") => {
        state.open(focusStrategy, trigger);
      },
      close: () => {
        state.close();
      },
    });

    return () => {
      if (!props.items && !props.defaultItems) {
        const parsedSlotModel = parseSearchAutocompleteSlotItems(
          slots.default?.() as VNode[] | undefined
        );
        if (!areNormalizedSlotModelsEqual(parsedSlotModel, slotModel.value)) {
          slotModel.value = parsedSlotModel;
        }
      }

      const domProps = filterDOMProps(attrs as Record<string, unknown>, {
        labelable: true,
      });
      const { styleProps } = useStyleProps({
        isHidden: props.isHidden,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      });

      const visibleItemsByKey = new Map<Key, NormalizedSearchAutocompleteItem>();
      for (const item of state.collection.value) {
        visibleItemsByKey.set(item.key, item);
      }

      const renderOption = (item: NormalizedSearchAutocompleteItem) =>
        h(SearchAutocompleteOption, {
          key: String(item.key),
          item,
          state,
        });

      const renderedList: VNode[] = [];

      if (props.items || props.defaultItems || slotModel.value.entries.length === 0) {
        for (const item of state.collection.value) {
          renderedList.push(renderOption(item));
        }
      } else {
        const listBoxId = listBoxProps.value.id as string | undefined;

        for (const entry of slotModel.value.entries) {
          if (entry.type === "item") {
            const visibleItem = visibleItemsByKey.get(entry.key);
            if (visibleItem) {
              renderedList.push(renderOption(visibleItem));
            }
            continue;
          }

          const visibleSectionItems = entry.itemKeys
            .map((key) => visibleItemsByKey.get(key))
            .filter((item): item is NormalizedSearchAutocompleteItem => Boolean(item));
          if (visibleSectionItems.length === 0) {
            continue;
          }

          const sectionHeadingId = entry.title
            ? `${listBoxId ?? "autocomplete-listbox"}-section-${normalizeIdSegment(entry.key)}-heading`
            : undefined;

          renderedList.push(
            h(
              "div",
              {
                key: `section-${String(entry.key)}`,
                role: "presentation",
                class: classNames("react-spectrum-SearchAutocomplete-section"),
              },
              [
                entry.title
                  ? h(
                    "div",
                    {
                      id: sectionHeadingId,
                      role: "presentation",
                      class: classNames("spectrum-Menu-sectionHeading"),
                    },
                    entry.title
                  )
                  : null,
                h(
                  "div",
                  {
                    role: "group",
                    "aria-labelledby": sectionHeadingId,
                    "aria-label": sectionHeadingId
                      ? undefined
                      : entry["aria-label"],
                    class: classNames("spectrum-Menu-section"),
                  },
                  visibleSectionItems.map((item) => renderOption(item))
                ),
              ]
            )
          );
        }
      }

      if (state.collection.value.length === 0 && !isLoadingList.value && isAsync.value) {
        renderedList.push(
          h(
            "div",
            {
              class: classNames("spectrum-Menu-item", "is-empty"),
            },
            "No results"
          )
        );
      }

      if (isLoadingList.value) {
        renderedList.push(
          h(
            "div",
            {
              role: "option",
              class: classNames("spectrum-Menu-item", "is-loading"),
            },
            [
              h(ProgressCircle, {
                isIndeterminate: true,
                size: "S",
                "aria-label":
                  props.loadingState === "loadingMore"
                    ? "Loading more"
                    : "Loading",
              }),
            ]
          )
        );
      }

      const clearButton = shouldShowClearButton.value
        ? h(ClearButton as any, {
            "aria-label": stringFormatter.value.format("Clear search"),
            onPress: clearSearch,
            preventFocus: true,
            isDisabled: Boolean(props.isDisabled),
            UNSAFE_className: classNames("spectrum-ClearButton"),
          })
        : null;

      const loadingIndicator = isLoadingInput.value
        ? h(ProgressCircle, {
            isIndeterminate: true,
            size: "S",
            "aria-label": "Loading",
          })
        : null;

      return h(
        "div",
        mergeProps(domProps, {
          ref: (value: unknown) => {
            rootRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "react-spectrum-SearchAutocomplete",
            {
              "is-open": state.isOpen.value,
              "is-disabled": Boolean(props.isDisabled),
              "is-readOnly": Boolean(props.isReadOnly),
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
                mergeProps(labelProps.value, {
                  class: classNames("spectrum-FieldLabel"),
                }),
                props.label
              )
            : null,
          h("div", { class: classNames("react-spectrum-SearchAutocomplete-field") }, [
            resolvedIcon.value,
            h(
              "input",
              mergeProps(inputProps.value, {
                ref: (value: unknown) => {
                  inputRef.value = value as HTMLInputElement | null;
                },
                name: props.name,
                form: props.form,
                placeholder: props.placeholder,
                disabled: props.isDisabled,
                readonly: props.isReadOnly,
                required: props.isRequired,
                autofocus: props.autoFocus,
                type: "search",
                autocorrect: "off",
                autocomplete: "off",
                spellcheck: false,
                class: classNames(
                  "spectrum-Search-input",
                  "react-spectrum-SearchAutocomplete-input"
                ),
              })
            ),
            loadingIndicator,
            clearButton,
          ]),
          props.description
            ? h(
                "div",
                mergeProps(descriptionProps.value, {
                  class: classNames("spectrum-FieldDescription"),
                }),
                props.description
              )
            : null,
          props.errorMessage
            ? h(
                "div",
                mergeProps(errorMessageProps.value, {
                  class: classNames("spectrum-FieldError"),
                }),
                props.errorMessage
              )
            : null,
          shouldShowList.value
            ? h(
                "div",
                {
                  ref: (value: unknown) => {
                    popoverRef.value = value as HTMLElement | null;
                  },
                  class: classNames("react-spectrum-SearchAutocomplete-popover"),
                },
                [
                  h(
                    "div",
                    mergeProps(listBoxProps.value, {
                      ref: (value: unknown) => {
                        listBoxRef.value = value as HTMLElement | null;
                      },
                      "aria-label":
                        (listBoxProps.value["aria-label"] as string | undefined) ??
                        "Suggestions",
                      class: classNames(
                        "spectrum-Menu",
                        "react-spectrum-SearchAutocomplete-listBox"
                      ),
                      onScroll: onListBoxScroll,
                    }),
                    renderedList
                  ),
                ]
              )
            : null,
        ]
      );
    };
  },
});
