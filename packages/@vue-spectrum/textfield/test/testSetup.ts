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

export let textFieldBaseSpy = vi.fn();

vi.mock('../src/TextFieldBase', () => ({
  TextFieldBase: React.forwardRef(function MockTextFieldBase(
    props: Record<string, unknown>,
    ref: React.ForwardedRef<unknown>
  ) {
    textFieldBaseSpy(props);

    let ElementType = props.multiLine ? 'textarea' : 'input';
    let inputRef = props.inputRef as React.Ref<HTMLInputElement | HTMLTextAreaElement> | undefined;
    let inputProps = (props.inputProps as Record<string, unknown>) ?? {};
    let testId = props['data-testid'] as string | undefined;

    return React.createElement(
      'div',
      {ref},
      React.createElement(ElementType, {
        ...inputProps,
        'data-testid': testId,
        ref: inputRef
      })
    );
  })
}));

vi.mock('@vue-spectrum/provider', () => ({
  useProviderProps: (props: unknown) => props
}));

vi.mock('@vue-spectrum/form', () => ({
  useFormProps: (props: unknown) => props
}));

vi.mock('@vue-aria/textfield', () => ({
  useTextField: (props: Record<string, unknown>) => ({
    inputProps: {
      type: props.inputElementType === 'textarea' ? undefined : 'text',
      'aria-label': props['aria-label'],
      name: props.name,
      value: props.value,
      defaultValue: props.defaultValue,
      disabled: props.isDisabled ? true : undefined,
      readOnly: props.isReadOnly ? true : undefined,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        let onChange = props.onChange;
        if (typeof onChange === 'function') {
          onChange(event.target.value);
        }
      }
    },
    labelProps: {},
    descriptionProps: {},
    errorMessageProps: {}
  })
}));

vi.mock('@vue-stately/utils', () => ({
  useControlledState: (value: unknown, defaultValue: unknown) => {
    let [internalValue, setInternalValue] = React.useState(value ?? defaultValue);
    let isControlled = value !== undefined;
    let currentValue = isControlled ? value : internalValue;

    return [currentValue, setInternalValue] as const;
  }
}));

vi.mock('@vue-aria/utils', () => ({
  chain: (...functions: Array<((...args: unknown[]) => void) | undefined>) => (...args: unknown[]) => {
    for (let fn of functions) {
      fn?.(...args);
    }
  },
  useLayoutEffect: React.useLayoutEffect
}));
