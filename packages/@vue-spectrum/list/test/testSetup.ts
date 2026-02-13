/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React from 'react';

type ListNode = {
  key: string,
  index: number,
  rendered: React.ReactNode,
  hasChildNodes: boolean
};

export let useListStateSpy = vi.fn();

function classNames(...values: Array<unknown>) {
  let classes: string[] = [];

  for (let value of values) {
    if (!value) {
      continue;
    }

    if (typeof value === 'string') {
      classes.push(value);
      continue;
    }

    if (typeof value === 'object') {
      for (let [key, enabled] of Object.entries(value)) {
        if (enabled) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(' ');
}

function normalizeKey(key: unknown, fallback: string) {
  if (key == null || key === '') {
    return fallback;
  }

  return String(key).replace(/^\.\$/, '');
}

function toRenderedContent(node: React.ReactNode) {
  if (React.isValidElement(node)) {
    return node.props.children;
  }

  return node;
}

function toNodesFromProps(props: Record<string, unknown>): ListNode[] {
  let nodes: ListNode[] = [];
  let children = props.children;

  if (Array.isArray(props.items) && typeof children === 'function') {
    let items = props.items as Array<Record<string, unknown>>;
    for (let index = 0; index < items.length; index++) {
      let item = items[index];
      let key = normalizeKey(item.key ?? item.id, `item-${index}`);
      let rendered = toRenderedContent(children(item));
      nodes.push({key, index, rendered, hasChildNodes: false});
    }
  } else {
    let childNodes = React.Children.toArray(children);
    for (let index = 0; index < childNodes.length; index++) {
      let childNode = childNodes[index];
      if (!React.isValidElement(childNode)) {
        continue;
      }

      let key = normalizeKey(childNode.key, `item-${index}`);
      let rendered = childNode.props?.children;
      nodes.push({key, index, rendered, hasChildNodes: false});
    }
  }

  return nodes;
}

function createCollection(nodes: ListNode[]) {
  let indexByKey = new Map<string, number>();
  for (let [index, node] of nodes.entries()) {
    indexByKey.set(node.key, index);
  }

  return {
    size: nodes.length,
    [Symbol.iterator]: function* () {
      for (let node of nodes) {
        yield node;
      }
    },
    getItem(key: unknown) {
      let index = indexByKey.get(String(key));
      return index == null ? null : nodes[index];
    },
    getKeyAfter(key: unknown) {
      let index = indexByKey.get(String(key));
      if (index == null) {
        return null;
      }

      let next = nodes[index + 1];
      return next ? next.key : null;
    },
    getKeyBefore(key: unknown) {
      let index = indexByKey.get(String(key));
      if (index == null) {
        return null;
      }

      let prev = nodes[index - 1];
      return prev ? prev.key : null;
    }
  };
}

function mergeProps(...propsList: Array<Record<string, unknown> | null | undefined>) {
  let merged: Record<string, unknown> = {};

  for (let props of propsList) {
    if (!props) {
      continue;
    }

    for (let [key, value] of Object.entries(props)) {
      let previousValue = merged[key];
      if (typeof previousValue === 'function' && typeof value === 'function' && key.startsWith('on')) {
        merged[key] = (...args: unknown[]) => {
          previousValue(...args);
          value(...args);
        };
      } else {
        merged[key] = value;
      }
    }
  }

  return merged;
}

function filterDOMProps(props: Record<string, unknown>) {
  let domProps: Record<string, unknown> = {};

  for (let [key, value] of Object.entries(props)) {
    if (
      key === 'id' ||
      key === 'role' ||
      key === 'title' ||
      key === 'tabIndex' ||
      key === 'lang' ||
      key === 'dir' ||
      key.startsWith('aria-') ||
      key.startsWith('data-')
    ) {
      domProps[key] = value;
    }
  }

  return domProps;
}

vi.mock('@vue-spectrum/utils', async () => {
  let actual = await vi.importActual<typeof import('@vue-spectrum/utils')>('@vue-spectrum/utils');
  return {
    ...actual,
    classNames,
    useDOMRef: () => React.useRef<HTMLDivElement | null>(null),
    useStyleProps: (props: Record<string, unknown> = {}) => ({
      styleProps: {
        className: typeof props.UNSAFE_className === 'string' ? props.UNSAFE_className : undefined,
        style: props.UNSAFE_style,
        'data-testid': props['data-testid']
      }
    })
  };
});

vi.mock('@vue-spectrum/provider', () => ({
  useProvider: () => ({scale: 'medium'})
}));

vi.mock('@vue-aria/i18n', async () => {
  let actual = await vi.importActual<typeof import('@vue-aria/i18n')>('@vue-aria/i18n');
  return {
    ...actual,
    useLocalizedStringFormatter: () => ({
      format: (value: string) => value
    })
  };
});

vi.mock('@vue-aria/focus', () => ({
  FocusRing: ({children}: {children?: React.ReactNode}) => children,
  FocusScope: ({children}: {children?: React.ReactNode}) => children
}));

vi.mock('@vue-aria/utils', () => ({
  filterDOMProps,
  mergeProps,
  useLayoutEffect: React.useEffect
}));

vi.mock('@vue-aria/selection', () => ({
  ListKeyboardDelegate: class ListKeyboardDelegate {}
}));

vi.mock('@vue-aria/gridlist', () => ({
  useGridList: (props: Record<string, unknown>, state: {collection: {size: number}}) => ({
    gridProps: {
      role: 'grid',
      'aria-label': props['aria-label'],
      'aria-rowcount': String(state.collection.size),
      'aria-colcount': '1',
      'data-testid': props['data-testid']
    }
  })
}));

vi.mock('@vue-stately/list', () => ({
  useListState: (props: Record<string, unknown>) => {
    useListStateSpy(props);
    let nodes = toNodesFromProps(props);
    let collection = createCollection(nodes);

    return {
      collection,
      selectionManager: {
        focusedKey: nodes[0]?.key ?? null,
        disabledKeys: new Set<string>(),
        isFocused: false
      }
    };
  }
}));

vi.mock('@vue-aria/virtualizer', () => ({
  Virtualizer: React.forwardRef(function MockVirtualizer(
    props: {
      children: (type: string, item: ListNode) => React.ReactNode,
      collection: {size: number; [Symbol.iterator](): Iterator<ListNode>},
      isLoading?: boolean
    } & Record<string, unknown>,
    ref: React.ForwardedRef<HTMLDivElement>
  ) {
    let {
      children,
      collection,
      isLoading,
      layout: _layout,
      layoutOptions: _layoutOptions,
      onLoadMore: _onLoadMore,
      persistedKeys: _persistedKeys,
      scrollDirection: _scrollDirection,
      ...domProps
    } = props;

    let content: React.ReactNode[] = [];
    for (let item of collection) {
      content.push(
        React.createElement(
          React.Fragment,
          {key: item.key},
          children('item', item)
        )
      );
    }

    if (collection.size === 0) {
      content.push(
        React.createElement(
          React.Fragment,
          {key: 'placeholder'},
          children('placeholder', {key: 'placeholder', index: 0, rendered: null, hasChildNodes: false})
        )
      );
    }

    if (isLoading) {
      content.push(
        React.createElement(
          React.Fragment,
          {key: 'loader'},
          children('loader', {key: 'loader', index: 0, rendered: null, hasChildNodes: false})
        )
      );
    }

    return React.createElement(
      'div',
      {
        ...domProps,
        ref
      },
      content
    );
  })
}));

vi.mock('@vue-spectrum/progress', () => ({
  ProgressCircle: (props: Record<string, unknown>) => React.createElement('div', {
    role: 'progressbar',
    'aria-label': props['aria-label']
  })
}));

vi.mock('../src/ListViewLayout', () => ({
  ListViewLayout: class MockListViewLayout {
    virtualizer = {
      visibleRect: {
        height: 0
      }
    };

    constructor(_opts: Record<string, unknown>) {}

    getContentSize() {
      return {height: 0};
    }

    getLayoutInfo() {
      return {
        rect: {
          height: 40
        }
      };
    }
  }
}));

vi.mock('../src/InsertionIndicator', () => ({
  __esModule: true,
  default: () => null
}));

vi.mock('../src/RootDropIndicator', () => ({
  __esModule: true,
  default: () => null
}));

vi.mock('../src/ListViewItem', () => ({
  ListViewItem: ({item}: {item: ListNode}) => React.createElement(
    'div',
    {
      role: 'row',
      'aria-rowindex': String(item.index + 1)
    },
    React.createElement(
      'div',
      {
        role: 'gridcell',
        'aria-colindex': '1'
      },
      item.rendered
    )
  )
}));
