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

import {AriaNumberFieldProps} from '@vue-types/numberfield';
import React from 'react';
import {renderHook} from '@testing-library/react';
import {useNumberField} from '../src/useNumberField';
import {useNumberFieldState} from '@vue-stately/numberfield';

vi.mock('@vue-aria/i18n', () => ({
  useLocalizedStringFormatter: () => ({
    format: (key: string) => key
  }),
  useNumberFormatter: (options?: Intl.NumberFormatOptions) => new Intl.NumberFormat('en-US', options)
}));

vi.mock('@vue-stately/numberfield', () => ({
  useNumberFieldState: (props: any) => ({
    increment: vi.fn(),
    incrementToMax: vi.fn(),
    decrement: vi.fn(),
    decrementToMin: vi.fn(),
    numberValue: NaN,
    inputValue: '',
    commit: vi.fn(),
    commitValidation: vi.fn(),
    validate: () => true,
    setInputValue: vi.fn(),
    defaultNumberValue: NaN,
    setNumberValue: vi.fn(),
    minValue: props.minValue,
    displayValidation: {
      isInvalid: props.validationState === 'invalid',
      validationErrors: [],
      validationDetails: {}
    }
  })
}));

describe('useNumberField hook', () => {
  let ref: React.RefObject<HTMLInputElement | null>;

  beforeEach(() => {
    ref = React.createRef();
    ref.current = document.createElement('input');
  });

  let renderNumberFieldHook = (props: AriaNumberFieldProps) => {
    let {result: stateResult} = renderHook(() => useNumberFieldState({...props, locale: 'en-US'}));
    let {result} = renderHook(() => useNumberField(props, stateResult.current, ref));
    return result.current;
  };

  describe('should return numberFieldProps', () => {
    it('with default numberField props if no props are provided', () => {
      let consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      let {inputProps} = renderNumberFieldHook({});

      expect(inputProps.type).toBe('text');
      expect(inputProps.disabled).toBeFalsy();
      expect(inputProps.readOnly).toBeFalsy();
      expect(inputProps['aria-invalid']).toBeUndefined();
      expect(inputProps['aria-required']).toBeUndefined();
      expect(inputProps['aria-valuenow']).toBeNull();
      expect(inputProps['aria-valuetext']).toBeNull();
      expect(inputProps['aria-valuemin']).toBeNull();
      expect(inputProps['aria-valuemax']).toBeNull();
      expect(typeof inputProps.onChange).toBe('function');
      expect(inputProps.autoFocus).toBeFalsy();
      expect(consoleWarnSpy).toHaveBeenLastCalledWith(
        'If you do not provide a visible label, you must specify an aria-label or aria-labelledby attribute for accessibility'
      );
      consoleWarnSpy.mockRestore();
    });

    it('with appropriate props if placeholder is defined', () => {
      let {inputProps} = renderNumberFieldHook({placeholder: 'Enter value', 'aria-label': 'mandatory label'});
      expect(inputProps.placeholder).toBe('Enter value');
    });

    it('all events are merged into the input element', () => {
      let onCopy = vi.fn();
      let onCut = vi.fn();
      let onPaste = vi.fn();
      let onCompositionStart = vi.fn();
      let onCompositionEnd = vi.fn();
      let onCompositionUpdate = vi.fn();
      let onSelect = vi.fn();
      let onBeforeInput = vi.fn();
      let onInput = vi.fn();

      let {inputProps} = renderNumberFieldHook({
        'aria-label': 'mandatory label',
        onCopy,
        onCut,
        onPaste,
        onCompositionStart,
        onCompositionEnd,
        onCompositionUpdate,
        onSelect,
        onBeforeInput,
        onInput
      });

      inputProps.onCopy?.({} as any);
      expect(onCopy).toHaveBeenCalled();
      inputProps.onCut?.({} as any);
      expect(onCut).toHaveBeenCalled();
      inputProps.onPaste?.({} as any);
      expect(onPaste).toHaveBeenCalled();
      inputProps.onCompositionStart?.({} as any);
      expect(onCompositionStart).toHaveBeenCalled();
      inputProps.onCompositionEnd?.({} as any);
      expect(onCompositionEnd).toHaveBeenCalled();
      inputProps.onCompositionUpdate?.({} as any);
      expect(onCompositionUpdate).toHaveBeenCalled();
      inputProps.onSelect?.({} as any);
      expect(onSelect).toHaveBeenCalled();
      inputProps.onBeforeInput?.({
        preventDefault: vi.fn(),
        target: {
          value: '',
          selectionStart: 0,
          selectionEnd: 0,
          data: ''
        }
      } as any);
      expect(onBeforeInput).toHaveBeenCalled();
      inputProps.onInput?.({} as any);
      expect(onInput).toHaveBeenCalled();
    });
  });
});
