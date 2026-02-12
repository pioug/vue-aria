/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {watchEffect} from 'vue';

import type {MutableRefObjectLike, VueRefLike} from './mergeRefs';
import {useEffectEvent} from './useEffectEvent';

type RefObjectLike<T> = MutableRefObjectLike<T> | VueRefLike<T> | null | undefined;

function getRefValue<T>(ref: RefObjectLike<T>): T | null | undefined {
  if (!ref) {
    return undefined;
  }

  if ('current' in ref) {
    return ref.current;
  }

  if ('value' in ref) {
    return ref.value;
  }

  return undefined;
}

export function useEvent<K extends keyof GlobalEventHandlersEventMap>(
  ref: RefObjectLike<EventTarget | null>,
  event: K | (string & {}),
  handler?: (this: Document, ev: GlobalEventHandlersEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): void {
  const handleEvent = useEffectEvent(handler);

  watchEffect((onCleanup) => {
    const element = getRefValue(ref);
    if (!element || !handler) {
      return;
    }

    element.addEventListener(event, handleEvent as EventListener, options);
    onCleanup(() => {
      element.removeEventListener(event, handleEvent as EventListener, options);
    });
  });
}
