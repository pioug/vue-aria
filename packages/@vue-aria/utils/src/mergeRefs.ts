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

export interface MutableRefObjectLike<T> {
  current: T;
}

export interface VueRefLike<T> {
  value: T;
}

export type RefCallback<T> = (value: T) => void | (() => void);
export type RefLike<T> =
  | RefCallback<T>
  | MutableRefObjectLike<T>
  | VueRefLike<T>
  | null
  | undefined;

/**
 * Merges multiple refs into one. Works with callback refs and object refs.
 */
export function mergeRefs<T>(...refs: Array<RefLike<T>>): RefLike<T> {
  if (refs.length === 1 && refs[0]) {
    return refs[0];
  }

  return (value: T) => {
    let hasCleanup = false;

    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, value);
      hasCleanup ||= typeof cleanup === 'function';
      return cleanup;
    });

    if (hasCleanup) {
      return () => {
        cleanups.forEach((cleanup, i) => {
          if (typeof cleanup === 'function') {
            cleanup();
          } else {
            setRef(refs[i], null as T);
          }
        });
      };
    }
  };
}

function setRef<T>(ref: RefLike<T>, value: T) {
  if (typeof ref === 'function') {
    return ref(value);
  }

  if (ref && typeof ref === 'object') {
    if ('current' in ref) {
      ref.current = value;
    } else if ('value' in ref) {
      ref.value = value;
    }
  }
}
