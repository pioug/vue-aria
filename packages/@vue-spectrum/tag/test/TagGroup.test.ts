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

import React from 'react';
import {fireEvent, render} from '@testing-library/react';

vi.mock('@vue-spectrum/provider', () => ({
  Provider: ({children}: {children?: React.ReactNode}) => children,
  useProviderProps: <T,>(props: T) => props,
  useProvider: () => ({
    scale: 'medium'
  })
}));

vi.mock('@vue-aria/i18n', async () => {
  let actual = await vi.importActual<typeof import('@vue-aria/i18n')>('@vue-aria/i18n');
  return {
    ...actual,
    useLocale: () => ({
      locale: 'en-US',
      direction: 'ltr'
    }),
    useLocalizedStringFormatter: () => ({
      format: (key: string, values?: {tagCount?: number}) => {
        if (key === 'showAllButtonLabel') {
          return `showAll:${values?.tagCount ?? 0}`;
        }

        return key;
      }
    })
  };
});

vi.mock('@vue-aria/utils', async () => {
  let actual = await vi.importActual<typeof import('@vue-aria/utils')>('@vue-aria/utils');
  return {
    ...actual,
    useResizeObserver: () => undefined,
    useSyntheticLinkProps: (props?: {href?: string, target?: string, rel?: string, download?: string, ping?: string, referrerPolicy?: string}) => ({
      'data-href': props?.href,
      'data-target': props?.target,
      'data-rel': props?.rel,
      'data-download': props?.download,
      'data-ping': props?.ping,
      'data-referrer-policy': props?.referrerPolicy
    }),
    useRouter: () => ({
      isNative: true,
      open: () => undefined,
      useHref: (href: string) => href
    })
  };
});

vi.mock('@vue-spectrum/label', () => ({
  Field: ({children}: {children?: React.ReactNode}) => children
}));

vi.mock('@vue-spectrum/button', () => ({
  ActionButton: ({children, onPress, ...props}: {children?: React.ReactNode, onPress?: () => void} & Record<string, unknown>) => (
    React.createElement(
      'button',
      {
        ...props,
        onClick: onPress
      },
      children
    )
  ),
  ClearButton: ({children, onPress, ...props}: {children?: React.ReactNode, onPress?: () => void} & Record<string, unknown>) => (
    React.createElement(
      'button',
      {
        ...props,
        onClick: onPress
      },
      children
    )
  )
}));

import {Item, TagGroup} from '../src';

function renderComponent(props: Record<string, unknown> = {}) {
  return render(
    React.createElement(
      TagGroup,
      {
        'aria-label': 'tag group',
        ...props
      },
      React.createElement(Item, {key: '1', 'aria-label': 'Tag 1'}, 'Tag 1'),
      React.createElement(Item, {key: '2', 'aria-label': 'Tag 2'}, 'Tag 2'),
      React.createElement(Item, {key: '3', 'aria-label': 'Tag 3'}, 'Tag 3')
    )
  );
}

describe('TagGroup', () => {
  it('provides context for Tag component', () => {
    let onRemove = vi.fn();
    let tree = renderComponent({onRemove});
    let tags = tree.getAllByRole('row');

    expect(tags.length).toBe(3);

    fireEvent.keyDown(tags[1], {key: 'Delete'});
    fireEvent.keyUp(tags[1], {key: 'Delete'});
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility roles', () => {
    let tree = renderComponent();
    let tagGroup = tree.getByRole('grid');
    let tags = tree.getAllByRole('row');
    let cells = tree.getAllByRole('gridcell');

    expect(tagGroup).toBeTruthy();
    expect(tags.length).toBe(cells.length);
  });
});
