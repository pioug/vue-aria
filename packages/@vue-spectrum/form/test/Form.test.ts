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

import {Form} from '../src';
import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@vue-spectrum/provider', () => ({
  Provider: ({children}: {children: React.ReactNode}) => React.createElement(React.Fragment, null, children),
  useProviderProps: <T,>(props: T) => props
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  })
}));

describe('Form', () => {
  it('renders a form', () => {
    render(
      React.createElement(Form, {'aria-label': 'Home'})
    );

    let form = screen.getByRole('form');
    expect(form).toBeTruthy();
    expect(form.hasAttribute('novalidate')).toBe(true);
  });

  it('renders children inside the form and attaches a ref', () => {
    let ref = React.createRef<{UNSAFE_getDOMNode(): HTMLElement | null}>();

    render(
      React.createElement(
        Form,
        {
          'aria-label': 'Home',
          ref
        },
        React.createElement('button', null, 'Test')
      )
    );

    let form = screen.getByRole('form');
    let button = screen.getByRole('button');
    expect(button).toBeTruthy();
    expect(ref.current?.UNSAFE_getDOMNode()).toBe(form);
  });

  it('supports form attributes and submit handlers', async () => {
    let user = userEvent.setup();
    let onSubmit = vi.fn((e: Event) => e.preventDefault());

    render(
      React.createElement(
        Form,
        {
          'aria-label': 'Test',
          onSubmit,
          action: '/action_page.php',
          method: 'get',
          target: '_self',
          encType: 'text/plain',
          autoComplete: 'on'
        },
        React.createElement('button', {type: 'submit', 'aria-label': 'Submit'}, 'Submit')
      )
    );

    let form = screen.getByRole('form');
    expect(form.getAttribute('action')).toContain('/action_page.php');
    expect(form.getAttribute('method')).toBe('get');
    expect(form.getAttribute('target')).toBe('_self');
    expect(form.getAttribute('enctype')).toBe('text/plain');
    expect(form.getAttribute('autocomplete')).toBe('on');

    await user.click(screen.getByLabelText('Submit'));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('supports aria and custom data attributes', () => {
    render(
      React.createElement(
        React.Fragment,
        null,
        React.createElement('span', {id: 'test'}, 'Test'),
        React.createElement(Form, {
          'aria-label': 'Test',
          'aria-labelledby': 'test',
          'aria-describedby': 'test',
          'data-testid': 'form-test'
        })
      )
    );

    let form = screen.getByRole('form');
    expect(form.getAttribute('aria-label')).toBe('Test');
    expect(form.getAttribute('aria-labelledby')).toBe('test');
    expect(form.getAttribute('aria-describedby')).toBe('test');
    expect(form.getAttribute('data-testid')).toBe('form-test');
  });
});
