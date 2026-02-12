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

import {computed, ref, unref, watchEffect, type ComputedRef, type MaybeRef, type Ref} from 'vue';

type SetStateAction<T> = T | ((value: T) => T);
type ControlledValue<T> = MaybeRef<T | undefined> | (() => T | undefined);

function resolveValue<T>(value: ControlledValue<T>): T | undefined {
  if (typeof value === 'function') {
    return (value as () => T | undefined)();
  }
  return unref(value as MaybeRef<T | undefined>);
}

export function useControlledState<T, C = T>(
  value: Exclude<T, undefined>,
  defaultValue: Exclude<T, undefined> | undefined,
  onChange?: (value: C, ...args: any[]) => void
): [ComputedRef<T>, (value: SetStateAction<T>, ...args: any[]) => void];
export function useControlledState<T, C = T>(
  value: Exclude<T, undefined> | undefined,
  defaultValue: Exclude<T, undefined>,
  onChange?: (value: C, ...args: any[]) => void
): [ComputedRef<T>, (value: SetStateAction<T>, ...args: any[]) => void];
export function useControlledState<T, C = T>(
  value: ControlledValue<T>,
  defaultValue: T,
  onChange?: (value: C, ...args: any[]) => void
): [ComputedRef<T>, (value: SetStateAction<T>, ...args: any[]) => void] {
  const initial = resolveValue(value);
  const stateValue = ref((initial !== undefined ? initial : defaultValue) as T);
  const valueRef = ref(stateValue.value) as Ref<T>;

  const isControlledRef = ref(initial !== undefined);

  watchEffect(() => {
    const isControlled = resolveValue(value) !== undefined;
    const wasControlled = isControlledRef.value;
    if (wasControlled !== isControlled && process.env.NODE_ENV !== 'production') {
      console.warn(`WARN: A component changed from ${wasControlled ? 'controlled' : 'uncontrolled'} to ${isControlled ? 'controlled' : 'uncontrolled'}.`);
    }
    isControlledRef.value = isControlled;
  });

  const currentValue = computed(() => {
    const resolved = resolveValue(value);
    const nextValue = (resolved !== undefined ? resolved : stateValue.value) as T;
    valueRef.value = nextValue;
    return nextValue;
  });

  const setValue = (nextValue: SetStateAction<T>, ...args: any[]) => {
    const valueToSet = typeof nextValue === 'function'
      ? (nextValue as (value: T) => T)(valueRef.value)
      : nextValue;

    if (!Object.is(valueRef.value, valueToSet)) {
      valueRef.value = valueToSet;
      stateValue.value = valueToSet;
      onChange?.(valueToSet as C, ...args);
    }
  };

  return [currentValue, setValue];
}
