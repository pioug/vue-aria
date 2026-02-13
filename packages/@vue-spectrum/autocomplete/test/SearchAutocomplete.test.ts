/*
 * Copyright 2021 Adobe. All rights reserved.
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
import {render, screen} from '@testing-library/react';

vi.mock('@vue-spectrum/provider', () => ({
  useProviderProps: <T,>(props: T) => props,
  useProvider: () => ({
    scale: 'medium'
  })
}));

vi.mock('@vue-spectrum/form', () => ({
  useFormProps: <T,>(props: T) => props
}));

vi.mock('@vue-spectrum/utils', async () => {
  let actual = await vi.importActual<typeof import('@vue-spectrum/utils')>('@vue-spectrum/utils');
  return {
    ...actual,
    classNames: (...values: Array<unknown>) => values
      .flatMap((value) => {
        if (typeof value === 'string') {
          return [value];
        }

        if (value && typeof value === 'object') {
          return Object.entries(value)
            .filter(([, enabled]) => Boolean(enabled))
            .map(([key]) => key);
        }

        return [];
      })
      .join(' '),
    dimensionValue: (value: unknown) => String(value),
    useFocusableRef: (_ref: unknown, fallbackRef: unknown) => fallbackRef,
    useIsMobileDevice: () => false,
    useResizeObserver: () => undefined,
    useUnwrapDOMRef: (ref: unknown) => ref
  };
});

vi.mock('@vue-aria/i18n', async () => {
  let actual = await vi.importActual<typeof import('@vue-aria/i18n')>('@vue-aria/i18n');
  return {
    ...actual,
    useFilter: () => ({
      contains: (text: string, input: string) => text.toLowerCase().includes(input.toLowerCase())
    }),
    useLocalizedStringFormatter: () => ({
      format: (key: string) => key
    })
  };
});

vi.mock('@vue-aria/utils', async () => {
  let actual = await vi.importActual<typeof import('@vue-aria/utils')>('@vue-aria/utils');
  return {
    ...actual,
    useLayoutEffect: React.useEffect
  };
});

vi.mock('@vue-stately/combobox', () => ({
  useComboBoxState: () => ({
    isOpen: false,
    focusStrategy: null,
    collection: [],
    selectionManager: {}
  })
}));

vi.mock('@vue-aria/autocomplete', () => ({
  useSearchAutocomplete: (props: Record<string, unknown>) => ({
    inputProps: {
      role: 'combobox',
      'aria-label': String(props['aria-label'] ?? props.label ?? 'Search'),
      value: '',
      onChange: () => undefined
    },
    listBoxProps: {
      'aria-label': 'Suggestions'
    },
    labelProps: {},
    clearButtonProps: {
      'aria-label': 'Clear'
    },
    descriptionProps: {},
    errorMessageProps: {},
    isInvalid: false,
    validationErrors: [],
    validationDetails: {}
  })
}));

vi.mock('@vue-spectrum/label', () => ({
  Field: ({children}: {children?: React.ReactNode}) => children
}));

vi.mock('@vue-spectrum/button', () => ({
  ClearButton: ({children, onPress, ...props}: {children?: React.ReactNode, onPress?: () => void} & Record<string, unknown>) => (
    React.createElement(
      'button',
      {
        ...props,
        onClick: onPress
      },
      children
    )
  )
}));

vi.mock('@vue-aria/focus', () => ({
  FocusRing: ({children}: {children?: React.ReactNode}) => children
}));

vi.mock('@vue-aria/interactions', () => ({
  useHover: () => ({
    hoverProps: {},
    isHovered: false
  })
}));

vi.mock('@vue-spectrum/overlays', () => ({
  Popover: ({children}: {children?: React.ReactNode}) => React.createElement('div', null, children)
}));

vi.mock('@vue-spectrum/listbox', () => ({
  useListBoxLayout: () => ({}),
  ListBoxBase: () => React.createElement('ul', {role: 'listbox'})
}));

vi.mock('@vue-spectrum/textfield', () => ({
  TextFieldBase: ({inputProps, inputRef}: {inputProps: Record<string, unknown>, inputRef?: React.Ref<HTMLInputElement>}) => (
    React.createElement('input', {...inputProps, ref: inputRef})
  )
}));

vi.mock('@vue-spectrum/progress', () => ({
  ProgressCircle: () => React.createElement('div')
}));

import {SearchAutocomplete} from '../src';

describe('SearchAutocomplete', () => {
  it('renders combobox input and listbox', () => {
    render(
      React.createElement(
        SearchAutocomplete,
        {
          label: 'Search',
          'aria-label': 'Search'
        },
        React.createElement('div', {key: 'one'}, 'One')
      )
    );

    expect(screen.getByRole('combobox')).toBeTruthy();
    expect(screen.getByRole('listbox')).toBeTruthy();
  });
});
