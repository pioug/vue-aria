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

import {watchEffect} from 'vue';

import type {MutableRefObjectLike, VueRefLike} from './mergeRefs';
import {useEffectEvent} from './useEffectEvent';

type RefObjectLike<T> = MutableRefObjectLike<T> | VueRefLike<T> | null | undefined;

type UseResizeObserverOptions<T> = {
  ref: RefObjectLike<T | undefined | null> | undefined;
  box?: ResizeObserverBoxOptions;
  onResize: () => void;
};

function hasResizeObserver() {
  return typeof window !== 'undefined' && typeof window.ResizeObserver !== 'undefined';
}

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

export function useResizeObserver<T extends Element>(options: UseResizeObserverOptions<T>): void {
  const {ref, box, onResize} = options;
  const onResizeEvent = useEffectEvent(onResize);

  watchEffect((onCleanup) => {
    const element = getRefValue(ref);
    if (!element || typeof window === 'undefined') {
      return;
    }

    if (!hasResizeObserver()) {
      window.addEventListener('resize', onResizeEvent, false);
      onCleanup(() => {
        window.removeEventListener('resize', onResizeEvent, false);
      });
      return;
    }

    const resizeObserverInstance = new window.ResizeObserver((entries) => {
      if (!entries.length) {
        return;
      }

      onResizeEvent();
    });

    resizeObserverInstance.observe(element, {box});
    onCleanup(() => {
      resizeObserverInstance.unobserve(element);
    });
  });
}
