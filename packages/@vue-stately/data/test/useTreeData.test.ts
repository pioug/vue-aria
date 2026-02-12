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
import {useTreeData} from '../src/useTreeData';

const initial = [
  {
    children: [
      {
        children: [
          {name: 'Suzie'}
        ],
        name: 'John'
      },
      {
        children: [
          {name: 'Stacy'},
          {name: 'Brad'}
        ],
        name: 'Sam'
      },
      {name: 'Jane'}
    ],
    name: 'David'
  }
];

let getChildren = (item) => item.children;
let getKey = (item) => item.name;

describe('useTreeData', function () {
  it('should construct a tree using initial data', function () {
    let {result} = renderHook(() => useTreeData({
      getChildren,
      getKey,
      initialItems: initial,
      initialSelectedKeys: ['John', 'Stacy']
    }));

    expect(result.current.items[0].value).toBe(initial[0]);
    expect(result.current.items[0].children).toHaveLength(3);
    expect(result.current.items[0].children[0].children).toHaveLength(1);
    expect(result.current.items[0].children[1].children).toHaveLength(2);
    expect(result.current.selectedKeys).toEqual(new Set(['John', 'Stacy']));
  });

  it('should get a node by key', function () {
    let {result} = renderHook(() => useTreeData({
      getChildren,
      getKey,
      initialItems: initial
    }));

    expect(result.current.getItem('Sam')?.value).toBe(initial[0].children[1]);
    expect(result.current.getItem('David')?.value).toBe(initial[0]);
  });

  it('updates parentKey when a node is moved to another parent', function () {
    let {result} = renderHook(() => useTreeData({
      getChildren,
      getKey,
      initialItems: initial
    }));

    act(() => {
      result.current.move('Brad', 'John', 0);
    });

    let john = result.current.items[0].children[0];
    let brad = john.children[0];
    expect(brad.parentKey).toBe(john.key);
  });
});
