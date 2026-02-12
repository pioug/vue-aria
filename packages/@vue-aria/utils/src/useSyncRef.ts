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

type RefObjectLike<T> = MutableRefObjectLike<T> | VueRefLike<T> | null | undefined;

interface ContextValue<T> {
  ref?: RefObjectLike<T | null>;
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

function setRefValue<T>(ref: RefObjectLike<T>, value: T): void {
  if (!ref) {
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

// Syncs ref from context with ref passed to hook.
export function useSyncRef<T>(context?: ContextValue<T> | null, ref?: RefObjectLike<T | null>): void {
  watchEffect((onCleanup) => {
    if (context?.ref && ref) {
      setRefValue(context.ref, getRefValue(ref) ?? null);
      onCleanup(() => {
        if (context.ref) {
          setRefValue(context.ref, null);
        }
      });
    }
  });
}
