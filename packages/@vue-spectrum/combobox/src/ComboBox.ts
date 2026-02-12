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
  type CompletionMode,
  type FilterFn,
  type FocusStrategy,
  type MenuTrigger,
  type MenuTriggerAction,
} from "@vue-aria/combobox-state";
import { useOption } from "@vue-aria/listbox";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import type { Key } from "@vue-aria/types";
import { ProgressCircle } from "@vue-spectrum/progress";
import {
  classNames,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";
import type { SpectrumComboBoxItemData } from "./types";

export interface SpectrumComboBoxProps {
  id?: string | undefined;
  name?: string | undefined;
  form?: string | undefined;
  formValue?: "text" | "key" | undefined;
  label?: string | undefined;
  description?: string | undefined;
  errorMessage?: string | undefined;
  items?: SpectrumComboBoxItemData[] | undefined;
  disabledKeys?: Iterable<Key> | undefined;
  selectedKey?: Key | null | undefined;
  defaultSelectedKey?: Key | null | undefined;
  onSelectionChange?: ((key: Key | null) => void) | undefined;
  inputValue?: string | undefined;
  defaultInputValue?: string | undefined;
  onInputChange?: ((value: string) => void) | undefined;
  isOpen?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((isOpen: boolean, trigger?: MenuTriggerAction) => void) | undefined;
  defaultFilter?: FilterFn | undefined;
  completionMode?: CompletionMode | undefined;
  menuTrigger?: MenuTrigger | undefined;
  allowsEmptyCollection?: boolean | undefined;
  allowsCustomValue?: boolean | undefined;
  shouldCloseOnBlur?: boolean | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  isRequired?: boolean | undefined;
  loadingState?: "idle" | "loading" | "loadingMore" | "filtering" | undefined;
  onLoadMore?: (() => void) | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledby?: string | undefined;
  ariaDescribedby?: string | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  "aria-describedby"?: string | undefined;
  placeholder?: string | undefined;
  autoFocus?: boolean | undefined;
  onFocus?: ((event: FocusEvent) => void) | undefined;
  onBlur?: ((event: FocusEvent) => void) | undefined;
  onKeydown?: ((event: KeyboardEvent) => void) | undefined;
  slot?: string | undefined;
  isHidden?: boolean | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export interface SpectrumComboBoxItemProps {
  id?: Key | undefined;
  textValue?: string | undefined;
  isDisabled?: boolean | undefined;
  "aria-label"?: string | undefined;
}

export interface SpectrumComboBoxSectionProps {
  id?: Key | undefined;
  title?: string | undefined;
  "aria-label"?: string | undefined;
}

interface NormalizedComboBoxItem {
  key: Key;
  textValue?: string | undefined;
  label: string;
  isDisabled?: boolean | undefined;
  "aria-label"?: string | undefined;
  sectionKey?: Key | undefined;
}

interface NormalizedComboBoxItemEntry {
  type: "item";
  key: Key;
}

interface NormalizedComboBoxSectionEntry {
  type: "section";
  key: Key;
  title?: string | undefined;
  "aria-label"?: string | undefined;
  itemKeys: Key[];
}

type NormalizedComboBoxEntry = NormalizedComboBoxItemEntry | NormalizedComboBoxSectionEntry;

interface NormalizedComboBoxSlotModel {
  items: NormalizedComboBoxItem[];
  entries: NormalizedComboBoxEntry[];
}

const DEFAULT_FILTER: FilterFn = (textValue, inputValue) =>
  textValue.toLowerCase().includes(inputValue.toLowerCase());

const PLACEHOLDER_DEPRECATION_WARNING =
  "Placeholders are deprecated due to accessibility issues. Please use help text instead. See the docs for details: https://react-spectrum.adobe.com/react-spectrum/ComboBox.html#help-text";

function normalizeComboBoxKey(value: unknown, fallback: Key): Key {
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

function parseComboBoxItemNode(
  node: VNode,
  fallback: Key,
  sectionKey?: Key
): NormalizedComboBoxItem {
  const props = (node.props ?? {}) as Record<string, unknown>;
  const labelFromSlot = extractTextContent(getSlotContent(node)).trim();
  const textValue =
    typeof props.textValue === "string" ? props.textValue : labelFromSlot;
  const resolvedLabel = textValue || String(fallback);

  return {
    key: normalizeComboBoxKey(node.key ?? props.id, fallback),
    label: resolvedLabel,
    textValue: resolvedLabel,
    isDisabled: Boolean(props.isDisabled),
    "aria-label":
      typeof props["aria-label"] === "string" ? props["aria-label"] : undefined,
    sectionKey,
  };
}

function parseComboBoxSlotItems(
  nodes: VNode[] | undefined
): NormalizedComboBoxSlotModel {
  if (!nodes || nodes.length === 0) {
    return { items: [], entries: [] };
  }

  const topLevelNodes = flattenVNodeChildren(nodes);
  const items: NormalizedComboBoxItem[] = [];
  const entries: NormalizedComboBoxEntry[] = [];
  let itemIndex = 0;
  let sectionIndex = 0;

  for (const node of topLevelNodes) {
    const componentName = getComponentName(node);
    if (componentName === "ComboBoxItem") {
      const item = parseComboBoxItemNode(node, `item-${itemIndex}`);
      items.push(item);
      entries.push({
        type: "item",
        key: item.key,
      });
      itemIndex += 1;
      continue;
    }

    if (componentName === "ComboBoxSection") {
      const sectionProps = (node.props ?? {}) as Record<string, unknown>;
      const sectionKey = normalizeComboBoxKey(
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
        (child) => getComponentName(child) === "ComboBoxItem"
      );
      const sectionItemKeys: Key[] = [];

      for (const child of sectionChildren) {
        const item = parseComboBoxItemNode(
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
  left: NormalizedComboBoxItem[],
  right: NormalizedComboBoxItem[]
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
  left: NormalizedComboBoxEntry[],
  right: NormalizedComboBoxEntry[]
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
  left: NormalizedComboBoxSlotModel,
  right: NormalizedComboBoxSlotModel
): boolean {
  return (
    areNormalizedItemsEqual(left.items, right.items) &&
    areNormalizedEntriesEqual(left.entries, right.entries)
  );
}

function normalizeIdSegment(value: Key): string {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "-");
}

function createStaticComboBoxComponent(name: string, props: Record<string, unknown>) {
  return defineComponent({
    name,
    props: props as any,
    setup() {
      return () => null;
    },
  });
}

export const ComboBoxItem = createStaticComboBoxComponent("ComboBoxItem", {
  id: {
    type: [String, Number] as PropType<Key | undefined>,
    default: undefined,
  },
  textValue: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  isDisabled: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
  "aria-label": {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
});

export const ComboBoxSection = createStaticComboBoxComponent("ComboBoxSection", {
  id: {
    type: [String, Number] as PropType<Key | undefined>,
    default: undefined,
  },
  title: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  "aria-label": {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
});

const ComboBoxOption = defineComponent({
  name: "ComboBoxOption",
  props: {
    item: {
      type: Object as PropType<NormalizedComboBoxItem>,
      required: true,
    },
    state: {
      type: Object as PropType<ReturnType<typeof useComboBoxState<NormalizedComboBoxItem>>>,
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
      const onMousedown = optionProps.onMousedown as
        | ((event: MouseEvent) => void)
        | undefined;
      if (onMousedown) {
        optionProps.onMousedown = (event: MouseEvent) => {
          // Keep focus on the input while pointer-pressing listbox options.
          event.preventDefault();
          onMousedown(event);
        };
      }

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

export const ComboBox = defineComponent({
  name: "ComboBox",
  inheritAttrs: false,
  props: {
    id: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    name: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    form: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    formValue: {
      type: String as PropType<"text" | "key" | undefined>,
      default: "text",
    },
    label: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    description: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    errorMessage: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    items: {
      type: Array as PropType<SpectrumComboBoxItemData[] | undefined>,
      default: undefined,
    },
    disabledKeys: {
      type: null as unknown as PropType<Iterable<Key> | undefined>,
      default: undefined,
    },
    selectedKey: {
      type: [String, Number] as PropType<Key | null | undefined>,
      default: undefined,
    },
    defaultSelectedKey: {
      type: [String, Number] as PropType<Key | null | undefined>,
      default: undefined,
    },
    onSelectionChange: {
      type: Function as PropType<((key: Key | null) => void) | undefined>,
      default: undefined,
    },
    inputValue: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    defaultInputValue: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    onInputChange: {
      type: Function as PropType<((value: string) => void) | undefined>,
      default: undefined,
    },
    isOpen: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    defaultOpen: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    onOpenChange: {
      type: Function as PropType<
        ((isOpen: boolean, trigger?: MenuTriggerAction) => void) | undefined
      >,
      default: undefined,
    },
    defaultFilter: {
      type: Function as PropType<FilterFn | undefined>,
      default: undefined,
    },
    completionMode: {
      type: String as PropType<CompletionMode | undefined>,
      default: undefined,
    },
    menuTrigger: {
      type: String as PropType<MenuTrigger | undefined>,
      default: undefined,
    },
    allowsEmptyCollection: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    allowsCustomValue: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    shouldCloseOnBlur: {
      type: Boolean as PropType<boolean | undefined>,
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
    isRequired: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    loadingState: {
      type: String as PropType<"idle" | "loading" | "loadingMore" | "filtering" | undefined>,
      default: undefined,
    },
    onLoadMore: {
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
    ariaDescribedby: {
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
    "aria-describedby": {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    placeholder: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    autoFocus: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    onFocus: {
      type: Function as PropType<((event: FocusEvent) => void) | undefined>,
      default: undefined,
    },
    onBlur: {
      type: Function as PropType<((event: FocusEvent) => void) | undefined>,
      default: undefined,
    },
    onKeydown: {
      type: Function as PropType<((event: KeyboardEvent) => void) | undefined>,
      default: undefined,
    },
    slot: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    isHidden: {
      type: Boolean as PropType<boolean | undefined>,
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
  setup(props, { attrs, expose, slots }) {
    const rootRef = ref<HTMLElement | null>(null);
    const inputRef = ref<HTMLInputElement | null>(null);
    const popoverRef = ref<HTMLElement | null>(null);
    const listBoxRef = ref<HTMLElement | null>(null);
    const buttonRef = ref<HTMLButtonElement | null>(null);
    const formRef = ref<HTMLFormElement | null>(null);
    const loadMoreRequested = ref(false);
    const hasWarnedPlaceholder = ref(false);
    const slotModel = ref<NormalizedComboBoxSlotModel>({
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

    const normalizedItems = computed<NormalizedComboBoxItem[]>(() => {
      if (props.items) {
        return props.items.map((item) => ({
          key: item.key,
          label: item.label,
          textValue: item.textValue ?? item.label,
          isDisabled: item.isDisabled,
          "aria-label": item["aria-label"],
        }));
      }

      return slotModel.value.items;
    });

    const controlledSelectedKey =
      props.selectedKey === undefined
        ? undefined
        : computed(() => props.selectedKey);
    const controlledInputValue =
      props.inputValue === undefined
        ? undefined
        : computed(() => props.inputValue);
    const controlledIsOpen =
      props.isOpen === undefined ? undefined : computed(() => props.isOpen);

    const state = useComboBoxState<NormalizedComboBoxItem>({
      collection: normalizedItems,
      disabledKeys: computed(() => props.disabledKeys),
      selectedKey: controlledSelectedKey,
      defaultSelectedKey: props.defaultSelectedKey,
      onSelectionChange: props.onSelectionChange,
      inputValue: controlledInputValue,
      defaultInputValue: props.defaultInputValue,
      onInputChange: props.onInputChange,
      isOpen: controlledIsOpen,
      defaultOpen: props.defaultOpen,
      onOpenChange: props.onOpenChange,
      defaultFilter: props.defaultFilter ?? DEFAULT_FILTER,
      completionMode: computed(() => props.completionMode),
      menuTrigger: computed(() => props.menuTrigger),
      allowsEmptyCollection: computed(() => props.allowsEmptyCollection),
      allowsCustomValue: computed(() => props.allowsCustomValue),
      shouldCloseOnBlur: computed(() => props.shouldCloseOnBlur),
      isReadOnly: computed(() => props.isReadOnly),
    });

    const {
      labelProps,
      inputProps,
      listBoxProps,
      buttonProps,
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
        menuTrigger: computed(() => props.menuTrigger),
        inputRef,
        popoverRef,
        listBoxRef,
        buttonRef,
        "aria-label": props["aria-label"] ?? props.ariaLabel,
        "aria-labelledby": props["aria-labelledby"] ?? props.ariaLabelledby,
        "aria-describedby": props["aria-describedby"] ?? props.ariaDescribedby,
        onFocus: props.onFocus,
        onBlur: props.onBlur,
        onKeydown: props.onKeydown,
      },
      state
    );

    const isLoading = computed(
      () => props.loadingState === "loading" || props.loadingState === "loadingMore"
    );
    const resolvedFormValue = computed<"text" | "key">(() => {
      if (props.allowsCustomValue) {
        return "text";
      }

      return props.formValue ?? "text";
    });
    const hiddenInputValue = computed<string>(() => {
      const selectedKey = state.selectedKey.value;
      if (selectedKey === null || selectedKey === undefined) {
        return "";
      }

      return String(selectedKey);
    });

    const resolvedButtonDisabled = computed(() => {
      const value = (buttonProps.value.isDisabled as boolean | undefined) ?? false;
      return Boolean(value);
    });

    const onButtonPressStart = (
      buttonProps.value.onPressStart as
        | ((event: { pointerType: string }) => void)
        | undefined
    );
    const onButtonPress = (
      buttonProps.value.onPress as
        | ((event: { pointerType: string }) => void)
        | undefined
    );

    const resolvePointerType = (event: Event): string => {
      if (event instanceof PointerEvent) {
        return event.pointerType;
      }

      if (event instanceof KeyboardEvent) {
        return "keyboard";
      }

      return "mouse";
    };

    const onButtonMousedown = (event: MouseEvent) => {
      if (resolvedButtonDisabled.value) {
        return;
      }

      event.preventDefault();
      onButtonPressStart?.({
        pointerType: resolvePointerType(event),
      });
    };

    const onButtonClick = (event: MouseEvent) => {
      if (resolvedButtonDisabled.value) {
        return;
      }

      onButtonPress?.({
        pointerType: resolvePointerType(event),
      });
    };

    const onListBoxScroll = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target || !props.onLoadMore || isLoading.value) {
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

    const onDocumentScroll = (event: Event) => {
      if (!state.isOpen.value) {
        return;
      }

      const target = event.target;
      if (
        target instanceof Node &&
        listBoxRef.value &&
        listBoxRef.value.contains(target)
      ) {
        return;
      }

      state.close();
    };

    const detachScrollListener = () => {
      if (typeof window === "undefined") {
        return;
      }

      window.removeEventListener("scroll", onDocumentScroll, true);
    };

    const syncScrollListener = () => {
      if (typeof window === "undefined") {
        return;
      }

      detachScrollListener();
      if (state.isOpen.value) {
        window.addEventListener("scroll", onDocumentScroll, true);
      }
    };

    onMounted(() => {
      attachFormListener();
      syncScrollListener();
    });

    onBeforeUnmount(() => {
      detachFormListener();
      detachScrollListener();
    });

    watch(
      () => props.form,
      () => {
        attachFormListener();
      }
    );

    watch(
      () => state.isOpen.value,
      () => {
        syncScrollListener();
      }
    );

    expose({
      UNSAFE_getDOMNode: () => rootRef.value,
      focus: () => {
        inputRef.value?.focus();
      },
      blur: () => {
        inputRef.value?.blur();
      },
      toggle: (focusStrategy: FocusStrategy = null, trigger: MenuTriggerAction = "manual") => {
        state.toggle(focusStrategy, trigger);
      },
      open: (focusStrategy: FocusStrategy = null, trigger: MenuTriggerAction = "manual") => {
        state.open(focusStrategy, trigger);
      },
      close: () => {
        state.close();
      },
    });

    return () => {
      if (!props.items) {
        const parsedSlotModel = parseComboBoxSlotItems(
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

      const visibleItemsByKey = new Map<Key, NormalizedComboBoxItem>();
      for (const item of state.collection.value) {
        visibleItemsByKey.set(item.key, item);
      }

      const renderOption = (item: NormalizedComboBoxItem) =>
        h(ComboBoxOption, {
          key: String(item.key),
          item,
          state,
        });

      const renderedList: VNode[] = [];

      if (props.items || slotModel.value.entries.length === 0) {
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
            .filter((item): item is NormalizedComboBoxItem => Boolean(item));
          if (visibleSectionItems.length === 0) {
            continue;
          }

          const sectionHeadingId = entry.title
            ? `${listBoxId ?? "combobox-listbox"}-section-${normalizeIdSegment(entry.key)}-heading`
            : undefined;

          renderedList.push(
            h(
              "div",
              {
                key: `section-${String(entry.key)}`,
                role: "presentation",
                class: classNames("react-spectrum-ComboBox-section"),
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

      if (isLoading.value) {
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

      const shouldShowList =
        state.isOpen.value &&
        (state.collection.value.length > 0 || Boolean(props.allowsEmptyCollection) || isLoading.value);

      return h(
        "div",
        mergeProps(domProps, {
          ref: (value: unknown) => {
            rootRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "react-spectrum-ComboBox",
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
            ? h("label", mergeProps(labelProps.value, {
              class: classNames("spectrum-FieldLabel"),
            }), props.label)
            : null,
          h("div", { class: classNames("react-spectrum-ComboBox-field") }, [
            h("input", mergeProps(inputProps.value, {
              ref: (value: unknown) => {
                inputRef.value = value as HTMLInputElement | null;
              },
              name: resolvedFormValue.value === "text" ? props.name : undefined,
              form: props.form,
              placeholder: props.placeholder,
              disabled: props.isDisabled,
              readonly: props.isReadOnly,
              required: props.isRequired,
              autofocus: props.autoFocus,
              class: classNames("react-spectrum-ComboBox-input"),
            })),
            h("button", {
              id: buttonProps.value.id as string | undefined,
              ref: (value: unknown) => {
                buttonRef.value = value as HTMLButtonElement | null;
              },
              type: "button",
              tabindex: (buttonProps.value.tabIndex as number | undefined) ?? -1,
              disabled: resolvedButtonDisabled.value,
              "aria-haspopup": buttonProps.value["aria-haspopup"] as string | undefined,
              "aria-expanded": buttonProps.value["aria-expanded"] as boolean | undefined,
              "aria-controls": buttonProps.value["aria-controls"] as string | undefined,
              "aria-labelledby": buttonProps.value["aria-labelledby"] as string | undefined,
              "aria-label": buttonProps.value["aria-label"] as string | undefined,
              class: classNames("react-spectrum-ComboBox-button"),
              onMousedown: onButtonMousedown,
              onClick: onButtonClick,
            }, "▼"),
          ]),
          props.name && resolvedFormValue.value === "key"
            ? h("input", {
              type: "hidden",
              name: props.name,
              form: props.form,
              value: hiddenInputValue.value,
            })
            : null,
          props.description
            ? h("div", mergeProps(descriptionProps.value, {
              class: classNames("spectrum-FieldDescription"),
            }), props.description)
            : null,
          props.errorMessage
            ? h("div", mergeProps(errorMessageProps.value, {
              class: classNames("spectrum-FieldError"),
            }), props.errorMessage)
            : null,
          shouldShowList
            ? h("div", {
              ref: (value: unknown) => {
                popoverRef.value = value as HTMLElement | null;
              },
              class: classNames("react-spectrum-ComboBox-popover"),
            }, [
              h("div", mergeProps(listBoxProps.value, {
                ref: (value: unknown) => {
                  listBoxRef.value = value as HTMLElement | null;
                },
                class: classNames("spectrum-Menu", "react-spectrum-ComboBox-listBox"),
                onScroll: onListBoxScroll,
              }), renderedList),
            ])
            : null,
        ]
      );
    };
  },
});
