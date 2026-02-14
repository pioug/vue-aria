import { getCurrentScope, onScopeDispose, shallowRef } from "vue";

type ToastAction = "add" | "remove" | "clear";

export interface ToastStateProps {
  maxVisibleToasts?: number;
  wrapUpdate?: (fn: () => void, action: ToastAction) => void;
}

export interface ToastOptions {
  onClose?: () => void;
  timeout?: number;
}

export interface QueuedToast<T> extends ToastOptions {
  content: T;
  key: string;
  timer?: Timer;
}

export interface ToastState<T> {
  add(content: T, options?: ToastOptions): string;
  close(key: string): void;
  pauseAll(): void;
  resumeAll(): void;
  readonly visibleToasts: QueuedToast<T>[];
}

/**
 * Provides state management for a toast queue.
 */
export function useToastState<T>(props: ToastStateProps = {}): ToastState<T> {
  const { maxVisibleToasts = 1, wrapUpdate } = props;
  const queue = new ToastQueue<T>({ maxVisibleToasts, wrapUpdate });
  return useToastQueue(queue);
}

/**
 * Subscribes to updates from a provided toast queue.
 */
export function useToastQueue<T>(queue: ToastQueue<T>): ToastState<T> {
  const visibleToasts = shallowRef<QueuedToast<T>[]>(queue.visibleToasts);
  const unsubscribe = queue.subscribe(() => {
    visibleToasts.value = queue.visibleToasts;
  });

  if (getCurrentScope()) {
    onScopeDispose(unsubscribe);
  }

  return {
    get visibleToasts() {
      return visibleToasts.value;
    },
    add(content, options) {
      return queue.add(content, options);
    },
    close(key) {
      queue.close(key);
    },
    pauseAll() {
      queue.pauseAll();
    },
    resumeAll() {
      queue.resumeAll();
    },
  };
}

/**
 * ToastQueue manages toast order and visibility.
 */
export class ToastQueue<T> {
  private queue: QueuedToast<T>[] = [];
  private subscriptions: Set<() => void> = new Set();
  private maxVisibleToasts: number;
  private wrapUpdate?: (fn: () => void, action: ToastAction) => void;
  visibleToasts: QueuedToast<T>[] = [];

  constructor(options?: ToastStateProps) {
    this.maxVisibleToasts = options?.maxVisibleToasts ?? Infinity;
    this.wrapUpdate = options?.wrapUpdate;
  }

  private runWithWrapUpdate(fn: () => void, action: ToastAction): void {
    if (this.wrapUpdate) {
      this.wrapUpdate(fn, action);
    } else {
      fn();
    }
  }

  subscribe(fn: () => void): () => void {
    this.subscriptions.add(fn);
    return () => this.subscriptions.delete(fn);
  }

  add(content: T, options: ToastOptions = {}): string {
    const toastKey = `_${Math.random().toString(36).slice(2)}`;
    const toast: QueuedToast<T> = {
      ...options,
      content,
      key: toastKey,
      timer: options.timeout ? new Timer(() => this.close(toastKey), options.timeout) : undefined,
    };

    this.queue.unshift(toast);
    this.updateVisibleToasts("add");
    return toastKey;
  }

  close(key: string): void {
    const index = this.queue.findIndex((toast) => toast.key === key);
    if (index >= 0) {
      this.queue[index].onClose?.();
      this.queue.splice(index, 1);
    }

    this.updateVisibleToasts("remove");
  }

  pauseAll(): void {
    for (const toast of this.visibleToasts) {
      toast.timer?.pause();
    }
  }

  resumeAll(): void {
    for (const toast of this.visibleToasts) {
      toast.timer?.resume();
    }
  }

  clear(): void {
    this.queue = [];
    this.updateVisibleToasts("clear");
  }

  private updateVisibleToasts(action: ToastAction): void {
    this.visibleToasts = this.queue.slice(0, this.maxVisibleToasts);
    this.runWithWrapUpdate(() => {
      for (const fn of this.subscriptions) {
        fn();
      }
    }, action);
  }
}

class Timer {
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private startTime: number | null = null;
  private remaining: number;
  private callback: () => void;

  constructor(callback: () => void, delay: number) {
    this.remaining = delay;
    this.callback = callback;
  }

  reset(delay: number): void {
    this.remaining = delay;
    this.resume();
  }

  pause(): void {
    if (this.timerId == null) {
      return;
    }

    clearTimeout(this.timerId);
    this.timerId = null;
    this.remaining -= Date.now() - (this.startTime ?? Date.now());
  }

  resume(): void {
    if (this.remaining <= 0) {
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
