/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {onScopeDispose, readonly, shallowRef, type Readonly as VueReadonly, type ShallowRef} from 'vue';

type ToastAction = 'add' | 'remove' | 'clear';

export interface ToastStateProps {
  /** The maximum number of toasts to display at a time. */
  maxVisibleToasts?: number;
  /** Function to wrap updates in (i.e. document.startViewTransition()). */
  wrapUpdate?: (fn: () => void, action: ToastAction) => void;
}

export interface ToastOptions {
  /** Handler that is called when the toast is closed, either by the user or after a timeout. */
  onClose?: () => void;
  /** A timeout to automatically close the toast after, in milliseconds. */
  timeout?: number;
}

export interface QueuedToast<T> extends ToastOptions {
  /** The content of the toast. */
  content: T;
  /** A unique key for the toast. */
  key: string;
  /** A timer for the toast, if a timeout was set. */
  timer?: Timer;
}

export interface ToastState<T> {
  /** Adds a new toast to the queue. */
  add(content: T, options?: ToastOptions): string;
  /** Closes a toast. */
  close(key: string): void;
  /** Pauses the timers for all visible toasts. */
  pauseAll(): void;
  /** Resumes the timers for all visible toasts. */
  resumeAll(): void;
  /** The visible toasts. */
  visibleToasts: VueReadonly<ShallowRef<QueuedToast<T>[]>>;
}

/**
 * Provides state management for a toast queue. Toasts display brief, temporary notifications
 * of actions, errors, or other events in an application.
 */
export function useToastState<T>(props: ToastStateProps = {}): ToastState<T> {
  const {maxVisibleToasts = 1, wrapUpdate} = props;
  const queue = new ToastQueue<T>({maxVisibleToasts, wrapUpdate});
  return useToastQueue(queue);
}

/**
 * Subscribes to a provided toast queue and provides methods to update it.
 */
export function useToastQueue<T>(queue: ToastQueue<T>): ToastState<T> {
  const visibleToasts = shallowRef(queue.visibleToasts);
  const unsubscribe = queue.subscribe(() => {
    visibleToasts.value = queue.visibleToasts;
  });

  onScopeDispose(unsubscribe);

  return {
    visibleToasts: readonly(visibleToasts),
    add: (content, options) => queue.add(content, options),
    close: (key) => queue.close(key),
    pauseAll: () => queue.pauseAll(),
    resumeAll: () => queue.resumeAll()
  };
}

/**
 * A ToastQueue manages the order of toasts.
 */
export class ToastQueue<T> {
  private queue: QueuedToast<T>[] = [];
  private subscriptions: Set<() => void> = new Set();
  private maxVisibleToasts: number;
  private wrapUpdate?: (fn: () => void, action: ToastAction) => void;
  /** The currently visible toasts. */
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

  /** Subscribes to updates to the visible toasts. */
  subscribe(fn: () => void): () => void {
    this.subscriptions.add(fn);
    return () => this.subscriptions.delete(fn);
  }

  /** Adds a new toast to the queue. */
  add(content: T, options: ToastOptions = {}): string {
    const toastKey = '_' + Math.random().toString(36).slice(2);
    const toast: QueuedToast<T> = {
      ...options,
      content,
      key: toastKey,
      timer: options.timeout ? new Timer(() => this.close(toastKey), options.timeout) : undefined
    };

    this.queue.unshift(toast);
    this.updateVisibleToasts('add');
    return toastKey;
  }

  /** Closes a toast. */
  close(key: string): void {
    const index = this.queue.findIndex((toast) => toast.key === key);
    if (index >= 0) {
      this.queue[index].onClose?.();
      this.queue.splice(index, 1);
    }

    this.updateVisibleToasts('remove');
  }

  private updateVisibleToasts(action: ToastAction): void {
    this.visibleToasts = this.queue.slice(0, this.maxVisibleToasts);

    this.runWithWrapUpdate(() => {
      for (const fn of this.subscriptions) {
        fn();
      }
    }, action);
  }

  /** Pauses the timers for all visible toasts. */
  pauseAll(): void {
    for (const toast of this.visibleToasts) {
      toast.timer?.pause();
    }
  }

  /** Resumes the timers for all visible toasts. */
  resumeAll(): void {
    for (const toast of this.visibleToasts) {
      toast.timer?.resume();
    }
  }

  clear(): void {
    this.queue = [];
    this.updateVisibleToasts('clear');
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
    this.remaining -= Date.now() - this.startTime!;
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
