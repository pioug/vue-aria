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
import {fireEvent, render, screen} from '@testing-library/react';

import './testSetup';
import {Checkbox, CheckboxGroup} from '../src';

describe('CheckboxGroup', () => {
  it('handles defaults and selection change', () => {
    let onChangeSpy = vi.fn();

    render(
      React.createElement(
        CheckboxGroup,
        {
          label: 'Favorite Pet',
          onChange: onChangeSpy
        },
        React.createElement(Checkbox, {value: 'dogs'}, 'Dogs'),
        React.createElement(Checkbox, {value: 'cats'}, 'Cats'),
        React.createElement(Checkbox, {value: 'dragons'}, 'Dragons')
      )
    );

    let checkboxGroup = screen.getByRole('group');
    let checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(checkboxGroup).toBeTruthy();
    expect(checkboxes).toHaveLength(3);

    expect(checkboxes[0].value).toBe('dogs');
    expect(checkboxes[1].value).toBe('cats');
    expect(checkboxes[2].value).toBe('dragons');

    fireEvent.click(screen.getByLabelText('Dragons'));
    expect(onChangeSpy).toHaveBeenCalledWith(['dragons']);
    expect(checkboxes[2].checked).toBe(true);
  });

  it('name can be controlled', () => {
    render(
      React.createElement(
        CheckboxGroup,
        {
          label: 'Favorite Pet',
          name: 'awesome-react-aria'
        },
        React.createElement(Checkbox, {value: 'dogs'}, 'Dogs'),
        React.createElement(Checkbox, {value: 'cats'}, 'Cats'),
        React.createElement(Checkbox, {value: 'dragons'}, 'Dragons')
      )
    );

    let checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0].getAttribute('name')).toBe('awesome-react-aria');
    expect(checkboxes[1].getAttribute('name')).toBe('awesome-react-aria');
    expect(checkboxes[2].getAttribute('name')).toBe('awesome-react-aria');
  });

  it('sets aria-disabled when isDisabled is true', () => {
    render(
      React.createElement(
        CheckboxGroup,
        {
          label: 'Favorite Pet',
          isDisabled: true
        },
        React.createElement(Checkbox, {value: 'dogs'}, 'Dogs'),
        React.createElement(Checkbox, {value: 'cats'}, 'Cats'),
        React.createElement(Checkbox, {value: 'dragons'}, 'Dragons')
      )
    );

    let checkboxGroup = screen.getByRole('group');
    let checkboxes = screen.getAllByRole('checkbox');

    expect(checkboxGroup.getAttribute('aria-disabled')).toBe('true');
    expect(checkboxes[0].hasAttribute('disabled')).toBe(true);
    expect(checkboxes[1].hasAttribute('disabled')).toBe(true);
    expect(checkboxes[2].hasAttribute('disabled')).toBe(true);
  });
});
