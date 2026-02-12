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

import {Item} from '@vue-stately/collections';
import {render} from '@testing-library/react';
import {useTreeState} from '@vue-stately/tree';
import React from 'react';
import {useMenu, useMenuItem} from '../src';
import userEvent from '@testing-library/user-event';

vi.mock('@vue-aria/utils', async () => {
  let actual = await vi.importActual<any>('@vue-aria/utils');
  return {
    ...actual,
    useRouter: () => ({
      isNative: true,
      open: () => {},
      useHref: (href: string) => href
    }),
    useLinkProps: (props: any = {}) => ({
      href: props.href,
      target: props.target,
      rel: props.rel,
      download: props.download,
      ping: props.ping,
      referrerPolicy: props.referrerPolicy
    })
  };
});

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

function Menu(props) {
  let state = useTreeState(props);
  let ref = React.useRef<HTMLUListElement>(null);
  let {menuProps} = useMenu(props, state, ref);

  return React.createElement(
    'ul',
    {
      ...menuProps,
      ref
    },
    Array.from(state.collection).map(item => React.createElement(MenuItem, {
      item,
      key: item.key,
      onAction: props.onSelect,
      state
    }))
  );
}

function MenuItem({item, state, onAction}) {
  let ref = React.useRef<HTMLLIElement>(null);
  let {menuItemProps, isSelected} = useMenuItem({
    key: item.key,
    onAction
  }, state, ref);

  return React.createElement(
    'li',
    {
      ...menuItemProps,
      ref
    },
    item.rendered,
    isSelected
      ? React.createElement(
          'span',
          {'aria-hidden': 'true'},
          '✅'
        )
      : null
  );
}

function VirtualizedMenuItem({item, state, onAction}) {
  let ref = React.useRef<HTMLLIElement>(null);
  let {menuItemProps} = useMenuItem({
    key: item.key,
    onAction,
    isVirtualized: true
  }, state, ref);

  return React.createElement(
    'li',
    {
      ...menuItemProps,
      ref
    },
    item.rendered
  );
}

function VirtualizedMenu(props) {
  let state = useTreeState(props);
  let ref = React.useRef<HTMLUListElement>(null);
  let {menuProps} = useMenu(props, state, ref);

  return React.createElement(
    'ul',
    {
      ...menuProps,
      ref
    },
    Array.from(state.collection).map(item => React.createElement(VirtualizedMenuItem, {
      item,
      key: item.key,
      state
    }))
  );
}

describe('useMenu', function () {
  let user: ReturnType<typeof userEvent.setup>;

  beforeAll(() => {
    user = userEvent.setup({delay: null});
  });

  it('calls an onAction passed directly to useMenuItem', async () => {
    let onSelect = vi.fn();
    let {getAllByRole} = render(
      React.createElement(
        Menu,
        {
          'aria-label': 'test menu',
          onSelect
        },
        React.createElement(Item, {key: '1'}, 'One'),
        React.createElement(Item, {key: '2'}, 'Two'),
        React.createElement(Item, {key: '3'}, 'Three')
      )
    );

    let items = getAllByRole('menuitem');
    await user.click(items[0]);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});

describe('useMenuItem with isVirtualized', function () {
  it('sets correct aria-posinset (1-based) for virtualized menu items', () => {
    let {getAllByRole} = render(
      React.createElement(
        VirtualizedMenu,
        {'aria-label': 'test menu'},
        React.createElement(Item, {key: '1'}, 'One'),
        React.createElement(Item, {key: '2'}, 'Two'),
        React.createElement(Item, {key: '3'}, 'Three')
      )
    );

    let items = getAllByRole('menuitem');
    expect(items[0].getAttribute('aria-posinset')).toBe('1');
    expect(items[1].getAttribute('aria-posinset')).toBe('2');
    expect(items[2].getAttribute('aria-posinset')).toBe('3');
  });

  it('sets correct aria-setsize for virtualized menu items', () => {
    let {getAllByRole} = render(
      React.createElement(
        VirtualizedMenu,
        {'aria-label': 'test menu'},
        React.createElement(Item, {key: '1'}, 'One'),
        React.createElement(Item, {key: '2'}, 'Two'),
        React.createElement(Item, {key: '3'}, 'Three')
      )
    );

    let items = getAllByRole('menuitem');
    expect(items[0].getAttribute('aria-setsize')).toBe('3');
    expect(items[1].getAttribute('aria-setsize')).toBe('3');
    expect(items[2].getAttribute('aria-setsize')).toBe('3');
  });
});
