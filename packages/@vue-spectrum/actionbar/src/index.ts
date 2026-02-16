import { FocusScope } from "@vue-aria/focus";
import { useKeyboard } from "@vue-aria/interactions";
import { announce as announceLive } from "@vue-aria/live-announcer";
import { filterDOMProps } from "@vue-aria/utils";
import { useProviderProps } from "@vue-spectrum/provider";
import { useStyleProps } from "@vue-spectrum/utils";
import { ActionButton } from "@vue-spectrum/button";
import { Text } from "@vue-spectrum/text";
import {
  computed,
  defineComponent,
  h,
  onMounted,
  ref,
  type PropType,
  type VNode,
} from "vue";
import type { SpectrumActionBarContainerProps, SpectrumActionBarProps } from "@vue-types/actionbar";
import { Key } from "@vue-types/shared";

type SelectedItemCount = number | "all";
interface ActionNode {
  key: Key;
  textValue: string;
  disabled: boolean;
  node?: VNode;
  onAction?: () => void;
  ariaLabel?: string;
}

function isRenderableNode(node: VNode): boolean {
  return typeof node.type !== "symbol";
}

function toVNodeArray(value: unknown): VNode[] {
  if (Array.isArray(value)) {
    return value.filter((node): node is VNode => isRenderableNode(node as VNode));
  }

  if (typeof value === "object" && value != null && "type" in (value as Record<string, unknown>)) {
    const vnode = value as VNode;
    return isRenderableNode(vnode) ? [vnode] : [];
  }

  return [];
}

function resolveVNodeChildren(vnode: VNode): unknown {
  const children = vnode.children;
  if (typeof children === "string" || typeof children === "number") {
    return children;
  }

  if (Array.isArray(children)) {
    return children;
  }

  if (children && typeof children === "object" && "default" in children) {
    return children.default?.();
  }

  return null;
}

function resolveTextValue({
  explicitTextValue,
  rendered,
  key,
}: {
  explicitTextValue?: string;
  rendered: unknown;
  key: Key;
}): string {
  if (explicitTextValue != null) {
    return explicitTextValue;
  }

  if (typeof rendered === "string" || typeof rendered === "number") {
    return String(rendered);
  }

  if (Array.isArray(rendered)) {
    const text = rendered
      .map((node) => {
        if (typeof node === "string" || typeof node === "number") {
          return String(node);
        }

        if (typeof node === "object" && node != null && "children" in (node as Record<string, unknown>)) {
          const children = (node as { children?: unknown }).children;
          if (typeof children === "string" || typeof children === "number") {
            return String(children);
          }
        }

        return "";
      })
      .join("")
      .trim();

    if (text) {
      return text;
    }
  }

  return String(key);
}

function normalizeChildren(children: VNode[], disabledKeys: Set<Key>): ActionNode[] {
  const nodes: ActionNode[] = [];
  let index = 0;

  for (const vnode of children) {
    if (!isRenderableNode(vnode)) {
      continue;
    }

    const props = (vnode.props ?? {}) as Record<string, unknown>;
    const key = (vnode.key as Key | undefined)
      ?? (typeof props.key === "string" || typeof props.key === "number" ? props.key : `action-${index}`);
    const rendered = resolveVNodeChildren(vnode);
    const textValue = resolveTextValue({
      explicitTextValue:
        typeof props.textValue === "string"
          ? props.textValue
          : undefined,
      rendered,
      key,
    });

    nodes.push({
      key,
      textValue,
      disabled: Boolean(props.disabled) || Boolean(props.isDisabled) || disabledKeys.has(key),
      node: vnode,
      onAction: typeof props.onAction === "function" ? props.onAction : undefined,
      ariaLabel:
        (typeof props["aria-label"] === "string" ? props["aria-label"] : undefined)
        ?? (typeof props.ariaLabel === "string" ? props.ariaLabel : undefined),
    });
    index += 1;
  }

  return nodes;
}

function normalizeItems(items: Iterable<unknown> | undefined, disabledKeys: Set<Key>): ActionNode[] {
  if (!items) {
    return [];
  }

  const nodes: ActionNode[] = [];
  let index = 0;

  for (const item of items) {
    if (item && typeof item === "object") {
      const node = item as Record<string, unknown>;
      const key = (typeof node.key === "string" || typeof node.key === "number")
        ? (node.key as Key)
        : (typeof node.id === "string" || typeof node.id === "number")
          ? (node.id as Key)
          : index;

      const textValue = String(
        node.textValue
        ?? node.label
        ?? node.name
        ?? key
      );
      nodes.push({
        key,
        textValue,
        disabled: Boolean(node.isDisabled) || disabledKeys.has(key),
        onAction: typeof node.onAction === "function" ? (node.onAction as () => void) : undefined,
      });
    } else {
      const key = index;
      nodes.push({
        key,
        textValue: String(item),
        disabled: false,
      });
    }

    index += 1;
  }

  return nodes;
}

const actionBarIntl = {
  "en-US": {
    actions: "Actions",
    clearSelection: "Clear selection",
    selected: (count: number) => `${count} selected`,
    selectedAll: "All selected",
    actionsAvailable: "Actions available.",
  },
};

type ActionBarMessageKey = keyof typeof actionBarIntl["en-US"];

function getActionBarText(key: "selected", count: number): string;
function getActionBarText(key: Exclude<ActionBarMessageKey, "selected">): string;
function getActionBarText(key: ActionBarMessageKey, count?: number): string {
  const message = actionBarIntl["en-US"][key];
  return typeof message === "function" ? message(count as number) : message;
}

/**
 * Container component that positions an ActionBar with a selection-enabled render target.
 */
export const ActionBarContainer = defineComponent({
  name: "SpectrumActionBarContainer",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const merged = useProviderProps(attrs as Record<string, unknown>) as Record<string, unknown> & SpectrumActionBarContainerProps;
    const { styleProps } = useStyleProps(merged);

    return () =>
      h(
        "div",
        {
          ...filterDOMProps(merged),
          ...styleProps.value,
          class: ["ActionBarContainer", styleProps.value.class, attrs.class],
        },
        slots.default?.() ?? []
      );
  },
});

/**
 * A compact action bar for selection-based workflows.
 */
export const ActionBar = defineComponent({
  name: "SpectrumActionBar",
  inheritAttrs: false,
  props: {
    children: {
      type: [Function, Array, Object] as PropType<SpectrumActionBarProps<object>["children"] | undefined>,
      required: false,
      default: undefined,
    },
    items: {
      type: Object as PropType<SpectrumActionBarProps<object>["items"]>,
      required: false,
      default: undefined,
    },
    disabledKeys: {
      type: Object as PropType<SpectrumActionBarProps<object>["disabledKeys"]>,
      required: false,
      default: undefined,
    },
    selectedItemCount: {
      type: [Number, String] as PropType<SelectedItemCount>,
      required: true,
    },
    onClearSelection: {
      type: Function as PropType<SpectrumActionBarProps<object>["onClearSelection"]>,
      required: true,
    },
    isEmphasized: {
      type: Boolean as PropType<SpectrumActionBarProps<object>["isEmphasized"]>,
      required: false,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<SpectrumActionBarProps<object>["onAction"]>,
      required: false,
      default: undefined,
    },
    buttonLabelBehavior: {
      type: String as PropType<SpectrumActionBarProps<object>["buttonLabelBehavior"]>,
      required: false,
      default: "collapse",
    },
    UNSAFE_className: String,
    UNSAFE_style: Object as PropType<Record<string, unknown> | undefined>,
  },
  setup(props, { attrs, slots }) {
    const merged = computed(() =>
      useProviderProps({
        ...attrs,
        ...props,
      } as Record<string, unknown>) as SpectrumActionBarProps<object> & Record<string, unknown>
    );
    const { styleProps } = useStyleProps(merged.value);
    const domRef = ref<HTMLElement | null>(null);
    const disabledKeys = computed(() => new Set(merged.value.disabledKeys ?? []));
    const isOpen = computed(() => merged.value.selectedItemCount !== 0);
    const { keyboardProps } = useKeyboard({
      onKeyDown: (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          merged.value.onClearSelection?.();
        }
      },
    });

    const actionNodes = computed(() => {
      const children = toVNodeArray(slots.default?.() ?? []);
      if (children.length > 0) {
        return normalizeChildren(children, disabledKeys.value);
      }

      if (typeof merged.value.children === "function") {
        const renderedChildren: VNode[] = [];
        const childrenRenderer = merged.value.children as (item: unknown) => unknown;
        const source = merged.value.items ? Array.from(merged.value.items as Iterable<unknown>) : [];

        for (const item of source) {
          renderedChildren.push(...toVNodeArray(childrenRenderer(item)));
        }

        return normalizeChildren(renderedChildren, disabledKeys.value);
      }

      return normalizeItems(merged.value.items, disabledKeys.value);
    });

    const selectedText = computed(() => {
      if (selectedItemCount.value === "all") {
        return getActionBarText("selectedAll");
      }

      return getActionBarText("selected", selectedItemCount.value as number);
    });

    const selectedItemCount = computed(() => merged.value.selectedItemCount as SelectedItemCount);
    const ariaLabel = computed(() => merged.value["aria-label"] ?? getActionBarText("actions"));

    const announceOnMount = () => {
      announceLive(getActionBarText("actionsAvailable"));
    };

    onMounted(() => {
      announceOnMount();
    });

    return () => {
      if (!isOpen.value) {
        return null;
      }

      const items = actionNodes.value;
      return h(
        FocusScope,
        { restoreFocus: true },
        {
          default: () =>
            h(
              "div",
              {
                ...filterDOMProps(merged.value, { labelable: true }),
                ...styleProps.value,
                ...keyboardProps,
                ref: domRef,
                class: [
                  "spectrum-ActionBar",
                  styleProps.value.class,
                  attrs.class,
                  {
                    "spectrum-ActionBar--emphasized": merged.value.isEmphasized,
                    "is-open": isOpen.value,
                  },
                ],
              },
              [
                h(
                  "div",
                  {
                    class: ["spectrum-ActionBar-actionGroup"],
                    role: "toolbar",
                    "aria-label": ariaLabel.value,
                  },
                  items.map((action) => {
                    const itemProps = action.node?.props as Record<string, unknown> | undefined;
                    const itemDomProps = itemProps ? filterDOMProps(itemProps) : {};
                    const isDisabled = action.disabled || Boolean(merged.value.isDisabled);
                    const content = action.node
                      ? toVNodeArray(resolveVNodeChildren(action.node))
                      : [action.textValue];
                    if (content.length === 0) {
                      content.push(action.textValue);
                    }

                    return h(
                      ActionButton,
                      {
                        key: `${action.key}:${isDisabled ? "disabled" : "enabled"}`,
                        ...itemDomProps,
                        isQuiet: true,
                        isDisabled,
                        disabled: isDisabled ? "disabled" : undefined,
                        staticColor: merged.value.isEmphasized ? "white" : undefined,
                        onPress: () => {
                          if (action.onAction) {
                            action.onAction();
                          }

                          merged.value.onAction?.(action.key);
                        },
                        "aria-label":
                          action.ariaLabel ?? action.textValue,
                      },
                      {
                        default: () => content,
                      }
                    );
                  }),
                  h(
                    ActionButton,
                    {
                      isQuiet: true,
                      onPress: () => {
                        merged.value.onClearSelection();
                      },
                      "aria-label": getActionBarText("clearSelection"),
                      staticColor: merged.value.isEmphasized ? "white" : undefined,
                    },
                    {
                      default: () => h("span", { "aria-hidden": "true" }, "✕"),
                    }
                  )
                ),
                h(
                  Text,
                  { as: "span", class: "spectrum-ActionBar-selectedCount" },
                  {
                    default: () => selectedText.value,
                  }
                ),
              ],
            )
        }
      );
    };
  },
});

/**
 * Action bar items. Children are rendered by `ActionBar`.
 */
export const Item = defineComponent({
  name: "SpectrumActionBarItem",
  props: {
    key: {
      type: [String, Number] as PropType<Key>,
      required: false,
    },
    textValue: {
      type: String,
      required: false,
    },
    isDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      required: false,
      default: undefined,
    },
    onAction: {
      type: Function as PropType<(() => void) | undefined>,
      required: false,
    },
    ariaLabel: {
      type: String,
      required: false,
    },
  },
  setup() {
    return () => null;
  },
});

(Item as any).__spectrumActionBarNodeType = "item";

export type {
  SpectrumActionBarContainerProps,
  SpectrumActionBarProps,
} from "@vue-types/actionbar";
