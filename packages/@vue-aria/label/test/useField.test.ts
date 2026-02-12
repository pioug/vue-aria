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
import {render, renderHook} from '@testing-library/react';
import {useField} from '../src/useField';

function WithError() {
  let {labelProps, fieldProps, descriptionProps, errorMessageProps} = useField({
    label: 'Test label',
    description: 'I describe the field.',
    errorMessage: 'I\'m a helpful error for the field.',
    isInvalid: true
  });

  return React.createElement(
    React.Fragment,
    null,
    React.createElement('label', labelProps as any, 'Test label'),
    React.createElement('input', {'data-testid': 'input', ...fieldProps}),
    React.createElement('div', {'data-testid': 'description', ...descriptionProps}, 'I describe the field.'),
    React.createElement('div', {'data-testid': 'error', ...errorMessageProps}, 'I\'m a helpful error for the field.')
  );
}

describe('useField', function () {
  let renderFieldHook = (fieldProps: any) => {
    let {result} = renderHook(() => useField(fieldProps));
    return result.current;
  };

  it('should return label props', function () {
    let {labelProps, fieldProps} = renderFieldHook({label: 'Test'});
    expect(labelProps.id).toBeDefined();
    expect(fieldProps.id).toBeDefined();
  });

  it('should return props for description and error message if they are passed in', function () {
    let {descriptionProps, errorMessageProps} = renderFieldHook({label: 'Test', description: 'Description', errorMessage: 'Error'});
    expect(descriptionProps.id).toBeDefined();
    expect(errorMessageProps.id).toBeDefined();
  });

  it('can render and label both the description and error message at the same time', function () {
    let {getByLabelText, getByTestId} = render(React.createElement(WithError));
    let description = getByTestId('description');
    let error = getByTestId('error');
    let input = getByLabelText('Test label');
    let ariaDescribedBy = input.getAttribute('aria-describedby') ?? '';

    expect(ariaDescribedBy.includes(description.id)).toBe(true);
    expect(ariaDescribedBy.includes(error.id)).toBe(true);
  });
});
