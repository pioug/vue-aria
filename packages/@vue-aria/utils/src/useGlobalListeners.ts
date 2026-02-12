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

import {getCurrentScope, onScopeDispose} from 'vue';

interface ListenerRecord {
  type: string;
  eventTarget: EventTarget;
  fn: EventListenerOrEventListenerObject;
  options?: boolean | AddEventListenerOptions;
}

interface GlobalListeners {
  addGlobalListener<K extends keyof WindowEventMap>(
    el: Window,
    type: K,
    listener: (this: Document, ev: WindowEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addGlobalListener<K extends keyof DocumentEventMap>(
    el: EventTarget,
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addGlobalListener(
    el: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeGlobalListener<K extends keyof DocumentEventMap>(
    el: EventTarget,
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
  removeGlobalListener(
    el: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
  removeAllGlobalListeners(): void;
}

export function useGlobalListeners(): GlobalListeners {
  const globalListeners = new Map<EventListenerOrEventListenerObject, ListenerRecord>();

  const addGlobalListener = (
    eventTarget: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) => {
    const fn: EventListenerOrEventListenerObject =
      typeof options === 'object' && options.once
        ? (...args: unknown[]) => {
            globalListeners.delete(listener);
            if (typeof listener === 'function') {
              (listener as (...innerArgs: unknown[]) => void)(...args);
            } else if (listener && 'handleEvent' in listener) {
              listener.handleEvent(...(args as [Event]));
            }
          }
        : listener;

    globalListeners.set(listener, {type, eventTarget, fn, options});
    eventTarget.addEventListener(type, fn, options);
  };

  const removeGlobalListener = (
    eventTarget: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ) => {
    const fn = globalListeners.get(listener)?.fn || listener;
    eventTarget.removeEventListener(type, fn, options);
    globalListeners.delete(listener);
  };

  const removeAllGlobalListeners = () => {
    for (const [listener, value] of Array.from(globalListeners.entries())) {
      removeGlobalListener(value.eventTarget, value.type, listener, value.options);
    }
  };

  if (getCurrentScope()) {
    onScopeDispose(() => {
      removeAllGlobalListeners();
    });
  }

  return {addGlobalListener, removeGlobalListener, removeAllGlobalListeners};
}
