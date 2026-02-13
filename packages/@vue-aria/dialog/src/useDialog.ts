import { onBeforeUnmount, onMounted, ref } from "vue";
import { filterDOMProps, nodeContains, useSlotId } from "@vue-aria/utils";
import { focusSafely } from "@vue-aria/interactions";
import { useOverlayFocusContain } from "@vue-aria/overlays";

export interface AriaDialogProps {
  role?: "dialog" | "alertdialog";
  "aria-label"?: string;
  "aria-labelledby"?: string;
  [key: string]: unknown;
}

export interface DialogAria {
  dialogProps: Record<string, unknown>;
  titleProps: Record<string, unknown>;
}

export function useDialog(
  props: AriaDialogProps,
  refObj: { current: HTMLElement | null }
): DialogAria {
  const { role = "dialog" } = props;
  let titleId: string | undefined = useSlotId();
  titleId = props["aria-label"] ? undefined : titleId;

  const isRefocusing = ref(false);
  let timeout: ReturnType<typeof setTimeout> | null = null;

  onMounted(() => {
    if (refObj.current && !nodeContains(refObj.current, document.activeElement)) {
      focusSafely(refObj.current);

      timeout = setTimeout(() => {
        if (document.activeElement === refObj.current || document.activeElement === document.body) {
          isRefocusing.value = true;
          if (refObj.current) {
            refObj.current.blur();
            focusSafely(refObj.current);
          }
          isRefocusing.value = false;
        }
      }, 500);
    }
  });

  onBeforeUnmount(() => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  });

  useOverlayFocusContain();

  return {
    dialogProps: {
      ...filterDOMProps(props, { labelable: true }),
      role,
      tabIndex: -1,
      "aria-labelledby": props["aria-labelledby"] || titleId,
      onBlur: (event: FocusEvent) => {
        if (isRefocusing.value) {
          event.stopPropagation();
        }
      },
    },
    titleProps: {
      id: titleId,
    },
  };
}
