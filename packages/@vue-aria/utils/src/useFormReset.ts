/*
 * Copyright 2023 Adobe. All rights reserved.
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

type FormControlElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
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

export function useFormReset<T>(
  ref: RefObjectLike<FormControlElement | null> | undefined,
  initialValue: T,
  onReset: (value: T) => void
): void {
  const handleReset = useEffectEvent(() => {
    onReset?.(initialValue);
  });

  watchEffect((onCleanup) => {
    const element = getRefValue(ref);
    const form = element?.form;
    if (!form) {
      return;
    }

    form.addEventListener('reset', handleReset);
    onCleanup(() => {
      form.removeEventListener('reset', handleReset);
    });
  });
}
