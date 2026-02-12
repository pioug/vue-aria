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

import {isRef, watch, watchEffect} from 'vue';

export type EffectCallback = () => void | (() => void);

function readDependency(dep: unknown): unknown {
  return isRef(dep) ? dep.value : dep;
}

// During SSR, React emits a warning when calling useLayoutEffect.
// Since neither useLayoutEffect nor useEffect run on the server,
// we can suppress this by replacing it with a noop on the server.
export function useLayoutEffect(effect: EffectCallback, dependencies?: unknown[]): void {
  if (typeof document === 'undefined') {
    return;
  }

  if (dependencies) {
    watch(
      () => dependencies.map(readDependency),
      (_next, _prev, onCleanup) => {
        const cleanup = effect();
        if (typeof cleanup === 'function') {
          onCleanup(cleanup);
        }
      },
      {immediate: true, flush: 'post'}
    );
    return;
  }

  watchEffect(
    (onCleanup) => {
      const cleanup = effect();
      if (typeof cleanup === 'function') {
        onCleanup(cleanup);
      }
    },
    {flush: 'post'}
  );
}
