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

import type {MutableRefObjectLike, VueRefLike} from './mergeRefs';
import {getScrollParent} from './getScrollParent';
import {useEffectEvent} from './useEffectEvent';
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

export interface LoadMoreSentinelProps {
  collection: unknown;
  onLoadMore?: () => void;
  scrollOffset?: number;
}

export function useLoadMoreSentinel(
  props: LoadMoreSentinelProps,
  ref: RefObjectLike<HTMLElement | null>
): void {
  let {collection, onLoadMore, scrollOffset = 1} = props;

  let sentinelObserver: {current: IntersectionObserver | null} = {current: null};

  let triggerLoadMore = useEffectEvent((entries: IntersectionObserverEntry[]) => {
    for (let entry of entries) {
      if (entry.isIntersecting && onLoadMore) {
        onLoadMore();
      }
    }
  });

  useLayoutEffect(() => {
    const element = getRefValue(ref);
    if (element && typeof IntersectionObserver !== 'undefined') {
      sentinelObserver.current = new IntersectionObserver(triggerLoadMore, {
        root: getScrollParent(element) as HTMLElement,
        rootMargin: `0px ${100 * scrollOffset}% ${100 * scrollOffset}% ${100 * scrollOffset}%`
      });
      sentinelObserver.current.observe(element);
    }

    return () => {
      sentinelObserver.current?.disconnect();
    };
  }, [collection, ref, scrollOffset]);
}
