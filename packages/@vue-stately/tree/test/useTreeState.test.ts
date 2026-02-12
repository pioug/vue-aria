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

import React, {useMemo, useRef} from 'react';
import {Collection, Key, Node} from '@vue-types/shared';
import {Item} from '@vue-stately/collections';
import {render} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {TreeCollection, useTreeState} from '../src';
import {useSelectableCollection, useSelectableItem} from '@vue-aria/selection';
import {usePress} from '@vue-aria/interactions';

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    direction: 'ltr',
    locale: 'en-US'
  }),
  useCollator: () => ({
    compare: (a: string, b: string) => String(a).localeCompare(String(b))
  }),
  useLocalizedStringFormatter: () => ({
    format: () => ''
  })
}));

if (!(globalThis as any).CSS) {
  (globalThis as any).CSS = {};
}

if (!(globalThis as any).CSS.escape) {
  (globalThis as any).CSS.escape = (value: string) => String(value);
}

function KeyboardNavigation() {
  return React.createElement(TreeExample, null);
}

function TreeExample(props = {}) {
  return React.createElement(
    Tree,
    props,
    React.createElement(
      Item,
      {key: '1', title: 'Animals'},
      React.createElement(Item, null, 'Aardvark'),
      React.createElement(
        Item,
        {title: 'Bear'},
        React.createElement(Item, null, 'Black Bear'),
        React.createElement(Item, null, 'Brown Bear')
      ),
      React.createElement(Item, null, 'Kangaroo'),
      React.createElement(Item, null, 'Snake')
    ),
    React.createElement(
      Item,
      {key: '2', title: 'Fruits'},
      React.createElement(Item, null, 'Apple'),
      React.createElement(Item, null, 'Orange'),
      React.createElement(
        Item,
        {title: 'Kiwi'},
        React.createElement(Item, null, 'Golden Kiwi'),
        React.createElement(Item, null, 'Fuzzy Kiwi')
      )
    )
  );
}

function Tree(props) {
  let state = useTreeState(props);
  let ref = useRef<HTMLDivElement>(null);

  let keyboardDelegate = useMemo(() => new TreeKeyboardDelegate(state.collection, state.disabledKeys), [state.collection, state.disabledKeys]);
  let {collectionProps} = useSelectableCollection({
    keyboardDelegate,
    ref,
    selectionManager: state.selectionManager
  });

  return React.createElement(
    'div',
    {
      ...collectionProps,
      ref,
      role: 'tree'
    },
    TreeNodes({nodes: state.collection, state})
  );
}

function TreeNodes({nodes, state}: {nodes: Collection<Node<object>>, state: any}) {
  return Array.from(nodes).map(node => React.createElement(TreeItem, {
    node,
    key: node.key,
    state
  }));
}

function TreeItem({node, state}) {
  let ref = useRef<HTMLDivElement>(null);

  let {itemProps} = useSelectableItem({
    key: node.key,
    selectionManager: state.selectionManager,
    ref
  });

  let {pressProps} = usePress({
    ...itemProps,
    onPress: () => state.toggleKey(node.key)
  });

  let isExpanded = node.hasChildNodes && state.expandedKeys.has(node.key);
  let isSelected = state.selectionManager.isSelected(node.key);

  return React.createElement(
    'div',
    {
      ...pressProps,
      'aria-expanded': node.hasChildNodes ? isExpanded : null,
      'aria-selected': isSelected,
      ref,
      role: 'treeitem'
    },
    React.createElement(
      'div',
      {className: 'title'},
      node.rendered
    ),
    isExpanded
      ? React.createElement(
          'div',
          {
            className: 'children',
            role: 'group'
          },
          TreeNodes({nodes: node.childNodes as Collection<Node<object>>, state})
        )
      : null
  );
}

class TreeKeyboardDelegate<T> {
  collator: Intl.Collator;
  collection: TreeCollection<T>;
  disabledKeys: Set<Key>;

  constructor(collection, disabledKeys) {
    this.collator = new Intl.Collator('en');
    this.collection = collection;
    this.disabledKeys = disabledKeys;
  }

  getKeyAbove(key) {
    let {collection, disabledKeys} = this;
    let keyBefore = collection.getKeyBefore(key);

    while (keyBefore !== null) {
      let item = collection.getItem(keyBefore);

      if (item?.type === 'item' && !disabledKeys.has(item.key)) {
        return keyBefore;
      }

      keyBefore = collection.getKeyBefore(keyBefore);
    }

    return null;
  }

  getKeyBelow(key) {
    let {collection, disabledKeys} = this;
    let keyBelow = collection.getKeyAfter(key);

    while (keyBelow !== null) {
      let item = collection.getItem(keyBelow);

      if (item?.type === 'item' && !disabledKeys.has(item.key)) {
        return keyBelow;
      }

      keyBelow = collection.getKeyAfter(keyBelow);
    }

    return null;
  }

  getFirstKey() {
    let {collection, disabledKeys} = this;
    let key = collection.getFirstKey();

    while (key !== null) {
      let item = collection.getItem(key);

      if (item?.type === 'item' && !disabledKeys.has(item.key)) {
        return key;
      }

      key = collection.getKeyAfter(key);
    }

    return null;
  }

  getLastKey() {
    let {collection, disabledKeys} = this;
    let key = collection.getLastKey();

    while (key !== null) {
      let item = collection.getItem(key);

      if (item?.type === 'item' && !disabledKeys.has(item.key)) {
        return key;
      }

      key = collection.getKeyBefore(key);
    }

    return null;
  }

  getKeyForSearch(search, fromKey = this.getFirstKey()) {
    let {collator, collection} = this;
    let key = fromKey;

    while (key !== null) {
      let item = collection.getItem(key);

      if (item?.textValue && collator.compare(search, item.textValue.slice(0, search.length)) === 0) {
        return key;
      }

      key = this.getKeyBelow(key);
    }

    return null;
  }
}

describe('useTreeState', () => {
  let user: ReturnType<typeof userEvent.setup>;
  beforeAll(() => {
    user = userEvent.setup({delay: null});
  });

  it('should be keyboard navigable', async () => {
    let {getAllByRole} = render(React.createElement(KeyboardNavigation, null));
    await user.tab();
    let items = getAllByRole('treeitem');
    expect(items.length).toBe(2);
    expect(document.activeElement).toBe(items[0]);

    await user.keyboard('{Enter}');
    items = getAllByRole('treeitem');
    expect(items.length).toBe(6);
    expect(document.activeElement).toBe(items[0]);

    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(items[1]);

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    items = getAllByRole('treeitem');
    expect(items.length).toBe(8);
    expect(document.activeElement).toBe(items[2]);

    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(items[3]);
  });
});
