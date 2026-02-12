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

import Checkmark from '@spectrum-icons/workflow/Checkmark';
import {SearchField} from '../src';
import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const testId = 'test-id';
const inputText = 'blah';

vi.mock('@vue-spectrum/provider', () => ({
  useProviderProps: <T,>(props: T) => props
}));

vi.mock('@vue-spectrum/form', () => ({
  useFormProps: <T,>(props: T) => props
}));

vi.mock('@vue-spectrum/text', () => ({
  Heading: ({children, ...props}: any) => React.createElement('h3', props, children),
  Text: ({children, ...props}: any) => React.createElement('span', props, children)
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  }),
  useLocalizedStringFormatter: () => ({
    format: (value: string) => value
  })
}));

vi.mock('@vue-spectrum/textfield', () => ({
  TextFieldBase: (props: any) => {
    let {
      inputProps = {},
      inputRef,
      wrapperChildren,
      icon,
      description,
      descriptionProps = {},
      errorMessage,
      errorMessageProps = {},
      validationState
    } = props;

    return React.createElement(
      'div',
      null,
      icon,
      React.createElement('input', {
        ...inputProps,
        'data-testid': props['data-testid'],
        'aria-label': props['aria-label'],
        ref: inputRef
      }),
      wrapperChildren,
      description ? React.createElement('div', descriptionProps, description) : null,
      validationState === 'invalid' && errorMessage ? React.createElement('div', errorMessageProps, errorMessage) : null
    );
  }
}));

function renderComponent(props: Record<string, unknown> = {}) {
  return render(
    React.createElement(SearchField, {
      'aria-label': 'the label',
      'data-testid': testId,
      ...props
    })
  );
}

describe('SearchField', () => {
  it('default behavior check', () => {
    renderComponent();
    let input = screen.getByTestId(testId) as HTMLInputElement;

    expect(input.getAttribute('type')).toBe('search');
  });

  it('supports custom icons and no icons', () => {
    let {rerender} = renderComponent({icon: React.createElement(Checkmark, {'data-testid': 'testicon'})});
    expect(screen.getByTestId('testicon')).toBeTruthy();

    rerender(
      React.createElement(SearchField, {
        'aria-label': 'the label',
        'data-testid': testId,
        icon: ''
      })
    );

    expect(screen.queryByTestId('searchicon')).toBe(null);
  });

  it('shows clear button only when text is present', async () => {
    let user = userEvent.setup();
    renderComponent({defaultValue: inputText});

    expect(screen.getByLabelText('Clear search')).toBeTruthy();

    let input = screen.getByTestId(testId);
    fireEvent.change(input, {target: {value: ''}});
    expect(screen.queryByLabelText('Clear search')).toBeTruthy();

    await user.type(input, 'bleh');
    expect(screen.queryByLabelText('Clear search')).toBeTruthy();
  });

  it('submits on enter and respects disabled state', () => {
    let onSubmit = vi.fn();
    let {rerender} = renderComponent({defaultValue: inputText, onSubmit});

    let input = screen.getByTestId(testId);
    fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toBeTruthy();

    rerender(
      React.createElement(SearchField, {
        'aria-label': 'the label',
        'data-testid': testId,
        defaultValue: inputText,
        onSubmit,
        isDisabled: true
      })
    );

    input = screen.getByTestId(testId);
    fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('clears with escape and clear button when uncontrolled', async () => {
    let user = userEvent.setup();
    let onChange = vi.fn();
    let onClear = vi.fn();

    renderComponent({defaultValue: inputText, onChange, onClear});
    let input = screen.getByTestId(testId) as HTMLInputElement;

    fireEvent.keyDown(input, {key: 'Escape', code: 'Escape'});
    expect(onChange).toHaveBeenCalledWith('');
    expect(onClear).toHaveBeenCalledTimes(1);

    await user.type(input, inputText);
    let clearButton = screen.getByLabelText('Clear search');
    await user.click(clearButton);

    expect(onChange).toHaveBeenCalledWith('');
    expect(onClear).toHaveBeenCalledTimes(2);
    expect(document.activeElement).toBe(input);
  });

  it('supports readOnly, description, error message, and tab exclusion', () => {
    let {rerender} = renderComponent({isReadOnly: true, value: 'puppy', excludeFromTabOrder: true});

    let input = screen.getByRole('searchbox');
    expect(input.getAttribute('tabindex')).toBe('-1');
    expect(screen.queryByLabelText('Clear search')).toBe(null);

    rerender(
      React.createElement(SearchField, {
        'aria-label': 'the label',
        'data-testid': testId,
        description: 'Enter a search term.'
      })
    );

    input = screen.getByTestId(testId);
    let description = screen.getByText('Enter a search term.');
    expect(description.hasAttribute('id')).toBe(true);
    expect((input.getAttribute('aria-describedby') || '').includes(description.getAttribute('id') || '')).toBe(true);

    rerender(
      React.createElement(SearchField, {
        'aria-label': 'the label',
        'data-testid': testId,
        errorMessage: 'Remove special characters.',
        validationState: 'invalid'
      })
    );

    input = screen.getByTestId(testId);
    let errorMessage = screen.getByText('Remove special characters.');
    expect(errorMessage.hasAttribute('id')).toBe(true);
    expect((input.getAttribute('aria-describedby') || '').includes(errorMessage.getAttribute('id') || '')).toBe(true);
  });
});
