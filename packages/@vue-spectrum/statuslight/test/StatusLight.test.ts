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

import {StatusLight} from '../src';
import React from 'react';
import {render, screen} from '@testing-library/react';

vi.mock('@vue-spectrum/provider', () => ({
  useProviderProps: <T,>(props: T) => props
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  })
}));

describe('StatusLight', () => {
  it('renders with default props', () => {
    render(
      React.createElement(
        StatusLight,
        {id: 'status-light'},
        'StatusLight of Love'
      )
    );

    let statusLight = screen.getByText('StatusLight of Love');
    expect(statusLight.getAttribute('id')).toBe('status-light');
  });

  it('supports variant and aria-label', () => {
    render(
      React.createElement(StatusLight, {
        id: 'status-light',
        role: 'status',
        variant: 'celery',
        'aria-label': 'StatusLight of Love'
      })
    );

    let statusLight = screen.getByLabelText('StatusLight of Love');
    expect(statusLight.getAttribute('id')).toBe('status-light');
  });

  it('warns if no label is provided when there are no children', () => {
    let spyWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      React.createElement(StatusLight, {
        id: 'status-light',
        variant: 'celery'
      })
    );

    expect(spyWarn).toHaveBeenCalledWith('If no children are provided, an aria-label must be specified');
    spyWarn.mockRestore();
  });

  it('warns if label is provided without a role', () => {
    let spyWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      React.createElement(StatusLight, {
        id: 'status-light',
        variant: 'celery',
        'aria-label': 'test'
      })
    );

    expect(spyWarn).toHaveBeenCalledWith('A labelled StatusLight must have a role.');
    spyWarn.mockRestore();
  });

  it('supports disabled state', () => {
    render(
      React.createElement(
        StatusLight,
        {
          id: 'status-light',
          isDisabled: true
        },
        'StatusLight of Love'
      )
    );

    let statusLight = screen.getByText('StatusLight of Love');
    expect(statusLight.getAttribute('id')).toBe('status-light');
  });

  it('forwards ref', () => {
    let ref = React.createRef<{UNSAFE_getDOMNode(): HTMLElement | null}>();

    render(
      React.createElement(
        StatusLight,
        {ref},
        'StatusLight of Love'
      )
    );

    let statusLight = screen.getByText('StatusLight of Love');
    expect(ref.current?.UNSAFE_getDOMNode()).toBe(statusLight);
  });
});
