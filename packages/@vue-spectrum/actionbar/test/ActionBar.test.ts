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

import {ActionBar} from '../src';
import {announce} from '@vue-aria/live-announcer';
import React from 'react';
import {fireEvent, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@vue-aria/live-announcer', () => ({
  announce: vi.fn()
}));

vi.mock('@vue-spectrum/provider', () => ({
  useProviderProps: <T,>(props: T) => props
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  }),
  useLocalizedStringFormatter: () => ({
    format: (key: string, vars?: {count?: number | 'all'}) => {
      if (key === 'actions') {
        return 'Actions';
      }

      if (key === 'clearSelection') {
        return 'Clear selection';
      }

      if (key === 'actionsAvailable') {
        return 'Actions available.';
      }

      if (key === 'selectedAll') {
        return 'All selected';
      }

      if (key === 'selected') {
        return `${vars?.count ?? 0} selected`;
      }

      return key;
    }
  })
}));

vi.mock('@vue-spectrum/overlays', () => ({
  OpenTransition: ({in: isOpen, children}: {in?: boolean; children: React.ReactNode}) => isOpen
    ? React.createElement(React.Fragment, null, children)
    : null
}));

vi.mock('@vue-aria/focus', () => ({
  FocusScope: ({children}: {children: React.ReactNode}) => React.createElement(React.Fragment, null, children)
}));

vi.mock('@vue-spectrum/text', () => ({
  Text: ({children, UNSAFE_className, className, ...props}: any) => React.createElement(
    'span',
    {
      ...props,
      className: [className, UNSAFE_className].filter(Boolean).join(' ')
    },
    children
  )
}));

vi.mock('@vue-spectrum/button', () => ({
  ActionButton: ({children, onPress, UNSAFE_className, className, gridArea, isQuiet, staticColor, ...props}: any) => React.createElement(
    'button',
    {
      ...props,
      className: [className, UNSAFE_className].filter(Boolean).join(' '),
      onClick: () => onPress?.()
    },
    children
  )
}));

vi.mock('@vue-spectrum/actiongroup', () => ({
  ActionGroup: ({items = [], onAction, disabledKeys = [], ...props}: any) => {
    let disabled = new Set(Array.isArray(disabledKeys) ? disabledKeys : [...disabledKeys]);

    return React.createElement(
      'div',
      {
        role: 'toolbar',
        'aria-label': props['aria-label']
      },
      items.map((item: {key: string; name?: string}) => React.createElement(
        'button',
        {
          key: item.key,
          disabled: disabled.has(item.key),
          onClick: () => onAction?.(item.key)
        },
        item.name ?? item.key
      ))
    );
  }
}));

let items = [
  {key: 'edit', name: 'Edit'},
  {key: 'delete', name: 'Delete'}
];

function renderActionBar(props: Record<string, unknown> = {}) {
  let onAction = vi.fn();
  let onClearSelection = vi.fn();

  let view = render(
    React.createElement(ActionBar, {
      items,
      onAction,
      onClearSelection,
      selectedItemCount: 1,
      ...props
    })
  );

  return {
    ...view,
    onAction,
    onClearSelection
  };
}

describe('ActionBar', () => {
  beforeEach(() => {
    vi.mocked(announce).mockClear();
  });

  it('should open when there are selected items', () => {
    renderActionBar();

    let toolbar = screen.getByRole('toolbar');
    expect(toolbar.getAttribute('aria-label')).toBe('Actions');
    expect(screen.getByText('1 selected')).toBeTruthy();
    expect(screen.getByLabelText('Clear selection')).toBeTruthy();
    expect(announce).toHaveBeenCalledWith('Actions available.');
  });

  it('should update the selected count when selecting more items', () => {
    let tree = renderActionBar();
    let selectedCount = screen.getByText('1 selected');
    expect(selectedCount).toBeTruthy();

    tree.rerender(
      React.createElement(ActionBar, {
        items,
        onAction: tree.onAction,
        onClearSelection: tree.onClearSelection,
        selectedItemCount: 2
      })
    );

    expect(selectedCount.textContent).toBe('2 selected');
  });

  it('should work with select all', () => {
    renderActionBar({selectedItemCount: 'all'});
    expect(screen.getByText('All selected')).toBeTruthy();
  });

  it('should close when pressing the clear button or escape key', async () => {
    let user = userEvent.setup();
    let tree = renderActionBar();
    let clearButton = screen.getByLabelText('Clear selection');

    await user.click(clearButton);
    expect(tree.onClearSelection).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(clearButton, {key: 'Escape'});
    expect(tree.onClearSelection).toHaveBeenCalledTimes(2);
  });

  it('should fire onAction and respect disabledKeys', async () => {
    let user = userEvent.setup();
    let tree = renderActionBar({disabledKeys: ['edit']});
    let actionButtons = within(screen.getByRole('toolbar')).getAllByRole('button');

    expect(actionButtons[0].hasAttribute('disabled')).toBe(true);
    expect(actionButtons[1].hasAttribute('disabled')).toBe(false);

    await user.click(actionButtons[0]);
    expect(tree.onAction).toHaveBeenCalledTimes(0);

    await user.click(actionButtons[1]);
    expect(tree.onAction).toHaveBeenCalledWith('delete');
  });
});
