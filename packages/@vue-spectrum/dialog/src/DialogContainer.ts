import {
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
import { classNames } from "@vue-spectrum/utils";
import { Overlay } from "@vue-spectrum/overlays";
import {
  provideDialogContext,
  type DialogContextValue,
  type DialogType,
} from "./context";

export interface SpectrumDialogContainerProps {
  type?: DialogType | undefined;
  onDismiss?: (() => void) | undefined;
  isDismissable?: boolean | undefined;
  isKeyboardDismissDisabled?: boolean | undefined;
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

function getOverlayTestId(type: DialogType): "modal" | "popover" | "tray" {
  if (type === "popover") {
    return "popover";
  }

  if (type === "tray") {
    return "tray";
  }

  return "modal";
}

export const DialogContainer = defineComponent({
  name: "DialogContainer",
  inheritAttrs: false,
  props: {
    type: {
      type: String as PropType<DialogType | undefined>,
      default: undefined,
    },
    onDismiss: {
      type: Function as PropType<(() => void) | undefined>,
      default: undefined,
    },
    isDismissable: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    isKeyboardDismissDisabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const overlayRootRef = ref<HTMLElement | null>(null);
    const childRef = ref<VNode | null>(null);
    const effectiveType = computed<DialogType>(() => props.type ?? "modal");
    const isOpen = computed<boolean>(() => Boolean(childRef.value));

    const context: DialogContextValue = {
      type: effectiveType.value,
      onClose: () => {
        props.onDismiss?.();
      },
      isDismissable: props.isDismissable,
    };
    provideDialogContext(context);

    watch(
      [effectiveType, () => props.isDismissable],
      () => {
        context.type = effectiveType.value;
        context.isDismissable = props.isDismissable;
      },
      { immediate: true }
    );

    const onOverlayKeydown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape" || props.isKeyboardDismissDisabled) {
        return;
      }

      event.preventDefault();
      props.onDismiss?.();
    };

    const onDocumentMouseDown = (event: MouseEvent): void => {
      if (!isOpen.value || !props.isDismissable) {
        return;
      }

      const target = event.target as Node | null;
      if (!target || overlayRootRef.value?.contains(target)) {
        return;
      }

      props.onDismiss?.();
    };

    onMounted(() => {
      if (typeof document !== "undefined") {
        document.addEventListener("mousedown", onDocumentMouseDown, true);
      }
    });

    onBeforeUnmount(() => {
      if (typeof document !== "undefined") {
        document.removeEventListener("mousedown", onDocumentMouseDown, true);
      }
    });

    watch(
      isOpen,
      (nextIsOpen) => {
        if (!nextIsOpen) {
          return;
        }

        void nextTick(() => {
          const root = overlayRootRef.value;
          if (!root) {
            return;
          }
          const dialog = root.querySelector<HTMLElement>(
            "[role=\"dialog\"], [role=\"alertdialog\"]"
          );
          (dialog ?? root).focus();
        });
      }
    );

    return () => {
      const children = normalizeChildren(slots.default?.());
      if (children.length > 1) {
        throw new Error("Only a single child can be passed to DialogContainer.");
      }

      childRef.value = children[0] ?? null;
      const overlayType = getOverlayTestId(effectiveType.value);

      return h(
        Overlay,
        {
          isOpen: isOpen.value,
        },
        {
          default: () =>
            childRef.value
              ? h(
                  "div",
                  {
                    ref: (value: unknown) => {
                      overlayRootRef.value = value as HTMLElement | null;
                    },
                    class: classNames(
                      "spectrum-DialogOverlay",
                      `spectrum-DialogOverlay--${overlayType}`
                    ),
                    "data-testid": overlayType,
                    tabIndex: -1,
                    onKeydown: onOverlayKeydown,
                  },
                  [childRef.value]
                )
              : null,
        }
      );
    };
  },
});
