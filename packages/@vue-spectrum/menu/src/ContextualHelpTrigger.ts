import {
  defineComponent,
  h,
  isVNode,
  type PropType,
  type VNode,
  type VNodeChild,
} from "vue";
import { DialogTrigger } from "@vue-spectrum/dialog";

export interface SpectrumMenuDialogTriggerProps {
  isUnavailable?: boolean | undefined;
  slot?: string | undefined;
}

function normalizeChildren(nodes: VNodeChild[] | undefined): VNode[] {
  if (!nodes) {
    return [];
  }

  const result: VNode[] = [];
  for (const node of nodes) {
    if (Array.isArray(node)) {
      result.push(...normalizeChildren(node));
      continue;
    }

    if (!isVNode(node) || typeof node.type === "symbol") {
      continue;
    }

    result.push(node);
  }

  return result;
}

export const ContextualHelpTrigger = defineComponent({
  name: "ContextualHelpTrigger",
  props: {
    isUnavailable: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    slot: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    return () => {
      const children = normalizeChildren(slots.default?.() as VNodeChild[] | undefined);
      const trigger = children[0];
      const content = children[1];

      if (!trigger) {
        return null;
      }

      if (!props.isUnavailable || !content) {
        return trigger;
      }

      return h(
        DialogTrigger,
        {
          type: "popover",
          placement: "end top",
        },
        {
          default: () => [trigger, content],
        }
      );
    };
  },
});
