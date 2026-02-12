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
import {render, waitFor} from '@testing-library/react';
import {useListState} from '@vue-stately/list';
import React, {useRef} from 'react';
import {useSelectableItem, useSelectableList} from '../src';
import userEvent from '@testing-library/user-event';

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    direction: 'ltr',
    locale: 'en-US'
  }),
  useCollator: () => ({
    compare: (a: string, b: string) => String(a).localeCompare(String(b))
  })
}));

if (!(globalThis as any).CSS) {
  (globalThis as any).CSS = {};
}

if (!(globalThis as any).CSS.escape) {
  (globalThis as any).CSS.escape = (value: string) => String(value);
}

function ListItem({item, state}) {
  let ref = useRef<HTMLLIElement>(null);
  let {itemProps} = useSelectableItem({
    key: item.key,
    ref,
    selectionManager: state.selectionManager
  });
  let selected = state.selectionManager.isSelected(item.key);

  return React.createElement(
    'li',
    {
      ...itemProps,
      'aria-selected': selected ? 'true' : undefined,
      ref,
      role: 'option'
    },
    item.rendered
  );
}

function List(props) {
  let ref = useRef<HTMLUListElement>(null);
  let state = useListState(props);
  let {listProps} = useSelectableList({
    ...props,
    selectionManager: state.selectionManager,
    collection: state.collection,
    disabledKeys: state.disabledKeys,
    selectOnFocus: true,
    ref
  });

  return React.createElement(
    'ul',
    {
      ...listProps,
      ref,
      role: 'listbox',
      'aria-label': props['aria-label'] ?? 'test listbox'
    },
    Array.from(state.collection).map(item =>
      React.createElement(ListItem, {
        item,
        key: item.key,
        state
      })
    )
  );
}

describe('useSelectableCollection', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeAll(() => {
    user = userEvent.setup({delay: null});
  });

  it('selects the first item it focuses if selectOnFocus', async () => {
    let {getAllByRole} = render(
      React.createElement(
        List,
        {selectionMode: 'single'},
        React.createElement(Item, null, 'Paco de Lucia'),
        React.createElement(Item, null, 'Vicente Amigo'),
        React.createElement(Item, null, 'Gerardo Nunez')
      )
    );
    let options = getAllByRole('option');
    expect(options[0].getAttribute('aria-selected')).toBeNull();
    await user.tab();
    expect(document.activeElement).toBe(options[0]);
    await waitFor(() => {
      expect(options[0].getAttribute('aria-selected')).toBe('true');
    });
  });

  it('can navigate without replacing the selection in multiple selection selectOnFocus', async () => {
    let {getAllByRole} = render(
      React.createElement(
        List,
        {selectionMode: 'multiple', selectionBehavior: 'replace'},
        React.createElement(Item, null, 'Paco de Lucia'),
        React.createElement(Item, null, 'Vicente Amigo'),
        React.createElement(Item, null, 'Gerardo Nunez')
      )
    );
    let options = getAllByRole('option');
    expect(options[0].getAttribute('aria-selected')).toBeNull();
    await user.tab();
    expect(document.activeElement).toBe(options[0]);
    await waitFor(() => {
      expect(options[0].getAttribute('aria-selected')).toBe('true');
      expect(options[1].getAttribute('aria-selected')).toBeNull();
      expect(options[2].getAttribute('aria-selected')).toBeNull();
    });

    await user.keyboard('{Control>}{ArrowDown}{/Control}');
    expect(document.activeElement).toBe(options[1]);
    await waitFor(() => {
      expect(options[0].getAttribute('aria-selected')).toBe('true');
      expect(options[1].getAttribute('aria-selected')).toBeNull();
      expect(options[2].getAttribute('aria-selected')).toBeNull();
    });

    await user.keyboard('{Control>}{ArrowDown}{/Control}');
    expect(document.activeElement).toBe(options[2]);
    await waitFor(() => {
      expect(options[0].getAttribute('aria-selected')).toBe('true');
      expect(options[1].getAttribute('aria-selected')).toBeNull();
      expect(options[2].getAttribute('aria-selected')).toBeNull();
    });

    await user.keyboard(' ');
    await waitFor(() => {
      expect(options[0].getAttribute('aria-selected')).toBeNull();
      expect(options[1].getAttribute('aria-selected')).toBeNull();
      expect(options[2].getAttribute('aria-selected')).toBe('true');
    });
  });
});
