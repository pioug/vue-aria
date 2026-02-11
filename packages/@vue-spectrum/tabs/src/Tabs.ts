import {
  computed,
  defineComponent,
  h,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
  type Ref,
  type InjectionKey,
  type PropType,
  type VNodeChild,
} from "vue";
import { useFocusRing } from "@vue-aria/focus";
import { useHover } from "@vue-aria/interactions";
import { useId } from "@vue-aria/ssr";
import {
  useTab,
  useTabList,
  useTabListState,
  useTabPanel,
  type TabListItem,
  type UseTabListStateResult,
} from "@vue-aria/tabs";
import type { Key, ReadonlyRef } from "@vue-aria/types";
import { filterDOMProps, mergeProps } from "@vue-aria/utils";
import { useProviderContext } from "@vue-spectrum/provider";
import { classNames, useResizeObserver, type ClassValue } from "@vue-spectrum/utils";
import { Picker } from "@vue-spectrum/picker";

export type TabsOrientation = "horizontal" | "vertical";
export type TabsKeyboardActivation = "automatic" | "manual";
export type TabsDensity = "regular" | "compact";

export interface SpectrumTabItem extends TabListItem {
  title?: string | undefined;
  children?: VNodeChild | VNodeChild[] | undefined;
  href?: string | undefined;
}

export interface SpectrumTabsProps {
  items?: SpectrumTabItem[] | undefined;
  orientation?: TabsOrientation | undefined;
  keyboardActivation?: TabsKeyboardActivation | undefined;
  selectedKey?: Key | null | undefined;
  defaultSelectedKey?: Key | null | undefined;
  disabledKeys?: Iterable<Key> | undefined;
  isDisabled?: boolean | undefined;
  onSelectionChange?: ((key: Key) => void) | undefined;
  density?: TabsDensity | undefined;
  isQuiet?: boolean | undefined;
  isEmphasized?: boolean | undefined;
  "aria-label"?: string | undefined;
  "aria-labelledby"?: string | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export interface SpectrumTabListProps {
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

export interface SpectrumTabPanelsProps {
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

interface TabsContextValue {
  state: UseTabListStateResult<SpectrumTabItem>;
  collection: ReadonlyRef<SpectrumTabItem[]>;
  orientation: ReadonlyRef<TabsOrientation>;
  direction: ReadonlyRef<"ltr" | "rtl">;
  keyboardActivation: ReadonlyRef<TabsKeyboardActivation>;
  isQuiet: ReadonlyRef<boolean>;
  isEmphasized: ReadonlyRef<boolean>;
  density: ReadonlyRef<TabsDensity>;
  ariaLabel: ReadonlyRef<string | undefined>;
  ariaLabelledby: ReadonlyRef<string | undefined>;
  collapsedPanelLabelledby: Ref<string | undefined>;
}

const TABS_CONTEXT_SYMBOL: InjectionKey<TabsContextValue> = Symbol(
  "VUE_SPECTRUM_TABS_CONTEXT"
);

function normalizeItems(items: SpectrumTabItem[] | undefined): SpectrumTabItem[] {
  if (!items) {
    return [];
  }

  return items.map((item, index) => ({
    ...item,
    key: item.key ?? index,
  }));
}

function normalizeRenderable(
  value: VNodeChild | VNodeChild[] | undefined
): VNodeChild[] {
  if (value === undefined || value === null || value === false || value === true) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return [value];
}

function useTabsContext(componentName: string): TabsContextValue {
  const context = inject(TABS_CONTEXT_SYMBOL, null);
  if (!context) {
    throw new Error(`${componentName} must be used within Tabs.`);
  }

  return context;
}

const TabButton = defineComponent({
  name: "SpectrumTabsButton",
  inheritAttrs: false,
  props: {
    item: {
      type: Object as PropType<SpectrumTabItem>,
      required: true,
    },
  },
  setup(props, { slots }) {
    const context = useTabsContext("TabList");
    const tabRef = ref<HTMLElement | null>(null);
    const { tabProps, isSelected, isDisabled, isPressed } = useTab(
      {
        key: props.item.key,
        isDisabled: computed(() => props.item.isDisabled),
      },
      context.state,
      tabRef
    );
    const { hoverProps, isHovered } = useHover({
      isDisabled,
    });
    const focusRing = useFocusRing();

    return () => {
      const rendered =
        slots.default?.({ item: props.item }) ?? props.item.title ?? String(props.item.key);
      const content = normalizeRenderable(rendered);
      const elementType = props.item.href ? "a" : "button";

      return h(
        elementType,
        mergeProps(tabProps.value, hoverProps, focusRing.focusProps, {
          ref: (value: unknown) => {
            tabRef.value = value as HTMLElement | null;
          },
          type: elementType === "button" ? "button" : undefined,
          href: props.item.href,
          class: classNames("spectrum-Tabs-item", {
            "is-selected": isSelected.value,
            "is-disabled": isDisabled.value,
            "is-hovered": isHovered.value,
            "is-active": isPressed.value,
            "focus-ring": focusRing.isFocusVisible.value,
          }),
        }),
        [
          h(
            "span",
            {
              class: classNames("spectrum-Tabs-itemLabel"),
            },
            content
          ),
        ]
      );
    };
  },
});

export const Tabs = defineComponent({
  name: "Tabs",
  inheritAttrs: false,
  props: {
    items: {
      type: Array as PropType<SpectrumTabItem[] | undefined>,
      default: undefined,
    },
    orientation: {
      type: String as PropType<TabsOrientation | undefined>,
      default: undefined,
    },
    keyboardActivation: {
      type: String as PropType<TabsKeyboardActivation | undefined>,
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
    disabledKeys: {
      type: [Array, Set] as unknown as PropType<Iterable<Key> | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    onSelectionChange: {
      type: Function as PropType<((key: Key) => void) | undefined>,
      default: undefined,
    },
    density: {
      type: String as PropType<TabsDensity | undefined>,
      default: undefined,
    },
    isQuiet: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isEmphasized: {
      type: Boolean as PropType<boolean | undefined>,
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
  setup(props, { attrs, slots, expose }) {
    const provider = useProviderContext();
    const elementRef = ref<HTMLElement | null>(null);

    const collection = computed(() => normalizeItems(props.items));
    const orientation = computed<TabsOrientation>(
      () => props.orientation ?? "horizontal"
    );
    const direction = computed<"ltr" | "rtl">(
      () => (provider?.value.direction as "ltr" | "rtl" | undefined) ?? "ltr"
    );
    const keyboardActivation = computed<TabsKeyboardActivation>(
      () => props.keyboardActivation ?? "automatic"
    );
    const isQuiet = computed(() => props.isQuiet ?? provider?.value.isQuiet ?? false);
    const isEmphasized = computed(
      () => props.isEmphasized ?? provider?.value.isEmphasized ?? false
    );
    const density = computed<TabsDensity>(() => props.density ?? "regular");
    const isDisabled = computed(
      () => props.isDisabled ?? provider?.value.isDisabled ?? false
    );
    const ariaLabel = computed(() => {
      const propsRecord = props as unknown as Record<string, unknown>;
      const attrsRecord = attrs as Record<string, unknown>;
      return (
        props["aria-label"] ??
        (propsRecord.ariaLabel as string | undefined) ??
        (attrsRecord["aria-label"] as string | undefined) ??
        (attrsRecord.ariaLabel as string | undefined)
      );
    });
    const ariaLabelledby = computed(() => {
      const propsRecord = props as unknown as Record<string, unknown>;
      const attrsRecord = attrs as Record<string, unknown>;
      return (
        props["aria-labelledby"] ??
        (propsRecord.ariaLabelledby as string | undefined) ??
        (attrsRecord["aria-labelledby"] as string | undefined) ??
        (attrsRecord.ariaLabelledby as string | undefined)
      );
    });
    const collapsedPanelLabelledby = ref<string | undefined>(undefined);

    const state = useTabListState<SpectrumTabItem>({
      collection,
      selectedKey:
        props.selectedKey !== undefined
          ? computed(() => props.selectedKey)
          : undefined,
      defaultSelectedKey:
        props.defaultSelectedKey !== undefined
          ? computed(() => props.defaultSelectedKey)
          : undefined,
      disabledKeys:
        props.disabledKeys !== undefined
          ? computed(() => props.disabledKeys)
          : undefined,
      isDisabled,
      onSelectionChange: (key) => {
        props.onSelectionChange?.(key);
      },
    });

    provide(TABS_CONTEXT_SYMBOL, {
      state,
      collection,
      orientation,
      direction,
      keyboardActivation,
      isQuiet,
      isEmphasized,
      density,
      ariaLabel,
      ariaLabelledby,
      collapsedPanelLabelledby,
    });

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
    });

    return () => {
      const domProps = filterDOMProps({
        ...(attrs as Record<string, unknown>),
      });
      delete domProps["aria-label"];
      delete domProps["aria-labelledby"];

      return h(
        "div",
        mergeProps(domProps, {
          ref: (value: unknown) => {
            elementRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "spectrum-TabsPanel",
            `spectrum-TabsPanel--${orientation.value}`,
            props.UNSAFE_className as ClassValue | undefined,
            domProps.class as ClassValue | undefined
          ),
          style: {
            ...(props.UNSAFE_style ?? {}),
            ...((domProps.style as Record<string, string | number> | undefined) ?? {}),
          },
        }),
        slots.default?.()
      );
    };
  },
});

export const TabList = defineComponent({
  name: "TabList",
  inheritAttrs: false,
  props: {
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
    const context = useTabsContext("TabList");
    const elementRef = ref<HTMLElement | null>(null);
    const wrapperRef = ref<HTMLElement | null>(null);
    const isCollapsed = ref(false);
    const selectionIndicatorStyle = ref<{
      transform?: string | undefined;
      width?: string | undefined;
      height?: string | undefined;
    }>({});
    const collapsePickerId = useId(undefined, "v-spectrum-tabs-picker");
    const collapsePickerLabelId = useId(undefined, "v-spectrum-tabs-picker-label");
    const shouldCollapse = computed(
      () => context.orientation.value !== "vertical" && isCollapsed.value
    );
    const collapsePickerAriaLabelledby = computed(() => {
      const ids: string[] = [];
      if (context.ariaLabel.value) {
        ids.push(collapsePickerLabelId.value);
      }
      ids.push(collapsePickerId.value);
      if (context.ariaLabelledby.value) {
        ids.push(context.ariaLabelledby.value);
      }

      return ids.join(" ");
    });

    const { tabListProps } = useTabList(
      {
        orientation: context.orientation,
        keyboardActivation: context.keyboardActivation,
        "aria-label": context.ariaLabel,
        "aria-labelledby": context.ariaLabelledby,
      },
      context.state
    );

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
    });

    const checkShouldCollapse = () => {
      if (context.orientation.value === "vertical") {
        isCollapsed.value = false;
        return;
      }

      const wrapperElement = wrapperRef.value;
      const tabListElement = elementRef.value;
      if (!wrapperElement || !tabListElement) {
        isCollapsed.value = false;
        return;
      }

      isCollapsed.value = tabListElement.scrollWidth > wrapperElement.clientWidth + 1;
    };

    const updateSelectionIndicator = () => {
      if (shouldCollapse.value) {
        selectionIndicatorStyle.value = {};
        return;
      }

      const selectedKey = context.state.selectedKey.value;
      const tabListElement = elementRef.value;
      if (!tabListElement || selectedKey === null) {
        selectionIndicatorStyle.value = {};
        return;
      }

      const selectedTab = Array.from(
        tabListElement.querySelectorAll<HTMLElement>("[data-v-aria-tab-key]")
      ).find(
        (tab) => tab.getAttribute("data-v-aria-tab-key") === String(selectedKey)
      );
      if (!selectedTab) {
        selectionIndicatorStyle.value = {};
        return;
      }

      if (context.orientation.value === "vertical") {
        selectionIndicatorStyle.value = {
          transform: `translateY(${selectedTab.offsetTop}px)`,
          height: `${selectedTab.offsetHeight}px`,
        };
        return;
      }

      const offsetParentWidth =
        (selectedTab.offsetParent as HTMLElement | null)?.offsetWidth ?? 0;
      const offset =
        context.direction.value === "rtl"
          ? -1 * (offsetParentWidth - selectedTab.offsetWidth - selectedTab.offsetLeft)
          : selectedTab.offsetLeft;

      selectionIndicatorStyle.value = {
        transform: `translateX(${offset}px)`,
        width: `${selectedTab.offsetWidth}px`,
      };
    };

    onMounted(() => {
      if (typeof window !== "undefined") {
        window.addEventListener("resize", checkShouldCollapse);
        window.addEventListener("resize", updateSelectionIndicator);
      }

      void nextTick(() => {
        checkShouldCollapse();
        updateSelectionIndicator();
      });
    });

    onBeforeUnmount(() => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", checkShouldCollapse);
        window.removeEventListener("resize", updateSelectionIndicator);
      }

      context.collapsedPanelLabelledby.value = undefined;
    });

    useResizeObserver({
      ref: wrapperRef,
      onResize: () => {
        checkShouldCollapse();
        updateSelectionIndicator();
      },
    });

    watch(
      [
        () => context.collection.value.length,
        () => context.state.selectedKey.value,
        () => context.orientation.value,
      ],
      () => {
        void nextTick(() => {
          checkShouldCollapse();
          updateSelectionIndicator();
        });
      },
      { immediate: true }
    );

    watch(
      shouldCollapse,
      (collapsed) => {
        context.collapsedPanelLabelledby.value = collapsed
          ? collapsePickerId.value
          : undefined;
      },
      { immediate: true }
    );

    watch(
      [
        () => context.state.selectedKey.value,
        shouldCollapse,
        () => context.orientation.value,
        () => context.direction.value,
      ],
      () => {
        void nextTick(() => {
          updateSelectionIndicator();
        });
      },
      { immediate: true }
    );

    return () => {
      const domProps = filterDOMProps({
        ...(attrs as Record<string, unknown>),
      });
      const tabItems = context.collection.value.map((item) => ({
        key: item.key,
        label: item.title ?? String(item.key),
        isDisabled: context.state.isKeyDisabled(item.key),
      }));
      const selectedPickerKey =
        context.state.selectedKey.value === null
          ? undefined
          : context.state.selectedKey.value;

      const tabListContent = h(
        "div",
        mergeProps(domProps, tabListProps.value, {
          ref: (value: unknown) => {
            elementRef.value = value as HTMLElement | null;
          },
          "aria-hidden": shouldCollapse.value ? "true" : undefined,
          class: classNames(
            "spectrum-Tabs",
            `spectrum-Tabs--${context.orientation.value}`,
            {
              "spectrum-Tabs--quiet": context.isQuiet.value,
              "spectrum-Tabs--emphasized": context.isEmphasized.value,
              "spectrum-Tabs--compact": context.density.value === "compact",
            },
            props.UNSAFE_className as ClassValue | undefined,
            domProps.class as ClassValue | undefined
          ),
          style: {
            ...(props.UNSAFE_style ?? {}),
            ...((domProps.style as Record<string, string | number> | undefined) ?? {}),
            ...(shouldCollapse.value
              ? {
                  maxWidth: "calc(100% + 1px)",
                  overflow: "hidden",
                  visibility: "hidden",
                  position: "absolute",
                }
              : {}),
          },
        }),
        [
          ...context.collection.value.map((item) =>
            h(
              TabButton,
              {
                key: item.key,
                item,
              },
              {
                default: slots.default,
              }
            )
          ),
          h("div", {
            class: classNames("spectrum-Tabs-selectionIndicator"),
            role: "presentation",
            style: selectionIndicatorStyle.value,
          }),
        ]
      );

      if (context.orientation.value === "vertical") {
        return tabListContent;
      }

      return h(
        "div",
        {
          ref: (value: unknown) => {
            wrapperRef.value = value as HTMLElement | null;
          },
          class: classNames("spectrum-TabsPanel-collapseWrapper"),
        },
        [
          context.ariaLabel.value
            ? h(
                "span",
                {
                  id: collapsePickerLabelId.value,
                  style: {
                    position: "absolute",
                    width: "1px",
                    height: "1px",
                    margin: "-1px",
                    padding: "0",
                    overflow: "hidden",
                    clip: "rect(0, 0, 0, 0)",
                    whiteSpace: "nowrap",
                    border: "0",
                  },
                },
                context.ariaLabel.value
              )
            : null,
          h(Picker, {
            id: collapsePickerId.value,
            ariaLabelledby: collapsePickerAriaLabelledby.value,
            "aria-labelledby": collapsePickerAriaLabelledby.value,
            items: tabItems,
            selectedKey: selectedPickerKey as string | number | undefined,
            isDisabled: !shouldCollapse.value,
            UNSAFE_className: classNames("spectrum-Tabs-picker", {
              "spectrum-Tabs--isCollapsed": shouldCollapse.value,
            }),
            UNSAFE_style: shouldCollapse.value
              ? undefined
              : {
                  visibility: "hidden",
                  position: "absolute",
                },
            onSelectionChange: (key) => {
              context.state.setSelectedKey(key);
            },
          }),
          tabListContent,
        ]
      );
    };
  },
});

export const TabPanels = defineComponent({
  name: "TabPanels",
  inheritAttrs: false,
  props: {
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
    const context = useTabsContext("TabPanels");
    const elementRef = ref<HTMLElement | null>(null);

    const { tabPanelProps } = useTabPanel({}, context.state, elementRef);

    expose({
      UNSAFE_getDOMNode: () => elementRef.value,
    });

    return () => {
      const domProps = filterDOMProps({
        ...(attrs as Record<string, unknown>),
      });
      const selectedKey = context.state.selectedKey.value;
      const selectedItem =
        selectedKey === null ? undefined : context.state.getItem(selectedKey);

      const rendered =
        selectedItem === undefined
          ? []
          : normalizeRenderable(
              slots.default?.({ item: selectedItem }) ?? selectedItem.children
            );
      const panelAriaLabelledby =
        context.collapsedPanelLabelledby.value ??
        (tabPanelProps.value["aria-labelledby"] as string | undefined);

      return h(
        "div",
        mergeProps(domProps, tabPanelProps.value, {
          "aria-labelledby": panelAriaLabelledby,
          ref: (value: unknown) => {
            elementRef.value = value as HTMLElement | null;
          },
          class: classNames(
            "spectrum-TabsPanel-tabpanel",
            props.UNSAFE_className as ClassValue | undefined,
            domProps.class as ClassValue | undefined
          ),
          style: {
            ...(props.UNSAFE_style ?? {}),
            ...((domProps.style as Record<string, string | number> | undefined) ?? {}),
          },
        }),
        rendered
      );
    };
  },
});
