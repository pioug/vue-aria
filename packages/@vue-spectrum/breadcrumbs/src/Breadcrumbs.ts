import { useBreadcrumbs } from "@vue-aria/breadcrumbs";
import { ActionButton } from "@vue-spectrum/button";
import { Menu, MenuTrigger, Item as MenuItemNode } from "@vue-spectrum/menu";
import { useProviderProps } from "@vue-spectrum/provider";
import { useResizeObserver, useStyleProps, useValueEffect } from "@vue-spectrum/utils";
import { computed, defineComponent, h, nextTick, onMounted, ref, watch, type PropType, type VNode } from "vue";
import { BreadcrumbItem } from "./BreadcrumbItem";
import { Item } from "./Item";
import type { SpectrumBreadcrumbsProps, SpectrumItemProps } from "./types";

const MIN_VISIBLE_ITEMS = 1;
const MAX_VISIBLE_ITEMS = 4;

function isRenderableNode(node: VNode): boolean {
  return typeof node.type !== "symbol";
}

function resolveContentText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => resolveContentText(entry)).join("");
  }

  if (value && typeof value === "object" && "children" in value) {
    return resolveContentText((value as { children?: unknown }).children);
  }

  return "";
}

function resolveActionKey(key: unknown, fallback: number): string | number {
  if (typeof key === "string" || typeof key === "number") {
    return key;
  }

  return fallback;
}

/**
 * Breadcrumbs show hierarchy and navigational context.
 */
export const Breadcrumbs = defineComponent({
  name: "SpectrumBreadcrumbs",
  inheritAttrs: false,
  props: {
    size: {
      type: String as () => SpectrumBreadcrumbsProps["size"],
      required: false,
      default: "L",
    },
    isMultiline: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    showRoot: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    isDisabled: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    autoFocusCurrent: {
      type: Boolean as () => boolean | undefined,
      required: false,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<((key: string | number) => void) | undefined>,
      required: false,
    },
    id: {
      type: String,
      required: false,
    },
    UNSAFE_className: {
      type: String,
      required: false,
    },
    UNSAFE_style: {
      type: Object as () => Record<string, unknown> | undefined,
      required: false,
    },
  },
  setup(props, { attrs, slots, expose }) {
    const domRef = ref<HTMLElement | null>(null);
    const listRef = ref<HTMLUListElement | null>(null);
    const merged = useProviderProps({
      ...props,
      ...attrs,
    } as Record<string, unknown>) as SpectrumBreadcrumbsProps & Record<string, unknown>;
    const { navProps } = useBreadcrumbs(merged);
    const { styleProps } = useStyleProps(merged);

    const childArray = computed(() => {
      const nodes = slots.default?.() ?? [];
      const valid = nodes.filter((child): child is VNode => isRenderableNode(child));
      return valid;
    });
    const [visibleItems, setVisibleItems] = useValueEffect<number>(() => childArray.value.length);

    const resolveChildContent = (child: VNode): unknown => {
      if (typeof child.children === "object" && child.children && "default" in child.children) {
        return (child.children as { default?: () => unknown }).default?.();
      }

      return child.children;
    };

    const computeVisibleItems = (currentVisibleItems: number): number => {
      const currentListRef = listRef.value;
      if (!currentListRef) {
        return currentVisibleItems;
      }

      const listItems = Array.from(currentListRef.children) as HTMLLIElement[];
      if (listItems.length <= 0) {
        return currentVisibleItems;
      }

      const containerWidth = currentListRef.offsetWidth;
      if (containerWidth <= 0) {
        return Math.min(MAX_VISIBLE_ITEMS, childArray.value.length);
      }

      const isShowingMenu = childArray.value.length > currentVisibleItems;
      let calculatedWidth = 0;
      let newVisibleItems = 0;
      let maxVisibleItems = MAX_VISIBLE_ITEMS;

      if (merged.showRoot) {
        const rootItem = listItems.shift();
        if (rootItem) {
          calculatedWidth += rootItem.offsetWidth;
          newVisibleItems += 1;
        }
      }

      if (isShowingMenu) {
        const menuItem = listItems.shift();
        if (menuItem) {
          calculatedWidth += menuItem.offsetWidth;
          maxVisibleItems -= 1;
        }
      }

      if (merged.showRoot && calculatedWidth >= containerWidth) {
        newVisibleItems -= 1;
      }

      if (merged.isMultiline) {
        listItems.pop();
        newVisibleItems += 1;
      } else if (listItems.length > 0) {
        const last = listItems.pop();
        if (last) {
          // Ensure the final breadcrumb is fully measured before truncation logic runs.
          last.style.overflow = "visible";
          calculatedWidth += last.offsetWidth;
          if (calculatedWidth < containerWidth) {
            newVisibleItems += 1;
          }
          last.style.overflow = "";
        }
      }

      for (const breadcrumb of listItems.reverse()) {
        calculatedWidth += breadcrumb.offsetWidth;
        if (calculatedWidth < containerWidth) {
          newVisibleItems += 1;
        }
      }

      return Math.max(MIN_VISIBLE_ITEMS, Math.min(maxVisibleItems, newVisibleItems));
    };

    const updateOverflow = () => {
      setVisibleItems(function* () {
        yield childArray.value.length;

        const nextVisibleItems = computeVisibleItems(childArray.value.length);
        yield nextVisibleItems;

        if (nextVisibleItems < childArray.value.length && nextVisibleItems > 1) {
          yield computeVisibleItems(nextVisibleItems);
        }
      });
    };

    useResizeObserver({
      ref: domRef,
      onResize: updateOverflow,
    });

    watch(
      () => [childArray.value.length, Boolean(merged.showRoot), Boolean(merged.isMultiline)],
      () => {
        void nextTick(() => {
          updateOverflow();
        });
      },
      {
        flush: "post",
        immediate: true,
      }
    );

    onMounted(() => {
      updateOverflow();
    });

    expose({
      UNSAFE_getDOMNode: () => domRef.value,
      focus: () => domRef.value?.focus(),
    });

    return () => {
      let contents = childArray.value;
      if (childArray.value.length > visibleItems.value) {
        const selectedItem = childArray.value[childArray.value.length - 1];
        const selectedKey = resolveActionKey(selectedItem?.key, childArray.value.length - 1);

        const overflowMenu = h(
          Item as any,
          {
            key: "overflow-menu",
            isMenu: true,
          },
          {
            default: () => [
              h(
                MenuTrigger as any,
                null,
                {
                  default: () => [
                    h(
                      ActionButton as any,
                      {
                        UNSAFE_className: "spectrum-Breadcrumbs-actionButton",
                        "aria-label": "…",
                        isQuiet: true,
                        isDisabled: Boolean(merged.isDisabled),
                      },
                      {
                        default: () => h("span", { "aria-hidden": "true" }, "⋯"),
                      }
                    ),
                    h(
                      Menu as any,
                      {
                        selectionMode: "single",
                        selectedKeys: new Set([selectedKey]),
                        onAction: (key: string | number) => {
                          if (key !== selectedKey) {
                            merged.onAction?.(key);
                          }
                        },
                      },
                      {
                        default: () =>
                          childArray.value.map((child, index) => {
                            const childProps = (child.props ?? {}) as Record<string, unknown>;
                            const childContent = resolveChildContent(child);
                            const itemKey = resolveActionKey(child.key, index);
                            const textValue = (
                              typeof childProps.textValue === "string"
                                ? childProps.textValue
                                : resolveContentText(childContent).trim()
                            ) || String(itemKey);

                            return h(
                              MenuItemNode as any,
                              {
                                key: itemKey,
                                textValue,
                                href: typeof childProps.href === "string" ? childProps.href : undefined,
                                routerOptions: childProps.routerOptions,
                                isDisabled: Boolean(merged.isDisabled),
                              },
                              {
                                default: () => childContent,
                              }
                            );
                          }),
                      }
                    ),
                  ],
                }
              ),
            ],
          }
        );

        contents = [overflowMenu];
        const breadcrumbs = [...childArray.value];
        let endItems = visibleItems.value;
        if (merged.showRoot && visibleItems.value > 1) {
          const rootItem = breadcrumbs.shift();
          if (rootItem) {
            contents.unshift(rootItem);
          }
          endItems -= 1;
        }
        contents.push(...breadcrumbs.slice(-endItems));
      }

      const lastIndex = contents.length - 1;

      return h(
        "nav",
        {
          ...styleProps.value,
          ...navProps,
          ref: domRef,
        },
        [
          h(
            "ul",
            {
              ref: listRef,
              class: [
                "spectrum-Breadcrumbs",
                {
                  "spectrum-Breadcrumbs--small": merged.size === "S",
                  "spectrum-Breadcrumbs--medium": merged.size === "M",
                  "spectrum-Breadcrumbs--multiline": Boolean(merged.isMultiline),
                  "spectrum-Breadcrumbs--showRoot": Boolean(merged.showRoot),
                  "is-disabled": Boolean(merged.isDisabled),
                },
                merged.UNSAFE_className,
                styleProps.value.class,
              ],
            },
            contents.map((child, index) => {
              const itemProps = (child.props ?? {}) as SpectrumItemProps & Record<string, unknown>;
              const childContent = resolveChildContent(child);
              const key = resolveActionKey(child.key, index);
              const isCurrent = index === lastIndex;
              const onPress = () => merged.onAction?.(key);
              return h(
                "li",
                {
                  key: String(key),
                  class: "spectrum-Breadcrumbs-item",
                },
                [
                  h(
                    BreadcrumbItem as any,
                    {
                      ...itemProps,
                      key,
                      isCurrent,
                      isDisabled: merged.isDisabled,
                      onPress,
                      autoFocus: isCurrent && Boolean(merged.autoFocusCurrent),
                    },
                    {
                      default: () => childContent,
                    }
                  ),
                ]
              );
            })
          ),
        ]
      );
    };
  },
});
