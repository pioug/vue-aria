import { computed, ref, type Ref } from "vue";
import type { ReadonlyRef } from "@vue-aria/types";

type ToastAction = "add" | "remove" | "clear";

export interface UseToastStateOptions {
  maxVisibleToasts?: number;
  wrapUpdate?: (fn: () => void, action: ToastAction) => void;
}

export interface ToastOptions {
  onClose?: () => void;
  timeout?: number;
}

export interface ToastTimer {
  reset: (delay: number) => void;
  pause: () => void;
  resume: () => void;
}

export interface QueuedToast<T> extends ToastOptions {
  content: T;
  key: string;
  timer?: ToastTimer;
}

export interface UseToastStateResult<T> {
  visibleToasts: ReadonlyRef<readonly QueuedToast<T>[]>;
  add: (content: T, options?: ToastOptions) => string;
  close: (key: string) => void;
  pauseAll: () => void;
  resumeAll: () => void;
  clear: () => void;
}

export class Timer implements ToastTimer {
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private startTime: number | null = null;
  private remaining: number;
  private readonly callback: () => void;

  constructor(callback: () => void, delay: number) {
    this.callback = callback;
    this.remaining = delay;
  }

  reset(delay: number): void {
    this.remaining = delay;
    this.resume();
  }

  pause(): void {
    if (this.timerId === null) {
      return;
    }

    clearTimeout(this.timerId);
    this.timerId = null;
    this.remaining -= Date.now() - (this.startTime ?? Date.now());
  }

  resume(): void {
    if (this.timerId !== null || this.remaining <= 0) {
      return;
    }

    this.startTime = Date.now();
    this.timerId = setTimeout(() => {
      this.timerId = null;
      this.remaining = 0;
      this.callback();
    }, this.remaining);
  }
}

function generateToastKey(): string {
  return `_${Math.random().toString(36).slice(2)}`;
}

export function useToastState<T>(
  options: UseToastStateOptions = {}
): UseToastStateResult<T> {
  const maxVisibleToasts = options.maxVisibleToasts ?? 1;
  const queue = ref<QueuedToast<T>[]>([]) as Ref<QueuedToast<T>[]>;

  const runWithWrapUpdate = (fn: () => void, action: ToastAction): void => {
    if (options.wrapUpdate) {
      options.wrapUpdate(fn, action);
      return;
    }

    fn();
  };

  const visibleToasts = computed<readonly QueuedToast<T>[]>(() =>
    queue.value.slice(0, maxVisibleToasts)
  );

  const removeToast = (key: string): void => {
    const index = queue.value.findIndex((toast) => toast.key === key);
    if (index < 0) {
      return;
    }

    const toast = queue.value[index];
    toast.onClose?.();
    queue.value.splice(index, 1);
  };

  const add = (content: T, toastOptions: ToastOptions = {}): string => {
    const key = generateToastKey();
    const timeout = toastOptions.timeout;

    const toast: QueuedToast<T> = {
      ...toastOptions,
      content,
      key,
      timer:
        typeof timeout === "number" && timeout > 0
          ? new Timer(() => {
            closeWithWrap(key);
          }, timeout)
          : undefined,
    };

    runWithWrapUpdate(() => {
      queue.value.unshift(toast);
    }, "add");

    return key;
  };

  const closeWithWrap = (key: string): void => {
    runWithWrapUpdate(() => {
      removeToast(key);
    }, "remove");
  };

  const pauseAll = (): void => {
    for (const toast of visibleToasts.value) {
      toast.timer?.pause();
    }
  };

  const resumeAll = (): void => {
    for (const toast of visibleToasts.value) {
      toast.timer?.resume();
    }
  };

  const clear = (): void => {
    runWithWrapUpdate(() => {
      for (const toast of queue.value) {
        toast.onClose?.();
      }
      queue.value = [];
    }, "clear");
  };

  return {
    visibleToasts,
    add,
    close: closeWithWrap,
    pauseAll,
    resumeAll,
    clear,
  };
}
