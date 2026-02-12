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

import {navigate} from '../src/DropTargetKeyboardNavigation';

function createFlatCollection() {
  let items = new Map([
    ['a', {key: 'a', level: 1, nextKey: 'b', parentKey: null, prevKey: null, type: 'item'}],
    ['b', {key: 'b', level: 1, nextKey: 'c', parentKey: null, prevKey: 'a', type: 'item'}],
    ['c', {key: 'c', level: 1, nextKey: null, parentKey: null, prevKey: 'b', type: 'item'}]
  ]);

  return {
    getItem: (key: string) => items.get(key) ?? null,
    getKeyAfter: (key: string) => items.get(key)?.nextKey ?? null,
    getKeyBefore: (key: string) => items.get(key)?.prevKey ?? null
  };
}

function createKeyboardDelegate() {
  return {
    getFirstKey: () => 'a',
    getKeyAbove: (key: string) => (key === 'a' ? null : key === 'b' ? 'a' : 'b'),
    getKeyBelow: (key: string) => (key === 'a' ? 'b' : key === 'b' ? 'c' : null),
    getLastKey: () => 'c'
  };
}

describe('drop target keyboard navigation', () => {
  it('returns root when starting navigation without a target', () => {
    let target = navigate(
      createKeyboardDelegate() as any,
      createFlatCollection() as any,
      null,
      'down'
    );
    expect(target).toEqual({type: 'root'});
  });

  it('moves from root to first item before position', () => {
    let target = navigate(
      createKeyboardDelegate() as any,
      createFlatCollection() as any,
      {type: 'root'},
      'down'
    );
    expect(target).toEqual({
      dropPosition: 'before',
      key: 'a',
      type: 'item'
    });
  });
});
