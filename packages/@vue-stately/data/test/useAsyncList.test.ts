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

import {act, renderHook} from '@testing-library/react';
import {useAsyncList} from '../src/useAsyncList';

const ITEMS = [{id: 1, name: '1'}, {id: 2, name: '2'}];

function getItems() {
  return new Promise<{items: typeof ITEMS, cursor: number}>((resolve) => {
    setTimeout(() => resolve({cursor: 3, items: ITEMS}), 100);
  });
}

describe('useAsyncList', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function flushTimers() {
    await act(async () => {
      await vi.runAllTimersAsync();
    });
  }

  it('should call load function on init', async () => {
    let load = vi.fn().mockImplementation(getItems);
    let {result} = renderHook(() => useAsyncList({load}));

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.loadingState).toBe('loading');
    expect(result.current.items).toEqual([]);

    await flushTimers();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.loadingState).toBe('idle');
    expect(result.current.items).toEqual(ITEMS);
  });

  it('should call load function when loadMore is called', async () => {
    let load = vi.fn().mockImplementation(getItems);
    let {result} = renderHook(() => useAsyncList({load}));

    await flushTimers();
    expect(result.current.loadingState).toBe('idle');
    expect(result.current.items).toEqual(ITEMS);

    act(() => {
      result.current.loadMore();
    });

    expect(result.current.loadingState).toBe('loadingMore');
    expect(load).toHaveBeenCalledTimes(2);
    expect(load.mock.calls[1][0].cursor).toBe(3);
    expect(load.mock.calls[1][0].items).toEqual(ITEMS);

    await flushTimers();

    expect(result.current.loadingState).toBe('idle');
    expect(result.current.items).toEqual([...ITEMS, ...ITEMS]);
  });

  it('should return error if load throws', async () => {
    let load = vi.fn().mockRejectedValue(new Error('error'));
    let {result} = renderHook(() => useAsyncList({load}));

    expect(result.current.loadingState).toBe('loading');
    await act(async () => {
      await Promise.resolve();
    });

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.loadingState).toBe('error');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error?.message).toBe('error');
  });
});
