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
import {useListData} from '../src/useListData';

const initial = [
  {name: 'David'},
  {name: 'Sam'},
  {name: 'Julia'}
];

let getKey = (item) => item.name;
let filter = (item, text) => item.name.includes(text);

describe('useListData', function () {
  it('should construct a list using initial data', function () {
    let {result} = renderHook(() => useListData({
      getKey,
      initialItems: initial,
      initialSelectedKeys: ['Sam', 'Julia']
    }));

    expect(result.current.items).toBe(initial);
    expect(result.current.selectedKeys).toEqual(new Set(['Sam', 'Julia']));
  });

  it('should not wipe list state when insertBefore target key does not exist', function () {
    let {result} = renderHook(() => useListData({
      getKey,
      initialFilterText: 'test',
      initialItems: initial,
      initialSelectedKeys: ['Sam', 'Julia']
    }));
    let initialResult = result.current;

    act(() => {
      result.current.insertBefore('fakeKey', {name: 'Devon'});
    });

    expect(result.current.items).toBe(initialResult.items);
    expect(result.current.selectedKeys).toBe(initialResult.selectedKeys);
    expect(result.current.filterText).toBe(initialResult.filterText);
  });

  it('should support updating the filter text', function () {
    let {result} = renderHook(() => useListData({
      filter,
      initialItems: initial
    }));

    expect(result.current.items).toEqual(initial);
    act(() => {
      result.current.setFilterText('Da');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual({name: 'David'});
  });
});
