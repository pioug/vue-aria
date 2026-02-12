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
import {useEvent} from './useEvent';
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

export interface LoadMoreProps {
  isLoading?: boolean;
  onLoadMore?: () => void;
  scrollOffset?: number;
  items?: any;
}

export function useLoadMore(props: LoadMoreProps, ref: RefObjectLike<HTMLElement | null>): void {
  let {isLoading, onLoadMore, scrollOffset = 1, items} = props;

  // Handle scrolling, and call onLoadMore when nearing the bottom.
  let isLoadingRef = {current: isLoading};
  let prevProps = {current: props};
  let onScroll = () => {
    const element = getRefValue(ref);
    if (element && !isLoadingRef.current && onLoadMore) {
      let shouldLoadMore =
        element.scrollHeight - element.scrollTop - element.clientHeight <
        element.clientHeight * scrollOffset;

      if (shouldLoadMore) {
        isLoadingRef.current = true;
        onLoadMore();
      }
    }
  };

  let lastItems = {current: items};
  useLayoutEffect(() => {
    // Only update isLoadingRef if props object actually changed,
    // not if a local state change occurred.
    if (props !== prevProps.current) {
      isLoadingRef.current = isLoading;
      prevProps.current = props;
    }

    let element = getRefValue(ref);
    let shouldLoadMore =
      element &&
      !isLoadingRef.current &&
      onLoadMore &&
      (!items || items !== lastItems.current) &&
      element.clientHeight === element.scrollHeight;

    if (shouldLoadMore) {
      isLoadingRef.current = true;
      onLoadMore?.();
    }

    lastItems.current = items;
  }, [isLoading, onLoadMore, props, ref, items]);

  useEvent(ref, 'scroll', onScroll);
}
