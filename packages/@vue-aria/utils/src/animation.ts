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

import {computed, readonly, ref as vueRef, toValue, type MaybeRefOrGetter, type Ref} from 'vue';

import type {MutableRefObjectLike, VueRefLike} from './mergeRefs';
import {useLayoutEffect} from './useLayoutEffect';

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

export function useEnterAnimation(
  ref: RefObjectLike<HTMLElement | null>,
  isReady: MaybeRefOrGetter<boolean> = true
): Readonly<Ref<boolean>> {
  let isEntering = vueRef(true);
  let isAnimationReady = computed(() => isEntering.value && toValue(isReady));

  // There are two cases for entry animations:
  // 1. CSS @keyframes. The `animation` property is set during the isEntering state.
  // 2. CSS transitions. The initial styles are applied during isEntering, then removed immediately.
  useLayoutEffect(() => {
    let element = getRefValue(ref);
    if (isAnimationReady.value && element && 'getAnimations' in element) {
      for (let animation of element.getAnimations()) {
        if (typeof CSSTransition !== 'undefined' && animation instanceof CSSTransition) {
          animation.cancel();
        }
      }
    }
  }, [ref, isAnimationReady]);

  useAnimation(ref, isAnimationReady, () => {
    isEntering.value = false;
  });

  return readonly(isAnimationReady);
}

export function useExitAnimation(
  ref: RefObjectLike<HTMLElement | null>,
  isOpen: MaybeRefOrGetter<boolean>
): Readonly<Ref<boolean>> {
  let exitState = vueRef<'closed' | 'open' | 'exiting'>(toValue(isOpen) ? 'open' : 'closed');

  useLayoutEffect(() => {
    let open = toValue(isOpen);
    switch (exitState.value) {
      case 'open':
        // If isOpen becomes false, set the state to exiting.
        if (!open) {
          exitState.value = 'exiting';
        }
        break;
      case 'closed':
      case 'exiting':
        // If we are exiting and isOpen becomes true, the animation was interrupted.
        if (open) {
          exitState.value = 'open';
        }
        break;
    }
  }, [isOpen, exitState]);

  let isExiting = computed(() => exitState.value === 'exiting');
  useAnimation(ref, isExiting, () => {
    // Set the state to closed, which should allow callers to unmount.
    if (exitState.value === 'exiting') {
      exitState.value = 'closed';
    }
  });

  return readonly(isExiting);
}

function useAnimation(
  ref: RefObjectLike<HTMLElement | null>,
  isActive: MaybeRefOrGetter<boolean>,
  onEnd: () => void
): void {
  useLayoutEffect(() => {
    let element = getRefValue(ref);
    if (toValue(isActive) && element) {
      if (!('getAnimations' in element)) {
        // JSDOM
        onEnd();
        return;
      }

      let animations = element.getAnimations();
      if (animations.length === 0) {
        onEnd();
        return;
      }

      let canceled = false;
      Promise.all(animations.map((animation) => animation.finished))
        .then(() => {
          if (!canceled) {
            onEnd();
          }
        })
        .catch(() => {});

      return () => {
        canceled = true;
      };
    }
  }, [ref, isActive, onEnd]);
}
