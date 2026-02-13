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

let idCounter = 0;

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

vi.mock('@vue-spectrum/utils', async () => {
  let actual = await vi.importActual<typeof import('@vue-spectrum/utils')>('@vue-spectrum/utils');
  return {
    ...actual,
    classNames,
    ClearSlots: ({children}: {children?: React.ReactNode}) => children,
    SlotProvider: ({children}: {children?: React.ReactNode}) => children,
    useFocusableRef: () => React.useRef<HTMLElement | null>(null),
    useHasChild: () => false,
    useSlotProps: <T,>(props: T) => ({...(props as Record<string, unknown>)}) as T,
    useStyleProps: (props: Record<string, unknown> = {}) => ({
      styleProps: {
        className: typeof props.UNSAFE_className === 'string' ? props.UNSAFE_className : undefined,
        style: props.UNSAFE_style,
        'data-foo': props['data-foo']
      }
    })
  };
});

vi.mock('@vue-spectrum/provider', () => ({
  useProviderProps: <T,>(props: T) => ({...(props as Record<string, unknown>)}) as T
}));

vi.mock('@vue-spectrum/text', () => ({
  Text: ({children}: {children?: React.ReactNode}) => React.createElement('span', null, children)
}));

vi.mock('@vue-spectrum/progress', () => ({
  ProgressCircle: (props: Record<string, unknown>) => React.createElement('div', {
    role: 'progressbar',
    'aria-label': props['aria-label']
  })
}));

vi.mock('@vue-aria/focus', () => ({
  FocusRing: ({children}: {children?: React.ReactNode}) => children
}));

vi.mock('@vue-aria/interactions', () => ({
  useHover: () => ({
    hoverProps: {},
    isHovered: false
  }),
  useFocus: () => ({
    focusProps: {}
  })
}));

vi.mock('@vue-aria/utils', () => ({
  mergeProps,
  isAppleDevice: () => false,
  isFirefox: () => false,
  useId: () => `mock-id-${++idCounter}`
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocalizedStringFormatter: () => ({
    format: (key: string) => key
  })
}));

vi.mock('@vue-stately/toggle', () => ({
  useToggleState: (props: Record<string, unknown>) => {
    let isControlled = props.isSelected !== undefined;
    let [internalSelected, setInternalSelected] = React.useState(Boolean(props.defaultSelected));
    let isSelected = isControlled ? Boolean(props.isSelected) : internalSelected;

    let setSelected = (next: boolean) => {
      if (!isControlled) {
        setInternalSelected(next);
      }
      props.onChange?.(next);
    };

    return {
      isSelected,
      toggle() {
        setSelected(!isSelected);
      }
    };
  }
}));

vi.mock('@vue-aria/button', () => ({
  useButton: (props: Record<string, unknown>) => {
    let elementType = (props.elementType as string | undefined) ?? 'button';
    let buttonProps: Record<string, unknown> = {
      role: elementType === 'button' ? undefined : 'button',
      type: elementType === 'button' ? 'button' : undefined,
      tabIndex: elementType === 'button' ? undefined : 0,
      href: props.href,
      'aria-label': props['aria-label'],
      'aria-labelledby': props['aria-labelledby'],
      'aria-describedby': props['aria-describedby'],
      onClick: () => {
        props.onPress?.();
      }
    };

    return {
      buttonProps,
      isPressed: false
    };
  },
  useToggleButton: (
    props: Record<string, unknown>,
    state: {isSelected: boolean; toggle: () => void}
  ) => ({
    buttonProps: {
      type: 'button',
      'aria-label': props['aria-label'],
      'aria-pressed': state.isSelected ? 'true' : 'false',
      onClick: () => {
        props.onPress?.();
        state.toggle();
      }
    },
    isPressed: false
  })
}));
