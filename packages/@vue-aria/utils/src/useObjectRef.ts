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

import type {MutableRefObjectLike, RefCallback, RefLike, VueRefLike} from './mergeRefs';

type RefType<T> = RefCallback<T | null> | MutableRefObjectLike<T | null> | VueRefLike<T | null> | null | undefined;

/**
 * Returns an object ref that mirrors updates to a callback ref or object ref.
 */
export function useObjectRef<T>(ref?: RefType<T>): MutableRefObjectLike<T | null> {
  const objRef: MutableRefObjectLike<T | null> = {current: null};
  let cleanupRef: (() => void) | void;

  const refEffect = (instance: T | null) => {
    if (typeof ref === 'function') {
      const refCallback = ref;
      const refCleanup = refCallback(instance);
      return () => {
        if (typeof refCleanup === 'function') {
          refCleanup();
        } else {
          refCallback(null);
        }
      };
    }

    if (ref) {
      assignRef(ref as RefLike<T | null>, instance);
      return () => {
        assignRef(ref as RefLike<T | null>, null);
      };
    }
  };

  return {
    get current() {
      return objRef.current;
    },
    set current(value) {
      objRef.current = value;
      if (cleanupRef) {
        cleanupRef();
        cleanupRef = undefined;
      }
      if (value != null) {
        cleanupRef = refEffect(value);
      }
    }
  };
}

function assignRef<T>(ref: RefLike<T | null>, value: T | null) {
  if (!ref) {
    return;
  }
  if (typeof ref === 'function') {
    ref(value);
    return;
  }
  if ('current' in ref) {
    ref.current = value;
    return;
  }
  if ('value' in ref) {
    ref.value = value;
  }
}
