import {
  cloneVNode,
  defineComponent,
  h,
  isVNode,
  ref,
  type PropType,
  type VNode,
  type VNodeChild,
} from "vue";
import { mergeProps } from "@vue-aria/utils";

export interface SpectrumFileTriggerProps {
  acceptedFileTypes?: readonly string[] | undefined;
  allowsMultiple?: boolean | undefined;
  defaultCamera?: "user" | "environment" | undefined;
  onSelect?: ((files: FileList | null) => void) | undefined;
  acceptDirectory?: boolean | undefined;
}

function findFirstVNode(children: VNodeChild[]): number {
  for (let index = 0; index < children.length; index += 1) {
    const child = children[index];
    if (isVNode(child) && typeof child.type !== "symbol") {
      return index;
    }
  }

  return -1;
}

export const FileTrigger = defineComponent({
  name: "FileTrigger",
  inheritAttrs: false,
  props: {
    acceptedFileTypes: {
      type: Array as PropType<readonly string[] | undefined>,
      default: undefined,
    },
    allowsMultiple: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    defaultCamera: {
      type: String as PropType<"user" | "environment" | undefined>,
      default: undefined,
    },
    onSelect: {
      type: Function as PropType<((files: FileList | null) => void) | undefined>,
      default: undefined,
    },
    acceptDirectory: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots, expose }) {
    const inputRef = ref<HTMLInputElement | null>(null);

    const openFilePicker = () => {
      if (!inputRef.value) {
        return;
      }

      if (inputRef.value.value) {
        inputRef.value.value = "";
      }

      inputRef.value.click();
    };

    expose({
      UNSAFE_getDOMNode: () => inputRef.value,
      getInputElement: () => inputRef.value,
      open: openFilePicker,
    });

    return () => {
      const children = [...(slots.default?.() ?? [])];
      const triggerIndex = findFirstVNode(children);

      if (triggerIndex >= 0) {
        const triggerNode = children[triggerIndex] as VNode;
        children[triggerIndex] = cloneVNode(
          triggerNode,
          mergeProps((triggerNode.props ?? {}) as Record<string, unknown>, {
            onClick: (event: MouseEvent) => {
              if (event.defaultPrevented) {
                return;
              }

              openFilePicker();
            },
          }),
          true
        );
      }

      const input = h(
        "input",
        mergeProps(attrs as Record<string, unknown>, {
          ref: (value: unknown) => {
            inputRef.value = value as HTMLInputElement | null;
          },
          class: "",
          type: "file",
          style: {
            display: "none",
          },
          accept: props.acceptedFileTypes?.join(","),
          capture: props.defaultCamera,
          multiple: props.allowsMultiple || undefined,
          // Matches upstream behavior and browser support constraints.
          webkitdirectory: props.acceptDirectory ? "" : undefined,
          onChange: (event: Event) => {
            const target = event.target as HTMLInputElement | null;
            props.onSelect?.(target?.files ?? null);
          },
        })
      );

      return [...children, input];
    };
  },
});
