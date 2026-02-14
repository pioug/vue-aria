import { computed, defineComponent, h, provide, ref, type VNode } from "vue";
import { DialogHeaderContext } from "./context";

function normalizeClassNames(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    return value.split(/\s+/).filter(Boolean);
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => normalizeClassNames(entry));
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([className]) => className);
  }

  return [];
}

function isVNode(value: unknown): value is VNode {
  return Boolean(value && typeof value === "object" && "type" in (value as Record<string, unknown>));
}

function vnodeHasClass(vnode: VNode, className: string): boolean {
  const propsClass = normalizeClassNames((vnode.props as Record<string, unknown> | null)?.class);
  if (propsClass.includes(className)) {
    return true;
  }

  if (Array.isArray(vnode.children)) {
    return vnode.children.some((child) => isVNode(child) && vnodeHasClass(child, className));
  }

  return false;
}

function vnodeIncludesComponent(vnode: VNode, componentName: string): boolean {
  const type = vnode.type as { name?: string } | string | symbol;
  if (typeof type === "object" && type?.name === componentName) {
    return true;
  }

  if (Array.isArray(vnode.children)) {
    return vnode.children.some((child) => isVNode(child) && vnodeIncludesComponent(child, componentName));
  }

  return false;
}

/**
 * Dialog header composition slot.
 */
export const Header = defineComponent({
  name: "SpectrumDialogHeader",
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    const hasTypeIcon = ref(false);
    const headerContext = computed(() => ({
      inHeader: true,
      hasTypeIcon: hasTypeIcon.value,
    }));
    provide(DialogHeaderContext, headerContext as any);

    return () => {
      const attrsRecord = attrs as Record<string, unknown>;
      const children = slots.default?.() ?? [];
      const hasHeading = children.some(
        (child) =>
          isVNode(child)
          && (vnodeIncludesComponent(child, "SpectrumDialogHeading") || vnodeHasClass(child, "spectrum-Dialog-heading"))
      );
      hasTypeIcon.value = children.some((child) => isVNode(child) && vnodeHasClass(child, "spectrum-Dialog-typeIcon"));

      return h(
        "div",
        {
          ...attrsRecord,
          class: [
            "spectrum-Dialog-header",
            {
              "spectrum-Dialog-header--noHeading": !hasHeading,
              "spectrum-Dialog-header--noTypeIcon": !hasTypeIcon.value,
            },
            attrsRecord.class,
          ],
        },
        children
      );
    };
  },
});
