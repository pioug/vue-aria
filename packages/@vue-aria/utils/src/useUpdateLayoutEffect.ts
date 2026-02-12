/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import type {EffectCallback} from './useLayoutEffect';
import {useLayoutEffect} from './useLayoutEffect';

// Like useLayoutEffect, but only called for updates after the initial render.
export function useUpdateLayoutEffect(effect: EffectCallback, dependencies: any[]): void {
  let isInitialMount = true;
  let lastDeps: any[] | null = null;

  useLayoutEffect(() => {
    if (isInitialMount) {
      isInitialMount = false;
    } else if (!lastDeps || dependencies.some((dep, i) => !Object.is(dep, lastDeps?.[i]))) {
      effect();
    }

    lastDeps = [...dependencies];
  }, dependencies);
}
