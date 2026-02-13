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

import React, {createContext} from 'react';

const mockColor = {
  toString: () => 'rgb(255, 0, 0)',
  getChannelValue: () => 1,
  getChannelName: (channel: string) => channel,
  formatChannelValue: () => '100%'
};

function classNames(...values: Array<unknown>) {
  let classes: string[] = [];

  for (let value of values) {
    if (!value) {
      continue;
    }

    if (typeof value === 'string') {
      classes.push(value);
      continue;
    }

    if (typeof value === 'object') {
      for (let [key, enabled] of Object.entries(value)) {
        if (enabled) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(' ');
}

function mergeProps(...propsList: Array<Record<string, unknown> | undefined>) {
  let merged: Record<string, unknown> = {};

  for (let props of propsList) {
    if (!props) {
      continue;
    }

    for (let [key, value] of Object.entries(props)) {
      let previousValue = merged[key];
      if (typeof previousValue === 'function' && typeof value === 'function' && key.startsWith('on')) {
        merged[key] = (...args: unknown[]) => {
          previousValue(...args);
          value(...args);
        };
      } else {
        merged[key] = value;
      }
    }
  }

  return merged;
}

vi.mock('@vue-spectrum/provider', () => ({
  useProviderProps: <T,>(props: T) => props,
  useProvider: () => ({scale: 'medium'})
}));

vi.mock('@vue-spectrum/form', () => ({
  useFormProps: <T,>(props: T) => props
}));

vi.mock('@vue-spectrum/utils', async () => {
  let actual = await vi.importActual<typeof import('@vue-spectrum/utils')>('@vue-spectrum/utils');

  return {
    ...actual,
    classNames,
    dimensionValue: (value: unknown) => typeof value === 'number' ? `${value}px` : value,
    useStyleProps: (props: Record<string, unknown> = {}) => ({
      styleProps: {
        className: typeof props.UNSAFE_className === 'string' ? props.UNSAFE_className : '',
        style: props.UNSAFE_style
      }
    }),
    useFocusableRef: <T,>(ref: T, fallbackRef?: {current: unknown} | null) => {
      if (ref && typeof ref === 'object' && 'current' in (ref as Record<string, unknown>)) {
        return ref;
      }

      if (fallbackRef && typeof fallbackRef === 'object' && 'current' in fallbackRef) {
        return fallbackRef;
      }

      return React.useRef(null);
    },
    useDOMRef: <T,>(ref: T) => {
      if (ref && typeof ref === 'object' && 'current' in (ref as Record<string, unknown>)) {
        return ref;
      }

      return React.useRef(null);
    },
    unwrapDOMRef: <T,>(ref: T) => {
      if (ref && typeof ref === 'object' && 'current' in (ref as Record<string, unknown>)) {
        return (ref as {current: unknown}).current;
      }

      return ref;
    },
    SlotProvider: ({children}: {children?: React.ReactNode}) => children
  };
});

vi.mock('@vue-spectrum/style-macro-s1', () => ({
  style: () => () => 'mock-style'
}));

vi.mock('@vue-aria/utils', () => ({
  mergeProps,
  useId: () => 'mock-id',
  useLayoutEffect: React.useEffect,
  useResizeObserver: () => undefined
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  })
}));

vi.mock('@vue-aria/focus', () => ({
  useFocusRing: () => ({
    focusProps: {},
    isFocusVisible: false
  })
}));

vi.mock('@vue-aria/interactions', () => ({
  useFocusVisible: () => ({
    isFocusVisible: false
  }),
  useFocus: () => ({
    focusProps: {}
  })
}));

vi.mock('@vue-spectrum/textfield', () => ({
  TextFieldBase: ({
    inputProps = {},
    inputRef,
    inputClassName
  }: {
    inputProps?: Record<string, unknown>,
    inputRef?: React.Ref<HTMLInputElement>,
    inputClassName?: string
  }) => React.createElement('input', {
    ...inputProps,
    ref: inputRef,
    className: inputClassName
  })
}));

vi.mock('@vue-spectrum/label', () => ({
  Label: ({
    children,
    elementType,
    UNSAFE_className,
    ...props
  }: {children?: React.ReactNode; elementType?: React.ElementType; UNSAFE_className?: string} & Record<string, unknown>) => {
    let Element = elementType ?? 'label';
    return React.createElement(Element, {...props, className: UNSAFE_className}, children);
  }
}));

vi.mock('@vue-spectrum/overlays', () => ({
  Overlay: ({
    children,
    isOpen
  }: {
    children?: React.ReactNode,
    isOpen?: boolean
  }) => isOpen ? children : null
}));

vi.mock('@vue-spectrum/dialog', () => ({
  DialogTrigger: ({children}: {children?: React.ReactNode}) => React.createElement('div', null, children),
  Dialog: ({
    children,
    UNSAFE_style,
    ...props
  }: {children?: React.ReactNode; UNSAFE_style?: React.CSSProperties} & Record<string, unknown>) =>
    React.createElement('div', {...props, role: 'dialog', style: UNSAFE_style}, children)
}));

vi.mock('@vue-spectrum/view', () => ({
  Content: ({children}: {children?: React.ReactNode}) => React.createElement('div', null, children)
}));

vi.mock('@vue-stately/color', () => ({
  useColorAreaState: () => ({
    getDisplayColor: () => mockColor,
    isDragging: false
  }),
  useColorSliderState: () => ({
    value: mockColor,
    getDisplayColor: () => mockColor,
    isThumbDragging: () => false
  }),
  useColorWheelState: () => ({
    getDisplayColor: () => mockColor,
    isDragging: false
  }),
  useColorFieldState: () => ({
    color: mockColor
  }),
  useColorChannelFieldState: () => ({
    numberValue: 255
  }),
  parseColor: (value: string) => ({
    ...mockColor,
    toString: () => value
  }),
  getColorChannels: () => ['red', 'green', 'blue']
}));

vi.mock('@vue-aria/color', () => ({
  useColorArea: () => ({
    colorAreaProps: {
      role: 'group',
      'aria-label': 'Color area',
      style: {}
    },
    xInputProps: {
      'aria-label': 'x-axis'
    },
    yInputProps: {
      'aria-label': 'y-axis'
    },
    thumbProps: {
      style: {
        left: '50%',
        top: '50%'
      }
    }
  }),
  useColorSlider: (props: Record<string, unknown>, state: {value: {formatChannelValue: (channel: string, locale: string) => string}}) => ({
    inputProps: {
      role: 'slider',
      type: 'range',
      'aria-label': props['aria-label'] ?? props.label ?? 'Color slider'
    },
    thumbProps: {
      style: {
        left: '50%'
      }
    },
    trackProps: {
      'data-testid': 'color-slider-track'
    },
    labelProps: {},
    outputProps: {},
    state
  }),
  useColorWheel: () => ({
    trackProps: {
      'data-testid': 'color-wheel-track'
    },
    inputProps: {
      role: 'slider',
      type: 'range',
      'aria-label': 'Hue'
    },
    thumbProps: {
      style: {
        left: '50%',
        top: '50%'
      }
    }
  }),
  useColorField: (props: Record<string, unknown>) => ({
    inputProps: {
      type: 'text',
      value: '#ff0000',
      'aria-label': props['aria-label'] ?? 'Color field',
      onChange: () => undefined
    }
  }),
  useColorChannelField: (props: Record<string, unknown>) => ({
    inputProps: {
      type: 'text',
      value: '255',
      'aria-label': props['aria-label'] ?? `${props.channel ?? 'channel'} field`,
      onChange: () => undefined
    }
  }),
  useColorSwatch: (props: Record<string, unknown>) => ({
    colorSwatchProps: {
      role: 'img',
      'aria-label': props['aria-label'] ?? 'color swatch'
    },
    color: props.color ?? mockColor
  })
}));

vi.mock('react-aria-components', () => {
  const ColorAreaContext = createContext(null);
  const ColorSliderContext = createContext(null);
  const ColorWheelContext = createContext(null);
  const ColorFieldContext = createContext(null);
  const ColorSwatchContext = createContext(null);

  return {
    ColorAreaContext,
    ColorSliderContext,
    ColorWheelContext,
    ColorFieldContext,
    ColorSwatchContext,
    useContextProps: <T,>(props: T, ref: unknown) => [props, ref],
    ColorPicker: ({children}: {children?: React.ReactNode}) =>
      React.createElement('div', {'data-testid': 'aria-color-picker'}, children),
    Button: ({
      children,
      ...props
    }: {
      children?: React.ReactNode | ((state: {isFocusVisible: boolean}) => React.ReactNode)
    } & Record<string, unknown>) => React.createElement(
      'button',
      {
        ...props,
        type: 'button'
      },
      typeof children === 'function' ? children({isFocusVisible: false}) : children
    ),
    ColorSwatchPicker: ({
      children,
      ...props
    }: {
      children?: React.ReactNode
    } & Record<string, unknown>) => React.createElement('div', {...props, role: 'listbox'}, children),
    ColorSwatchPickerItem: ({
      children,
      className,
      ...props
    }: {
      children?: React.ReactNode | ((state: {isSelected: boolean}) => React.ReactNode),
      className?: string | ((state: {isSelected: boolean}) => string)
    } & Record<string, unknown>) => React.createElement(
      'div',
      {
        ...props,
        className: typeof className === 'function' ? className({isSelected: false}) : className,
        role: 'option'
      },
      typeof children === 'function' ? children({isSelected: false}) : children
    )
  };
});
