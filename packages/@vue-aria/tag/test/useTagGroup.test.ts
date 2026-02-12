/*
 * Copyright 2023 Adobe. All rights reserved.
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
import {render, within} from '@testing-library/react';
import {useButton} from '@vue-aria/button';
import {useListState} from '@vue-stately/list';
import React from 'react';
import {useTag, useTagGroup} from '../src';
import userEvent from '@testing-library/user-event';

vi.mock('@vue-aria/utils', async () => {
  let actual = await vi.importActual<any>('@vue-aria/utils');
  return {
    ...actual,
    useSyntheticLinkProps: () => ({})
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
    format: (key: string) => key
  })
}));

if (!(globalThis as any).CSS) {
  (globalThis as any).CSS = {};
}

if (!(globalThis as any).CSS.escape) {
  (globalThis as any).CSS.escape = (value: string) => String(value);
}

function TagGroup(props) {
  let ref = React.useRef<HTMLDivElement>(null);
  let state = useListState(props);
  let {gridProps} = useTagGroup(props, state, ref);

  return React.createElement(
    'div',
    {
      className: 'tag-group',
      ref
    },
    React.createElement(
      'div',
      gridProps,
      Array.from(state.collection).map(item => React.createElement(Tag, {
        item,
        key: item.key,
        state
      }))
    )
  );
}

function Tag(props) {
  let {item, state} = props;
  let ref = React.useRef<HTMLDivElement>(null);
  let {rowProps, gridCellProps, removeButtonProps, allowsRemoving} = useTag(props, state, ref);

  return React.createElement(
    'div',
    {
      ...rowProps,
      ref
    },
    React.createElement(
      'div',
      gridCellProps,
      item.rendered,
      allowsRemoving
        ? React.createElement(Button, removeButtonProps, 'x')
        : null
    )
  );
}

function Button(props) {
  let ref = React.useRef<HTMLButtonElement>(null);
  let {buttonProps} = useButton(props, ref);
  return React.createElement(
    'button',
    {
      ...buttonProps,
      ref
    },
    props.children
  );
}

describe('useTagGroup', function () {
  let user: ReturnType<typeof userEvent.setup>;
  beforeAll(() => {
    user = userEvent.setup({delay: null});
  });

  it('should support selection', async () => {
    let onRemove = vi.fn();
    let {getAllByRole} = render(
      React.createElement(
        TagGroup,
        {
          defaultSelectedKeys: ['parking'],
          label: 'Amenities',
          onRemove,
          selectionMode: 'multiple'
        },
        React.createElement(Item, {key: 'laundry'}, 'Laundry'),
        React.createElement(Item, {key: 'fitness'}, 'Fitness center'),
        React.createElement(Item, {key: 'parking'}, 'Parking'),
        React.createElement(Item, {key: 'pool'}, 'Swimming pool'),
        React.createElement(Item, {key: 'breakfast'}, 'Breakfast')
      )
    );

    let tags = getAllByRole('row');
    expect(tags).toHaveLength(5);
    expect(tags[0].getAttribute('aria-selected')).toBe('false');
    expect(tags[1].getAttribute('aria-selected')).toBe('false');
    expect(tags[2].getAttribute('aria-selected')).toBe('true');
    expect(tags[3].getAttribute('aria-selected')).toBe('false');
    expect(tags[4].getAttribute('aria-selected')).toBe('false');

    await user.click(tags[3]);
    expect(tags[0].getAttribute('aria-selected')).toBe('false');
    expect(tags[1].getAttribute('aria-selected')).toBe('false');
    expect(tags[2].getAttribute('aria-selected')).toBe('true');
    expect(tags[3].getAttribute('aria-selected')).toBe('true');
    expect(tags[4].getAttribute('aria-selected')).toBe('false');

    await user.keyboard('{Backspace}');
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenLastCalledWith(new Set(['parking', 'pool']));

    await user.click(tags[0]);
    await user.keyboard('{Backspace}');
    expect(onRemove).toHaveBeenCalledTimes(2);
    expect(onRemove).toHaveBeenLastCalledWith(new Set(['laundry', 'parking', 'pool']));

    let button = within(tags[3]).getByRole('button');
    await user.click(button);
    expect(onRemove).toHaveBeenCalledTimes(3);
    expect(onRemove).toHaveBeenLastCalledWith(new Set(['pool']));
  });

  it('should support tabbing to tags and arrow navigation between tags', async () => {
    let {getAllByRole} = render(
      React.createElement(
        TagGroup,
        {
          label: 'Amenities'
        },
        React.createElement(Item, {key: 'laundry'}, 'Laundry'),
        React.createElement(Item, {key: 'fitness'}, 'Fitness center'),
        React.createElement(Item, {key: 'parking'}, 'Parking')
      )
    );

    let tags = getAllByRole('row');
    expect(tags).toHaveLength(3);
    expect(document.activeElement).not.toBe(tags[0]);

    await user.tab();
    expect(document.activeElement).toBe(tags[0]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tags[1]);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tags[2]);

    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tags[1]);
  });

  it('should support tabbing to remove buttons', async () => {
    let onRemove = vi.fn();
    let {getAllByRole, getAllByText} = render(
      React.createElement(
        TagGroup,
        {
          label: 'Amenities',
          onRemove
        },
        React.createElement(Item, {key: 'laundry'}, 'Laundry'),
        React.createElement(Item, {key: 'fitness'}, 'Fitness center'),
        React.createElement(Item, {key: 'parking'}, 'Parking')
      )
    );

    let tags = getAllByRole('row');
    let removeButtons = getAllByText('x');
    expect(removeButtons).toHaveLength(3);

    await user.tab();
    expect(document.activeElement).toBe(tags[0]);

    await user.tab();
    expect(document.activeElement).toBe(removeButtons[0]);

    await user.keyboard(' ');
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenLastCalledWith(new Set(['laundry']));
  });

  it('should support keyboard selection while navigating between tags', async () => {
    let onSelectionChange = vi.fn();
    let {getAllByRole} = render(
      React.createElement(
        TagGroup,
        {
          label: 'Amenities',
          onSelectionChange,
          selectionMode: 'multiple'
        },
        React.createElement(Item, {key: 'laundry'}, 'Laundry'),
        React.createElement(Item, {key: 'fitness'}, 'Fitness center'),
        React.createElement(Item, {key: 'parking'}, 'Parking')
      )
    );

    let tags = getAllByRole('row');
    await user.tab();
    expect(document.activeElement).toBe(tags[0]);

    await user.keyboard(' ');
    expect(onSelectionChange).toHaveBeenCalledTimes(1);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tags[1]);

    await user.keyboard(' ');
    expect(onSelectionChange).toHaveBeenCalledTimes(2);

    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tags[2]);
  });
});
