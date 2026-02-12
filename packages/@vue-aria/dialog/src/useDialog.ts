import { computed, ref, toValue, watchEffect } from "vue";
import { filterDOMProps, nodeContains } from "@vue-aria/utils";
import { useId } from "@vue-aria/ssr";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";

export interface UseDialogOptions {
  role?: MaybeReactive<"dialog" | "alertdialog" | undefined>;
  "aria-label"?: MaybeReactive<string | undefined>;
  "aria-labelledby"?: MaybeReactive<string | undefined>;
}

export interface UseDialogResult {
  dialogProps: ReadonlyRef<Record<string, unknown>>;
  titleProps: ReadonlyRef<Record<string, unknown>>;
}

function focusSafely(element: HTMLElement): void {
  try {
    if (!element.hasAttribute("tabindex")) {
      element.tabIndex = -1;
    }
    element.focus();
  } catch {
    // Ignore browsers/environments where focusing may fail.
  }
}

export function useDialog(
  options: UseDialogOptions,
  dialogRef: MaybeReactive<HTMLElement | null | undefined>
): UseDialogResult {
  const generatedTitleId = useId(undefined, "v-aria-dialog-title");
  const isRefocusing = ref(false);

  watchEffect((onCleanup) => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }

    const dialog = toValue(dialogRef);
    if (!dialog) {
      return;
    }

    if (!nodeContains(dialog, document.activeElement)) {
      const autoFocusTarget = dialog.querySelector<HTMLElement>("[autofocus]");
      if (autoFocusTarget) {
        focusSafely(autoFocusTarget);
        return;
      }

      focusSafely(dialog);

      const timeout = window.setTimeout(() => {
        if (document.activeElement === dialog || document.activeElement === document.body) {
          isRefocusing.value = true;
          dialog.blur();
          focusSafely(dialog);
          isRefocusing.value = false;
        }
      }, 500);

      onCleanup(() => {
        window.clearTimeout(timeout);
      });
    }
  });

  const label = computed(() => toValue(options["aria-label"]));
  const labelledby = computed(() => toValue(options["aria-labelledby"]));
  const titleId = computed(() => (label.value ? undefined : generatedTitleId.value));

  return {
    dialogProps: computed(() => ({
      ...filterDOMProps(options as unknown as Record<string, unknown>, { labelable: true }),
      role: toValue(options.role) ?? "dialog",
      tabIndex: -1,
      "aria-labelledby": labelledby.value ?? titleId.value,
      onBlur: (event: FocusEvent) => {
        if (isRefocusing.value) {
          event.stopPropagation();
        }
      },
    })),
    titleProps: computed(() => ({
      id: titleId.value,
    })),
  };
}
