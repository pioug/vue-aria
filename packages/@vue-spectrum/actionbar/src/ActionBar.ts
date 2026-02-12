import {
  Fragment,
  computed,
  defineComponent,
  h,
  isVNode,
  nextTick,
  ref,
  watch,
  type VNode,
  type VNodeChild,
  type PropType,
} from "vue";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { filterDOMProps } from "@vue-aria/utils";
import { ActionButton } from "@vue-spectrum/button";
import {
  ActionGroup,
  type ActionGroupButtonLabelBehavior,
  type ActionGroupKey,
  type SpectrumActionGroupItemData,
} from "@vue-spectrum/actiongroup";
import { useProviderProps } from "@vue-spectrum/provider";
import { Text } from "@vue-spectrum/text";
import { classNames, useStyleProps, type ClassValue } from "@vue-spectrum/utils";
import { OpenTransition } from "@vue-spectrum/overlays";

export interface SpectrumActionBarProps {
  selectedItemCount?: number | "all" | undefined;
  items?: SpectrumActionGroupItemData[] | undefined;
  disabledKeys?: Iterable<ActionGroupKey> | undefined;
  isEmphasized?: boolean | undefined;
  buttonLabelBehavior?: ActionGroupButtonLabelBehavior | undefined;
  actionsLabel?: string | undefined;
  clearSelectionLabel?: string | undefined;
  selectedAllLabel?: string | undefined;
  selectedCountLabel?: ((count: number) => string) | undefined;
  onAction?: ((key: ActionGroupKey) => void) | undefined;
  onClearSelection?: (() => void) | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export interface SpectrumActionBarItemProps {
  id?: ActionGroupKey | undefined;
  "aria-label"?: string | undefined;
  isDisabled?: boolean | undefined;
}

const SCREEN_READER_ONLY_STYLE: Record<string, string> = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: "0",
};

const ACTIONBAR_INTL_MESSAGES = {
  "en-US": {
    actions: "Actions",
    clearSelection: "Clear selection",
    clear: "Clear",
    selectedAll: "All selected",
    selectedNone: "None selected",
    selectedSingular: "selected",
    selectedPlural: "selected",
  },
  "fr-FR": {
    actions: "Actions",
    clearSelection: "Supprimer la selection",
    clear: "Effacer",
    selectedAll: "Toute la selection",
    selectedNone: "Aucun element selectionne",
    selectedSingular: "selectionne",
    selectedPlural: "selectionnes",
  },
} as const;

function normalizeActionBarKey(value: unknown, fallback: ActionGroupKey): ActionGroupKey {
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

function parseActionBarSlotItems(
  nodes: VNode[] | undefined
): SpectrumActionGroupItemData[] {
  if (!nodes || nodes.length === 0) {
    return [];
  }

  const flattened = flattenVNodeChildren(nodes);
  const parsedItems: SpectrumActionGroupItemData[] = [];
  let itemIndex = 0;

  for (const node of flattened) {
    if (getComponentName(node) !== "ActionBarItem") {
      continue;
    }

    const nodeProps = (node.props ?? {}) as Record<string, unknown>;
    const slotLabel = extractTextContent(getSlotContent(node)).trim();
    const key = normalizeActionBarKey(node.key ?? nodeProps.id, `item-${itemIndex}`);

    parsedItems.push({
      key,
      label: slotLabel || String(key),
      "aria-label":
        typeof nodeProps["aria-label"] === "string" ? nodeProps["aria-label"] : undefined,
      isDisabled: Boolean(nodeProps.isDisabled),
    });
    itemIndex += 1;
  }

  return parsedItems;
}

function areItemArraysEqual(
  left: SpectrumActionGroupItemData[],
  right: SpectrumActionGroupItemData[]
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
      current["aria-label"] !== candidate["aria-label"] ||
      current.isDisabled !== candidate.isDisabled
    ) {
      return false;
    }
  }

  return true;
}

function createStaticActionBarComponent(name: string, props: Record<string, unknown>) {
  return defineComponent({
    name,
    props: props as any,
    setup() {
      return () => null;
    },
  });
}

export const ActionBarItem = createStaticActionBarComponent("ActionBarItem", {
  id: {
    type: [String, Number] as PropType<ActionGroupKey | undefined>,
    default: undefined,
  },
  "aria-label": {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  isDisabled: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined,
  },
});

export const ActionBar = defineComponent({
  name: "ActionBar",
  inheritAttrs: false,
  props: {
    selectedItemCount: {
      type: [String, Number] as PropType<number | "all" | undefined>,
      default: 0,
    },
    items: {
      type: Array as PropType<SpectrumActionGroupItemData[] | undefined>,
      default: undefined,
    },
    disabledKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<ActionGroupKey> | undefined>,
      default: undefined,
    },
    isEmphasized: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    buttonLabelBehavior: {
      type: String as PropType<ActionGroupButtonLabelBehavior | undefined>,
      default: undefined,
    },
    actionsLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    clearSelectionLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    selectedAllLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    selectedCountLabel: {
      type: Function as PropType<((count: number) => string) | undefined>,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<((key: ActionGroupKey) => void) | undefined>,
      default: undefined,
    },
    onClearSelection: {
      type: Function as PropType<(() => void) | undefined>,
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
  setup(props, { attrs, slots }) {
    const stringFormatter = useLocalizedStringFormatter(
      ACTIONBAR_INTL_MESSAGES,
      "@vue-spectrum/actionbar"
    );
    const resolvedProviderProps = computed(() =>
      useProviderProps(props as unknown as Record<string, unknown>)
    );
    const rootRef = ref<HTMLDivElement | null>(null);
    const restoreFocusRef = ref<HTMLElement | null>(null);
    const slotItems = ref<SpectrumActionGroupItemData[]>([]);

    const count = computed<number | "all">(() => {
      if (props.selectedItemCount === "all") {
        return "all";
      }

      return Math.max(0, Number(props.selectedItemCount ?? 0));
    });

    const isOpen = computed(
      () => count.value === "all" || (typeof count.value === "number" && count.value > 0)
    );
    const isMounted = ref(isOpen.value);
    const lastVisibleCount = ref<number | "all">(
      isOpen.value ? count.value : 0
    );

    watch(
      count,
      (nextCount) => {
        if (nextCount === "all" || nextCount > 0) {
          lastVisibleCount.value = nextCount;
        }
      },
      { immediate: true }
    );

    const displayCount = computed<number | "all">(() =>
      isOpen.value ? count.value : lastVisibleCount.value
    );

    const selectedLabel = computed(() => {
      if (displayCount.value === "all") {
        return props.selectedAllLabel ?? stringFormatter.value.format("selectedAll");
      }

      if (props.selectedCountLabel) {
        return props.selectedCountLabel(displayCount.value);
      }

      if (displayCount.value <= 0) {
        return stringFormatter.value.format("selectedNone");
      }

      const suffix = stringFormatter.value.format(
        displayCount.value === 1 ? "selectedSingular" : "selectedPlural"
      );
      return `${displayCount.value} ${suffix}`;
    });

    watch(isOpen, (nextOpen, previousOpen) => {
      if (nextOpen && !previousOpen) {
        isMounted.value = true;

        if (typeof document === "undefined") {
          return;
        }

        const activeElement = document.activeElement;
        if (
          activeElement instanceof HTMLElement &&
          !rootRef.value?.contains(activeElement)
        ) {
          restoreFocusRef.value = activeElement;
        }
        return;
      }

      if (!nextOpen && previousOpen) {
        const restoreTarget = restoreFocusRef.value;
        if (!restoreTarget || typeof document === "undefined") {
          return;
        }

        if (!document.contains(restoreTarget)) {
          restoreFocusRef.value = null;
          return;
        }

        void nextTick(() => {
          restoreTarget.focus();
        });
      }
    });

    return () => {
      if (!isMounted.value) {
        return null;
      }

      const attrsRecord = attrs as Record<string, unknown>;
      const styleInput = {
        ...attrsRecord,
        UNSAFE_className: props.UNSAFE_className,
        UNSAFE_style: props.UNSAFE_style,
      } as Record<string, unknown>;
      const { styleProps } = useStyleProps(styleInput);
      const domProps = filterDOMProps(attrsRecord);

      const isEmphasized =
        (resolvedProviderProps.value.isEmphasized as boolean | undefined) ??
        props.isEmphasized;

      if (!props.items) {
        const parsedItems = parseActionBarSlotItems(
          slots.default?.() as VNode[] | undefined
        );
        if (!areItemArraysEqual(parsedItems, slotItems.value)) {
          slotItems.value = parsedItems;
        }
      }

      const actionGroupNode = h(ActionGroup, {
        items: props.items ?? slotItems.value,
        disabledKeys: props.disabledKeys,
        onAction: props.onAction,
        isQuiet: true,
        staticColor: isEmphasized ? "white" : undefined,
        overflowMode: "collapse",
        buttonLabelBehavior: props.buttonLabelBehavior,
        ariaLabel: props.actionsLabel ?? stringFormatter.value.format("actions"),
        UNSAFE_className: classNames("react-spectrum-ActionBar-actionGroup"),
      });

      return h(
        OpenTransition,
        {
          in: isOpen.value,
          onExited: () => {
            if (!isOpen.value) {
              isMounted.value = false;
            }
          },
        },
        {
          default: (transitionProps: { isOpen: boolean }) =>
            h(
              "div",
              {
                ...domProps,
                ref: (value: unknown) => {
                  rootRef.value = value as HTMLDivElement | null;
                },
                class: classNames(
                  "react-spectrum-ActionBar",
                  {
                    "react-spectrum-ActionBar--emphasized": Boolean(isEmphasized),
                    "is-open": transitionProps.isOpen,
                    "is-closing": !transitionProps.isOpen,
                  },
                  styleProps.class as ClassValue | undefined,
                  domProps.class as ClassValue | undefined,
                  props.UNSAFE_className as ClassValue | undefined
                ),
                style: {
                  ...(styleProps.style ?? {}),
                  ...(props.UNSAFE_style ?? {}),
                },
                onKeydown: (event: KeyboardEvent) => {
                  if (event.key !== "Escape") {
                    return;
                  }

                  event.preventDefault();
                  props.onClearSelection?.();
                },
              },
              [
                h("div", { class: classNames("react-spectrum-ActionBar-bar") }, [
                  actionGroupNode,
                  h(
                    ActionButton,
                    {
                      "aria-label":
                        props.clearSelectionLabel ??
                        stringFormatter.value.format("clearSelection"),
                      isQuiet: true,
                      staticColor: isEmphasized ? "white" : undefined,
                      onPress: () => {
                        props.onClearSelection?.();
                      },
                    },
                    {
                      default: () =>
                        slots.clearButton?.() ??
                        stringFormatter.value.format("clear"),
                    }
                  ),
                  h(
                    Text,
                    {
                      UNSAFE_className: classNames("react-spectrum-ActionBar-selectedCount"),
                    },
                    {
                      default: () => selectedLabel.value,
                    }
                  ),
                ]),
                h(
                  "span",
                  {
                    class: classNames("react-spectrum-ActionBar-announcer"),
                    role: "status",
                    "aria-live": "polite",
                    "aria-atomic": "true",
                    style: SCREEN_READER_ONLY_STYLE,
                  },
                  selectedLabel.value
                ),
              ]
            ),
        }
      );
    };
  },
});
