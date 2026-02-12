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

import {Radio, RadioGroup} from '../src';
import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@vue-spectrum/provider', () => ({
  useProviderProps: <T,>(props: T) => props
}));

vi.mock('@vue-spectrum/form', () => ({
  useFormProps: <T,>(props: T) => props
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  })
}));

vi.mock('@vue-spectrum/label', () => ({
  Field: ({children}: {children: React.ReactNode}) => children
}));

function renderRadioGroup(groupProps: Record<string, unknown> = {}, radioProps: Array<Record<string, unknown>> = [{}, {}, {}]) {
  return render(
    React.createElement(
      RadioGroup,
      {
        'aria-label': 'favorite pet',
        ...groupProps
      },
      React.createElement(Radio, {...radioProps[0], value: 'dogs'}, 'Dogs'),
      React.createElement(Radio, {...radioProps[1], value: 'cats'}, 'Cats'),
      React.createElement(Radio, {...radioProps[2], value: 'dragons'}, 'Dragons')
    )
  );
}

describe('Radio', () => {
  it('handles defaults', async () => {
    let onChange = vi.fn();
    let user = userEvent.setup();

    renderRadioGroup({onChange});

    let radioGroup = screen.getByRole('radiogroup');
    let radios = screen.getAllByRole('radio') as HTMLInputElement[];

    expect(radioGroup).toBeTruthy();
    expect(radios.length).toBe(3);

    let groupName = radios[0].getAttribute('name');
    radios.forEach((radio) => {
      expect(radio.getAttribute('name')).toBe(groupName);
    });

    expect(radios[0].checked).toBe(false);
    expect(radios[1].checked).toBe(false);
    expect(radios[2].checked).toBe(false);

    await user.click(screen.getByLabelText('Dogs'));
    expect(onChange).toHaveBeenCalledWith('dogs');
  });

  it('supports individual disabled radios', async () => {
    let onChange = vi.fn();
    let user = userEvent.setup();

    renderRadioGroup({onChange}, [{}, {isDisabled: true}, {}]);

    let radios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(radios[0].hasAttribute('disabled')).toBe(false);
    expect(radios[1].hasAttribute('disabled')).toBe(true);
    expect(radios[2].hasAttribute('disabled')).toBe(false);

    await user.click(screen.getByLabelText('Cats'));
    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByLabelText('Dogs'));
    expect(onChange).toHaveBeenCalledWith('dogs');
  });

  it('supports readonly group and default value', async () => {
    let onChange = vi.fn();
    let user = userEvent.setup();

    let {rerender} = renderRadioGroup({isReadOnly: true, onChange, defaultValue: 'dragons'});

    let radioGroup = screen.getByRole('radiogroup');
    let radios = screen.getAllByRole('radio') as HTMLInputElement[];

    expect(radioGroup.getAttribute('aria-readonly')).toBe('true');

    await user.click(screen.getByLabelText('Dogs'));
    expect(onChange).not.toHaveBeenCalled();

    rerender(
      React.createElement(
        RadioGroup,
        {
          'aria-label': 'favorite pet',
          value: 'dragons',
          onChange
        },
        React.createElement(Radio, {value: 'dogs'}, 'Dogs'),
        React.createElement(Radio, {value: 'cats'}, 'Cats'),
        React.createElement(Radio, {value: 'dragons'}, 'Dragons')
      )
    );

    await user.click(screen.getByLabelText('Dogs'));
    expect(onChange).toHaveBeenCalledWith('dogs');
  });

  it('supports aria and custom data attributes on the group', () => {
    render(
      React.createElement(
        React.Fragment,
        null,
        React.createElement('span', {id: 'label-id'}, 'Favorite pet'),
        React.createElement(
          RadioGroup,
          {
            'aria-labelledby': 'label-id',
            'aria-describedby': 'label-id',
            'data-testid': 'radio-group'
          },
          React.createElement(Radio, {value: 'dogs', 'aria-label': 'dogs'}),
          React.createElement(Radio, {value: 'cats', 'aria-label': 'cats'})
        )
      )
    );

    let group = screen.getByTestId('radio-group');
    expect(group.getAttribute('aria-labelledby')).toBe('label-id');
    expect((group.getAttribute('aria-describedby') || '').includes('label-id')).toBe(true);
  });
});
