import { computed, ref, toValue, watch } from "vue";
import { useLocalizedStringFormatter } from "@vue-aria/i18n";
import { filterDOMProps } from "@vue-aria/utils";
import { useId } from "@vue-aria/ssr";
import type { MaybeReactive, ReadonlyRef } from "@vue-aria/types";
import type { QueuedToast, UseToastStateResult } from "@vue-aria/toast-state";

export interface UseToastOptions<T> {
  toast: MaybeReactive<QueuedToast<T>>;
  "aria-label"?: MaybeReactive<string | undefined>;
  "aria-labelledby"?: MaybeReactive<string | undefined>;
  "aria-describedby"?: MaybeReactive<string | undefined>;
  [key: string]: unknown;
}

export interface UseToastResult {
  toastProps: ReadonlyRef<Record<string, unknown>>;
  contentProps: ReadonlyRef<Record<string, unknown>>;
  titleProps: ReadonlyRef<Record<string, unknown>>;
  descriptionProps: ReadonlyRef<Record<string, unknown>>;
  closeButtonProps: ReadonlyRef<Record<string, unknown>>;
}

const ARIA_TOAST_INTL_MESSAGES = {
  "en-US": {
    close: "Close",
  },
  "fr-FR": {
    close: "Fermer",
  },
} as const;

function resolveString(value: MaybeReactive<string | undefined> | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return toValue(value) ?? undefined;
}

export function useToast<T>(
  options: UseToastOptions<T>,
  state: Pick<UseToastStateResult<T>, "close">,
  _toastRef: MaybeReactive<HTMLElement | null | undefined>
): UseToastResult {
  const toast = computed(() => toValue(options.toast));
  const stringFormatter = useLocalizedStringFormatter(ARIA_TOAST_INTL_MESSAGES);

  watch(
    () => [toast.value.timer, toast.value.timeout] as const,
    ([timer, timeout], _, onCleanup) => {
      if (timer === undefined || typeof timeout !== "number") {
        return;
      }

      timer.reset(timeout);
      onCleanup(() => {
        timer.pause();
      });
    },
    {
      immediate: true,
    }
  );

  const titleId = useId(undefined, "v-aria-toast-title");
  const descriptionId = useId(undefined, "v-aria-toast-description");
  const domProps = filterDOMProps(options, { labelable: true });
  const isVisible = ref(true);

  const toastProps = computed<Record<string, unknown>>(() => ({
    ...domProps,
    role: "alertdialog",
    "aria-modal": "false",
    "aria-labelledby": resolveString(options["aria-labelledby"]) ?? titleId.value,
    "aria-describedby": resolveString(options["aria-describedby"]) ?? descriptionId.value,
    tabIndex: 0,
  }));

  const contentProps = computed<Record<string, unknown>>(() => ({
    role: "alert",
    "aria-atomic": "true",
    "aria-hidden": isVisible.value ? undefined : "true",
  }));

  const titleProps = computed<Record<string, unknown>>(() => ({
    id: titleId.value,
  }));

  const descriptionProps = computed<Record<string, unknown>>(() => ({
    id: descriptionId.value,
  }));

  const closeButtonProps = computed<Record<string, unknown>>(() => ({
    "aria-label": stringFormatter.value.format("close"),
    onPress: () => {
      state.close(toast.value.key);
    },
  }));

  return {
    toastProps,
    contentProps,
    titleProps,
    descriptionProps,
    closeButtonProps,
  };
}
