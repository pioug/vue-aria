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

import {onMounted, onUnmounted, readonly, ref, type Readonly as VueReadonly, type Ref} from 'vue';

import {useIsSSR} from '../../ssr/src/index';

export interface ViewportSize {
  width: number;
  height: number;
}

export function useViewportSize(): VueReadonly<Ref<ViewportSize>> {
  const isSSR = useIsSSR();
  const size = ref<ViewportSize>(isSSR ? {width: 0, height: 0} : getViewportSize());

  onMounted(() => {
    const updateSize = () => {
      const next = getViewportSize();
      if (next.width !== size.value.width || next.height !== size.value.height) {
        size.value = next;
      }
    };

    updateSize();
    const visualViewport = typeof window !== 'undefined' ? window.visualViewport : null;
    const target = visualViewport ?? window;
    target.addEventListener('resize', updateSize);

    onUnmounted(() => {
      target.removeEventListener('resize', updateSize);
    });
  });

  return readonly(size);
}

function getViewportSize(): ViewportSize {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return {width: 0, height: 0};
  }

  const visualViewport = window.visualViewport;
  return {
    width: visualViewport ? visualViewport.width * visualViewport.scale : document.documentElement.clientWidth,
    height: visualViewport ? visualViewport.height * visualViewport.scale : document.documentElement.clientHeight
  };
}
