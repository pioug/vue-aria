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

import {renderHook} from '@testing-library/react';
import {useTextField} from '../src/useTextField';

vi.mock('@vue-aria/utils', async () => {
  const actual = await vi.importActual<typeof import('@vue-aria/utils')>('@vue-aria/utils');
  return {
    ...actual,
    useFormReset: () => {}
  };
});

vi.mock('@vue-aria/interactions', () => ({
  useFocusable: () => ({focusableProps: {}})
}));

vi.mock('@vue-aria/label', () => ({
  useField: () => ({
    labelProps: {},
    fieldProps: {},
    descriptionProps: {},
    errorMessageProps: {}
  })
}));

vi.mock('@vue-aria/form', () => ({
  useFormValidation: () => {}
}));

vi.mock('@vue-stately/form', () => ({
  useFormValidationState: (props: any) => ({
    displayValidation: {
      isInvalid: props.validationState === 'invalid',
      validationErrors: [],
      validationDetails: {}
    }
  })
}));

describe('useTextField', function () {
  let renderTextFieldHook = (props: any) => {
    let ref = {current: null};
    let {result} = renderHook(() => useTextField(props, ref as any));
    return result.current.inputProps;
  };

  it('returns default text input props', function () {
    let props = renderTextFieldHook({'aria-label': 'mandatory label'});

    expect(props.type).toBe('text');
    expect(props.disabled).toBeFalsy();
    expect(props.readOnly).toBeFalsy();
    expect(props['aria-invalid']).toBeUndefined();
    expect(props['aria-required']).toBeUndefined();
    expect(typeof props.onChange).toBe('function');
  });

  it('uses provided type', function () {
    let props = renderTextFieldHook({type: 'search', 'aria-label': 'mandatory label'});

    expect(props.type).toBe('search');
  });

  it('handles isDisabled', function () {
    let props = renderTextFieldHook({isDisabled: true, 'aria-label': 'mandatory label'});
    expect(props.disabled).toBeTruthy();

    props = renderTextFieldHook({isDisabled: false, 'aria-label': 'mandatory label'});
    expect(props.disabled).toBeFalsy();
  });

  it('handles isRequired', function () {
    let props = renderTextFieldHook({isRequired: true, 'aria-label': 'mandatory label'});
    expect(props['aria-required']).toBeTruthy();

    props = renderTextFieldHook({isRequired: false, 'aria-label': 'mandatory label'});
    expect(props['aria-required']).toBeUndefined();
  });

  it('handles isReadOnly', function () {
    let props = renderTextFieldHook({isReadOnly: true, 'aria-label': 'mandatory label'});
    expect(props.readOnly).toBeTruthy();

    props = renderTextFieldHook({isReadOnly: false, 'aria-label': 'mandatory label'});
    expect(props.readOnly).toBeFalsy();
  });

  it('handles validationState', function () {
    let props = renderTextFieldHook({validationState: 'invalid', 'aria-label': 'mandatory label'});
    expect(props['aria-invalid']).toBeTruthy();

    props = renderTextFieldHook({validationState: 'valid', 'aria-label': 'mandatory label'});
    expect(props['aria-invalid']).toBeUndefined();
  });

  it('calls onChange with event target value', function () {
    let onChange = vi.fn();
    let props = renderTextFieldHook({onChange, 'aria-label': 'mandatory label'});

    props.onChange?.({target: {value: 'new-value'}});

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('new-value');
  });

  it('omits type and pattern for textarea', function () {
    let props = renderTextFieldHook({
      type: 'search',
      pattern: /pattern/,
      inputElementType: 'textarea',
      'aria-label': 'mandatory label'
    });

    expect(props.type).toBeUndefined();
    expect(props.pattern).toBeUndefined();
  });
});
