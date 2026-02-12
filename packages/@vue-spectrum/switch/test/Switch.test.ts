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

import {Switch} from '../src';
import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@vue-spectrum/provider', () => ({
  useProviderProps: <T,>(props: T) => props
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  })
}));

describe('Switch', () => {
  it('default unchecked can be checked', async () => {
    let onChange = vi.fn();
    let user = userEvent.setup();

    render(
      React.createElement(
        Switch,
        {onChange},
        'Click Me'
      )
    );

    let input = screen.getByLabelText('Click Me') as HTMLInputElement;
    expect(input.value).toBe('on');
    expect(input.checked).toBe(false);

    await user.click(input);
    expect(onChange).toHaveBeenNthCalledWith(1, true);
  });

  it('supports defaultSelected and custom value', async () => {
    let onChange = vi.fn();
    let user = userEvent.setup();

    render(
      React.createElement(
        Switch,
        {
          onChange,
          defaultSelected: true,
          value: 'newsletter'
        },
        'Click Me'
      )
    );

    let input = screen.getByLabelText('Click Me') as HTMLInputElement;
    expect(input.value).toBe('newsletter');
    expect(input.checked).toBe(true);

    await user.click(input);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('supports controlled selected state', async () => {
    let onChange = vi.fn();
    let user = userEvent.setup();

    render(
      React.createElement(
        Switch,
        {
          onChange,
          isSelected: true
        },
        'Click Me'
      )
    );

    let input = screen.getByLabelText('Click Me') as HTMLInputElement;
    expect(input.checked).toBe(true);

    await user.click(input);
    expect(input.checked).toBe(true);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('supports disabled and readOnly', async () => {
    let onChangeDisabled = vi.fn();
    let onChangeReadonly = vi.fn();
    let user = userEvent.setup();

    let {rerender} = render(
      React.createElement(
        Switch,
        {
          onChange: onChangeDisabled,
          isDisabled: true
        },
        'Click Me'
      )
    );

    let input = screen.getByLabelText('Click Me') as HTMLInputElement;
    await user.click(input);
    expect(input.checked).toBe(false);
    expect(onChangeDisabled).not.toHaveBeenCalled();

    rerender(
      React.createElement(
        Switch,
        {
          onChange: onChangeReadonly,
          isSelected: true,
          isReadOnly: true
        },
        'Click Me'
      )
    );

    input = screen.getByLabelText('Click Me') as HTMLInputElement;
    await user.click(input);
    expect(input.checked).toBe(true);
    expect(onChangeReadonly).not.toHaveBeenCalled();
  });

  it('supports aria props, tab exclusion, and additional props', () => {
    render(
      React.createElement(
        React.Fragment,
        null,
        React.createElement('span', {id: 'label-id'}, 'Label'),
        React.createElement('span', {id: 'desc-id'}, 'Description'),
        React.createElement(
          Switch,
          {
            'aria-label': 'not visible',
            'aria-labelledby': 'label-id',
            'aria-describedby': 'desc-id',
            excludeFromTabOrder: true,
            'data-testid': 'switch-label'
          },
          'Click Me'
        )
      )
    );

    let input = screen.getByRole('switch');
    expect(input.getAttribute('aria-label')).toBe('not visible');
    expect(input.getAttribute('aria-labelledby')).toBe('label-id');
    expect(input.getAttribute('aria-describedby')).toBe('desc-id');
    expect(input.getAttribute('tabindex')).toBe('-1');
    expect(screen.getByTestId('switch-label')).toBeTruthy();
  });

  it('supports form reset', async () => {
    let user = userEvent.setup();

    function Test() {
      let [isSelected, setSelected] = React.useState(false);
      return React.createElement(
        'form',
        null,
        React.createElement(
          Switch,
          {
            'data-testid': 'switch',
            isSelected,
            onChange: setSelected
          },
          'Switch'
        ),
        React.createElement('input', {type: 'reset', 'data-testid': 'reset'})
      );
    }

    render(React.createElement(Test));

    let input = screen.getByTestId('switch') as HTMLInputElement;
    expect(input.checked).toBe(false);

    await user.click(input);
    expect(input.checked).toBe(true);

    let reset = screen.getByTestId('reset');
    await user.click(reset);
    expect(input.checked).toBe(false);
  });
});
