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

import {Collection, CollectionBuilder, CollectionNode, createBranchComponent, createLeafComponent} from '../src';
import React from 'react';
import {render} from '@testing-library/react';

class ItemNode extends CollectionNode {
  static type = 'item';
}

const Item = createLeafComponent(ItemNode, () => React.createElement('div'));

const ItemsOld = createLeafComponent('item', () => React.createElement('div'));

const SectionOld = createBranchComponent('section', () => React.createElement('div'));

const renderItems = (items: string[], spyCollection: {current?: any}) =>
  React.createElement(
    CollectionBuilder,
    {
      content: React.createElement(
        Collection,
        null,
        items.map((item) => React.createElement(Item, {key: item}))
      )
    },
    (collection: any) => {
      spyCollection.current = collection;
      return null;
    }
  );

const renderItemsOld = (items: string[], spyCollection: {current?: any}) =>
  React.createElement(
    CollectionBuilder,
    {
      content: React.createElement(
        Collection,
        null,
        React.createElement(
          SectionOld,
          null,
          items.map((item) => React.createElement(ItemsOld, {key: item}))
        )
      )
    },
    (collection: any) => {
      spyCollection.current = collection;
      return null;
    }
  );

describe('CollectionBuilder', () => {
  it('should be frozen even in case of empty initial collection', () => {
    let spyCollection: {current?: any} = {};
    render(renderItems([], spyCollection));
    expect(spyCollection.current.frozen).toBe(true);
  });

  it('should have correct firstKey, lastKey and should be frozen after all items are deleted', () => {
    let spyCollection: {current?: any} = {};
    const {rerender} = render(renderItems(['a'], spyCollection));
    rerender(renderItems([], spyCollection));
    expect(spyCollection.current.frozen).toBe(true);
    expect(spyCollection.current.firstKey).toBe(null);
    expect(spyCollection.current.lastKey).toBe(null);
  });

  it('should still support using strings for the collection node class in createLeafComponent/createBranchComponent', () => {
    let spyCollection: {current?: any} = {};
    render(renderItemsOld(['a'], spyCollection));
    expect(spyCollection.current.frozen).toBe(true);

    let sectionKey = spyCollection.current.firstKey;
    expect(sectionKey).not.toBeNull();
    expect(spyCollection.current.keyMap.get(sectionKey).type).toBe('section');

    let itemKey = spyCollection.current.keyMap.get(sectionKey).firstChildKey;
    expect(itemKey).not.toBeNull();
    expect(spyCollection.current.keyMap.get(itemKey).type).toBe('item');
  });
});
