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

/* eslint-disable rulesdir/pure-render */

import {computed, isRef, toValue, type ComputedRef, type MaybeRefOrGetter, type Ref} from 'vue';

export function useDeepMemo<T>(value: MaybeRefOrGetter<T>, isEqual: (a: T, b: T) => boolean): ComputedRef<T>;
export function useDeepMemo<T>(value: T, isEqual: (a: T, b: T) => boolean): T;
export function useDeepMemo<T>(
  value: T | MaybeRefOrGetter<T>,
  isEqual: (a: T, b: T) => boolean
): T | ComputedRef<T> {
  // Vue composables are setup-driven, so preserve memoized identity for reactive sources.
  if (typeof value === 'function' || isRef(value)) {
    let lastValue: T | null = null;
    return computed(() => {
      let nextValue = toValue(value as MaybeRefOrGetter<T>);
      if (nextValue && lastValue && isEqual(nextValue, lastValue)) {
        return lastValue;
      }

      lastValue = nextValue;
      return nextValue;
    });
  }

  let lastValue = {current: null as T | null};
  let nextValue = value as T;
  if (nextValue && lastValue.current && isEqual(nextValue, lastValue.current)) {
    nextValue = lastValue.current;
  }

  lastValue.current = nextValue;
  return nextValue;
}
