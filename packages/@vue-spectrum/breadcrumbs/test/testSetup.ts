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

function mergeProps(...args: Array<Record<string, unknown> | null | undefined>) {
  return Object.assign({}, ...args.filter(Boolean));
}

vi.mock('@vue-spectrum/utils', () => ({
  classNames,
  useDOMRef: (ref: unknown) => ref,
  useStyleProps: (props: Record<string, unknown> = {}) => ({
    styleProps: {
      className: typeof props.UNSAFE_className === 'string' ? props.UNSAFE_className : undefined
    }
  })
}));

vi.mock('@vue-aria/focus', () => ({
  FocusRing: ({children}: {children?: React.ReactNode}) => children
}));

vi.mock('@vue-aria/utils', () => ({
  mergeProps,
  useLayoutEffect: () => {},
  useResizeObserver: () => {},
  useValueEffect: <T,>(initialValue: T): [T, (value: T | (() => Generator<T, void, unknown>)) => void] => {
    let [state, setState] = React.useState(initialValue);

    let setValue = (value: T | (() => Generator<T, void, unknown>)) => {
      if (typeof value === 'function') {
        let generator = value();
        let next = generator.next();
        if (!next.done) {
          setState(next.value);
        }
        return;
      }

      setState(value);
    };

    return [state, setValue];
  }
}));

vi.mock('@vue-aria/breadcrumbs', () => ({
  useBreadcrumbs: (props: Record<string, unknown>) => ({
    navProps: {
      id: props.id,
      'aria-label': props['aria-label']
    }
  }),
  useBreadcrumbItem: (props: Record<string, unknown>, _ref: unknown) => {
    idCounter += 1;
    let isCurrent = Boolean(props.isCurrent);
    let isDisabled = Boolean(props.isDisabled);

    return {
      itemProps: {
        id: `breadcrumb-item-${idCounter}`,
        tabIndex: isCurrent || isDisabled ? -1 : 0,
        'aria-current': isCurrent ? 'page' : undefined,
        'aria-disabled': isDisabled ? 'true' : undefined,
        onClick: isDisabled
          ? undefined
          : () => {
            let onPress = props.onPress;
            if (typeof onPress === 'function') {
              onPress();
            }
          }
      }
    };
  }
}));

vi.mock('@vue-aria/interactions', () => ({
  useHover: () => ({
    hoverProps: {},
    isHovered: false
  })
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    direction: 'ltr'
  })
}));

vi.mock('@vue-spectrum/provider', () => ({
  useProviderProps: (props: unknown) => props
}));

vi.mock('@vue-spectrum/button', () => ({
  ActionButton: ({children}: {children?: React.ReactNode}) => React.createElement('button', null, children)
}));

vi.mock('@vue-spectrum/menu', () => ({
  MenuTrigger: ({children}: {children?: React.ReactNode}) => children,
  Menu: ({children}: {children?: React.ReactNode}) => React.createElement('div', {role: 'menu'}, children)
}));

vi.mock('@spectrum-icons/ui/ChevronRightSmall', () => ({
  default: () => React.createElement('span', {'aria-hidden': true})
}));

vi.mock('@spectrum-icons/ui/FolderBreadcrumb', () => ({
  default: () => React.createElement('span', {'aria-hidden': true})
}));
