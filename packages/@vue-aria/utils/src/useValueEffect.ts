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

import {ref, type Ref} from 'vue';

import {useLayoutEffect} from './useLayoutEffect';

type Dispatch<A> = (value: A) => void;
type SetValueAction<S> = (prev: S) => Generator<S, void, unknown>;

// This hook works like `useState`, but when setting the value, you pass a generator function
// that can yield multiple values. Each yielded value updates the state and waits for the next
// layout effect, then continues the generator.
export function useValueEffect<S>(defaultValue: S | (() => S)): [Ref<S>, Dispatch<SetValueAction<S>>] {
  let initialValue: S;
  if (typeof defaultValue === 'function') {
    initialValue = (defaultValue as () => S)();
  } else {
    initialValue = defaultValue;
  }

  let value = ref(initialValue) as Ref<S>;
  let currValue = {current: value.value};
  let effect: {current: Generator<S, void, unknown> | null} = {current: null};

  let nextRef: {current: () => void} = {
    current: () => {
      if (!effect.current) {
        return;
      }

      // Run the generator to the next yield.
      let newValue = effect.current.next();

      // If the generator is done, reset the effect.
      if (newValue.done) {
        effect.current = null;
        return;
      }

      // If the value is the same as the current value, continue to the next yield.
      if (currValue.current === newValue.value) {
        nextRef.current();
      } else {
        value.value = newValue.value;
      }
    }
  };

  useLayoutEffect(() => {
    currValue.current = value.value;
    // If there is an effect currently running, continue to the next yield.
    if (effect.current) {
      nextRef.current();
    }
  }, [value]);

  let queue: Dispatch<SetValueAction<S>> = (fn) => {
    effect.current = fn(currValue.current);
    nextRef.current();
  };

  return [value, queue];
}
