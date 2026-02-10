import {
  Comment,
  Fragment,
  Text,
  cloneVNode,
  computed,
  defineComponent,
  h,
  isVNode,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
  type VNode,
  type VNodeChild,
} from "vue";
import { useBreadcrumbs } from "@vue-aria/breadcrumbs";
import type { Key } from "@vue-aria/types";
import {
  filterDOMProps,
  handleLinkClick,
  mergeProps,
  useRouter,
  type RouterOptions,
} from "@vue-aria/utils";
import { useProviderProps } from "@vue-spectrum/provider";
import {
  classNames,
  useResizeObserver,
  useSlotProps,
  useStyleProps,
  type ClassValue,
} from "@vue-spectrum/utils";

const MIN_VISIBLE_ITEMS = 1;
const MAX_VISIBLE_ITEMS = 4;

export type SpectrumBreadcrumbsSize = "S" | "M" | "L";

export interface SpectrumBreadcrumbsProps {
  size?: SpectrumBreadcrumbsSize | undefined;
  isMultiline?: boolean | undefined;
  showRoot?: boolean | undefined;
  isDisabled?: boolean | undefined;
  autoFocusCurrent?: boolean | undefined;
  onAction?: ((key: Key) => void) | undefined;
  slot?: string | undefined;
  UNSAFE_className?: string | undefined;
  UNSAFE_style?: Record<string, string | number> | undefined;
}

interface BreadcrumbNode {
  key: Key;
  vnode: VNode;
}

interface BreadcrumbMenuEntry {
  type: "menu";
}

interface BreadcrumbItemEntry {
  type: "item";
  node: BreadcrumbNode;
}

type BreadcrumbEntry = BreadcrumbMenuEntry | BreadcrumbItemEntry;

function normalizeKey(value: unknown, index: number): Key {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  return index;
}

function flattenSlotChildren(
  value: VNodeChild | VNodeChild[] | undefined
): VNode[] {
  if (value === undefined || value === null || value === false || value === true) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((child) => flattenSlotChildren(child));
  }

  if (!isVNode(value)) {
    return [];
  }

  if (value.type === Comment) {
    return [];
  }

  if (value.type === Text) {
    return [];
  }

  if (value.type === Fragment) {
    return flattenSlotChildren((value.children as VNodeChild[] | undefined) ?? []);
  }

  return [value];
}

function resolveVNodeChildren(vnode: VNode): VNodeChild | VNodeChild[] | undefined {
  const children = vnode.children as unknown;

  if (typeof children === "function") {
    return (children as () => VNodeChild | VNodeChild[])();
  }

  if (children && typeof children === "object" && !Array.isArray(children)) {
    const defaultSlot = (children as { default?: () => VNodeChild | VNodeChild[] }).default;
    if (typeof defaultSlot === "function") {
      return defaultSlot();
    }
  }

  return children as VNodeChild | VNodeChild[] | undefined;
}

function normalizeRenderableChildren(
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

export const Breadcrumbs = defineComponent({
  name: "Breadcrumbs",
  inheritAttrs: false,
  props: {
    size: {
      type: String as PropType<SpectrumBreadcrumbsSize | undefined>,
      default: undefined,
    },
    isMultiline: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    showRoot: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    autoFocusCurrent: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<((key: Key) => void) | undefined>,
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
    const navRef = ref<HTMLElement | null>(null);
    const listRef = ref<HTMLUListElement | null>(null);
    const menuButtonRef = ref<HTMLButtonElement | null>(null);
    const menuOpen = ref(false);
    const visibleItems = ref(MAX_VISIBLE_ITEMS);
    const renderedSignature = ref("");
    const router = useRouter();

    let resolvedPropsSnapshot: Record<string, unknown> = {};
    let updateToken = 0;

    const { navProps } = useBreadcrumbs({
      "aria-label": computed(
        () => resolvedPropsSnapshot["aria-label"] as string | undefined
      ),
    });

    const collectBreadcrumbNodes = (): BreadcrumbNode[] => {
      const nodes = flattenSlotChildren(slots.default?.() ?? []);

      return nodes.map((vnode, index) => ({
        key: normalizeKey(vnode.key, index),
        vnode,
      }));
    };
    let latestChildNodes: BreadcrumbNode[] = [];

    const computeVisibleItems = (requestedVisibleItems: number): number => {
      const list = listRef.value;
      if (!list) {
        return requestedVisibleItems;
      }

      const items = Array.from(list.children) as HTMLElement[];
      if (items.length === 0) {
        return requestedVisibleItems;
      }

      const childCount = latestChildNodes.length;
      const showRoot = Boolean(props.showRoot);
      const multiline = Boolean(props.isMultiline);
      const containerWidth = list.offsetWidth;
      const isShowingMenu = childCount > requestedVisibleItems;

      let calculatedWidth = 0;
      let nextVisibleItems = 0;
      let maxVisibleItems = MAX_VISIBLE_ITEMS;

      if (showRoot) {
        const rootItem = items.shift();
        if (rootItem) {
          calculatedWidth += rootItem.offsetWidth;
          nextVisibleItems += 1;
        }
      }

      if (isShowingMenu) {
        const menuItem = items.shift();
        if (menuItem) {
          calculatedWidth += menuItem.offsetWidth;
          maxVisibleItems -= 1;
        }
      }

      if (showRoot && calculatedWidth >= containerWidth) {
        nextVisibleItems -= 1;
      }

      if (multiline) {
        if (items.length > 0) {
          items.pop();
          nextVisibleItems += 1;
        }
      } else if (items.length > 0) {
        const last = items.pop();
        if (last) {
          const previousOverflow = last.style.overflow;
          last.style.overflow = "visible";

          calculatedWidth += last.offsetWidth;
          if (calculatedWidth < containerWidth) {
            nextVisibleItems += 1;
          }

          last.style.overflow = previousOverflow;
        }
      }

      for (const breadcrumb of items.reverse()) {
        calculatedWidth += breadcrumb.offsetWidth;
        if (calculatedWidth < containerWidth) {
          nextVisibleItems += 1;
        }
      }

      return Math.max(
        MIN_VISIBLE_ITEMS,
        Math.min(maxVisibleItems, nextVisibleItems)
      );
    };

    const updateOverflow = async (): Promise<void> => {
      const token = ++updateToken;
      const childCount = latestChildNodes.length;

      if (childCount <= 0) {
        visibleItems.value = 0;
        return;
      }

      visibleItems.value = childCount;
      await nextTick();
      if (token !== updateToken) {
        return;
      }

      const nextVisibleItems = computeVisibleItems(childCount);
      visibleItems.value = nextVisibleItems;
      await nextTick();
      if (token !== updateToken) {
        return;
      }

      if (nextVisibleItems < childCount && nextVisibleItems > 1) {
        visibleItems.value = computeVisibleItems(nextVisibleItems);
      }
    };

    useResizeObserver({
      ref: listRef,
      onResize: () => {
        void updateOverflow();
      },
    });

    watch(
      [renderedSignature, () => props.showRoot, () => props.isMultiline],
      () => {
        void updateOverflow();
      },
      { immediate: true }
    );

    const closeMenuOnInteraction = (event: Event) => {
      if (!menuOpen.value) {
        return;
      }

      if (event.type === "keydown") {
        const keyboardEvent = event as KeyboardEvent;
        if (keyboardEvent.key === "Escape") {
          menuOpen.value = false;
          menuButtonRef.value?.focus();
        }
        return;
      }

      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (navRef.value?.contains(target)) {
        return;
      }

      menuOpen.value = false;
    };

    onMounted(() => {
      void updateOverflow();

      if (typeof document !== "undefined") {
        document.addEventListener("pointerdown", closeMenuOnInteraction, true);
        document.addEventListener("keydown", closeMenuOnInteraction, true);
      }
    });

    onBeforeUnmount(() => {
      if (typeof document !== "undefined") {
        document.removeEventListener("pointerdown", closeMenuOnInteraction, true);
        document.removeEventListener("keydown", closeMenuOnInteraction, true);
      }
    });

    expose({
      UNSAFE_getDOMNode: () => navRef.value,
      UNSAFE_remeasure: () => {
        void updateOverflow();
      },
    });

    return () => {
      const slotProps = useSlotProps(
        {
          ...(attrs as Record<string, unknown>),
          size: props.size,
          isMultiline: props.isMultiline,
          showRoot: props.showRoot,
          isDisabled: props.isDisabled,
          autoFocusCurrent: props.autoFocusCurrent,
          onAction: props.onAction,
          slot: props.slot,
          UNSAFE_className: props.UNSAFE_className,
          UNSAFE_style: props.UNSAFE_style,
        } as Record<string, unknown> & { id?: string; slot?: string },
        "breadcrumbs"
      );

      const resolvedProps = useProviderProps(slotProps);
      resolvedPropsSnapshot = resolvedProps;

      const { styleProps } = useStyleProps(resolvedProps);
      const domProps = filterDOMProps(resolvedProps as Record<string, unknown>);
      const childNodes = collectBreadcrumbNodes();
      latestChildNodes = childNodes;
      const signature = childNodes.map((entry) => String(entry.key)).join("|");
      if (signature !== renderedSignature.value) {
        renderedSignature.value = signature;
      }
      const selectedKey =
        childNodes.length > 0 ? childNodes[childNodes.length - 1]!.key : null;
      const onAction = resolvedProps.onAction as
        | ((key: Key) => void)
        | undefined;
      const isDisabled = Boolean(resolvedProps.isDisabled);
      const autoFocusCurrent = Boolean(resolvedProps.autoFocusCurrent);
      const size = (resolvedProps.size as SpectrumBreadcrumbsSize | undefined) ?? "L";

      const navClass = domProps.class as ClassValue | undefined;
      const navStyle = domProps.style as Record<string, string | number> | undefined;
      const navigationProps: Record<string, unknown> = {
        ...domProps,
      };
      delete navigationProps.class;
      delete navigationProps.style;

      let maxVisibleItems = visibleItems.value;
      if (childNodes.length > 0) {
        maxVisibleItems = Math.max(
          MIN_VISIBLE_ITEMS,
          Math.min(childNodes.length, maxVisibleItems)
        );
      }

      let contents: BreadcrumbEntry[] = childNodes.map((node) => ({
        type: "item",
        node,
      }));

      if (childNodes.length > maxVisibleItems) {
        const entries: BreadcrumbEntry[] = [{ type: "menu" }];
        const breadcrumbs = [...childNodes];
        let endItems = maxVisibleItems;

        if (resolvedProps.showRoot && maxVisibleItems > 1) {
          const root = breadcrumbs.shift();
          if (root) {
            entries.unshift({
              type: "item",
              node: root,
            });
          }
          endItems -= 1;
        }

        contents = [...entries, ...breadcrumbs.slice(-endItems).map((node) => ({
          type: "item" as const,
          node,
        }))];
      }

      const lastIndex = contents.length - 1;

      const menuItemNodes = childNodes.map((node, index) => {
        const nodeProps = (node.vnode.props ?? {}) as Record<string, unknown>;
        const href = nodeProps.href as string | undefined;
        const target = nodeProps.target as string | undefined;
        const rel = nodeProps.rel as string | undefined;
        const download = nodeProps.download as string | boolean | undefined;
        const routerOptions = nodeProps.routerOptions as RouterOptions | undefined;
        const isCurrent = node.key === selectedKey;
        const itemDisabled = isDisabled || isCurrent;
        const commonProps: Record<string, unknown> = {
          role: "menuitemradio",
          "aria-checked": isCurrent ? "true" : "false",
          "aria-disabled": itemDisabled || undefined,
          class: classNames("spectrum-Breadcrumbs-menuItem", {
            "is-selected": isCurrent,
            "is-disabled": itemDisabled,
          }),
          tabIndex: -1,
        };

        const content = normalizeRenderableChildren(resolveVNodeChildren(node.vnode));

        if (href) {
          return h(
            "li",
            {
              key: `menu-${String(node.key)}-${index}`,
              role: "none",
            },
            [
              h(
                "a",
                mergeProps(commonProps, {
                  href: router.useHref(href),
                  target,
                  rel,
                  download,
                  onClick: (event: MouseEvent) => {
                    if (itemDisabled) {
                      event.preventDefault();
                      return;
                    }

                    handleLinkClick(event, router, href, routerOptions);
                    menuOpen.value = false;
                    onAction?.(node.key);
                  },
                }),
                content
              ),
            ]
          );
        }

        return h(
          "li",
          {
            key: `menu-${String(node.key)}-${index}`,
            role: "none",
          },
          [
            h(
              "button",
              mergeProps(commonProps, {
                type: "button",
                disabled: itemDisabled,
                onClick: () => {
                  if (itemDisabled) {
                    return;
                  }

                  menuOpen.value = false;
                  onAction?.(node.key);
                },
              }),
              content
            ),
          ]
        );
      });

      const listChildren = contents.map((entry, index) => {
        const showSeparator = index !== lastIndex;

        if (entry.type === "menu") {
          return h(
            "li",
            {
              key: "breadcrumbs-menu",
              class: classNames("spectrum-Breadcrumbs-item"),
            },
            [
              h(
                "button",
                {
                  ref: (value: unknown) => {
                    menuButtonRef.value = value as HTMLButtonElement | null;
                  },
                  type: "button",
                  class: classNames("spectrum-Breadcrumbs-actionButton"),
                  "aria-label": "…",
                  "aria-haspopup": "menu",
                  "aria-expanded": menuOpen.value ? "true" : "false",
                  disabled: isDisabled,
                  onClick: () => {
                    if (isDisabled) {
                      return;
                    }
                    menuOpen.value = !menuOpen.value;
                  },
                },
                "…"
              ),
              showSeparator
                ? h(
                    "span",
                    {
                      class: classNames("spectrum-Breadcrumbs-itemSeparator"),
                      "aria-hidden": "true",
                    },
                    "›"
                  )
                : null,
              menuOpen.value
                ? h(
                    "ul",
                    {
                      role: "menu",
                      class: classNames("spectrum-Breadcrumbs-menu"),
                    },
                    menuItemNodes
                  )
                : null,
            ]
          );
        }

        const isCurrent = index === lastIndex;

        return h(
          "li",
          {
            key: `breadcrumbs-item-${String(entry.node.key)}-${index}`,
            class: classNames("spectrum-Breadcrumbs-item"),
          },
          [
            cloneVNode(entry.node.vnode, {
              key: entry.node.key,
              isCurrent,
              isDisabled,
              autoFocus: isCurrent && autoFocusCurrent,
              showSeparator,
              onPress: () => {
                onAction?.(entry.node.key);
              },
            }),
          ]
        );
      });

      return h(
        "nav",
        mergeProps(navigationProps, navProps.value, {
          ref: (value: unknown) => {
            navRef.value = value as HTMLElement | null;
          },
          style: {
            ...(styleProps.style ?? {}),
            ...(navStyle ?? {}),
          },
        }),
        [
          h(
            "ul",
            {
              ref: (value: unknown) => {
                listRef.value = value as HTMLUListElement | null;
              },
              class: classNames(
                "spectrum-Breadcrumbs",
                {
                  "spectrum-Breadcrumbs--small": size === "S",
                  "spectrum-Breadcrumbs--medium": size === "M",
                  "spectrum-Breadcrumbs--multiline": Boolean(
                    resolvedProps.isMultiline
                  ),
                  "spectrum-Breadcrumbs--showRoot": Boolean(
                    resolvedProps.showRoot
                  ),
                  "is-disabled": isDisabled,
                },
                styleProps.class as ClassValue | undefined,
                navClass,
                resolvedProps.UNSAFE_className as ClassValue | undefined
              ),
            },
            listChildren
          ),
        ]
      );
    };
  },
});
