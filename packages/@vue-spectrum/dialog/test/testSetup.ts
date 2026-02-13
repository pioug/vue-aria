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
    SlotProvider: ({children}: {children?: React.ReactNode}) => children,
    unwrapDOMRef: <T,>(ref: T) => ref,
    useDOMRef: <T,>(ref: T) => ref,
    useHasChild: () => false,
    useIsMobileDevice: () => false,
    useSlotProps: <T,>(props: T) => ({...(props as Record<string, unknown>)}) as T,
    useStyleProps: (props: Record<string, unknown> = {}) => ({
      styleProps: {
        className: typeof props.UNSAFE_className === 'string' ? props.UNSAFE_className : undefined,
        style: props.UNSAFE_style,
        hidden: props.hidden,
        'data-testid': props['data-testid']
      }
    })
  };
});

vi.mock('@vue-aria/utils', async () => {
  let actual = await vi.importActual<typeof import('@vue-aria/utils')>('@vue-aria/utils');
  return {
    ...actual,
    mergeProps,
    chain: (..._args: unknown[]) => undefined
  };
});

vi.mock('@vue-spectrum/button', () => ({
  ActionButton: ({
    children,
    onPress,
    UNSAFE_className: _unsafeClassName,
    isQuiet: _isQuiet,
    ...props
  }: {children?: React.ReactNode; onPress?: () => void} & Record<string, unknown>) =>
    React.createElement('button', {
      ...props,
      type: 'button',
      onClick: () => onPress?.()
    }, children),
  Button: ({
    children,
    onPress,
    isDisabled,
    autoFocus,
    ...props
  }: {children?: React.ReactNode; onPress?: () => void; isDisabled?: boolean; autoFocus?: boolean} & Record<string, unknown>) => {
    let ref = React.useRef<HTMLButtonElement>(null);
    React.useEffect(() => {
      if (autoFocus) {
        ref.current?.focus();
      }
    }, [autoFocus]);

    return React.createElement('button', {
      ...props,
      ref,
      type: 'button',
      disabled: Boolean(isDisabled),
      onClick: () => {
        if (!isDisabled) {
          onPress?.();
        }
      }
    }, children);
  }
}));

vi.mock('@vue-spectrum/buttongroup', () => ({
  ButtonGroup: ({children}: {children?: React.ReactNode}) => React.createElement('div', {role: 'group'}, children)
}));

vi.mock('@vue-spectrum/layout', () => ({
  Grid: React.forwardRef(function MockGrid(
    props: {children?: React.ReactNode} & Record<string, unknown>,
    ref: React.ForwardedRef<HTMLDivElement>
  ) {
    let {children, UNSAFE_className, ...domProps} = props;
    return React.createElement('div', {...domProps, className: UNSAFE_className, ref}, children);
  })
}));

vi.mock('@vue-spectrum/view', () => ({
  Content: ({children}: {children?: React.ReactNode}) => React.createElement('div', null, children),
  Header: ({children}: {children?: React.ReactNode}) => React.createElement('header', null, children)
}));

vi.mock('@vue-spectrum/text', () => ({
  Heading: ({children, ...props}: {children?: React.ReactNode} & Record<string, unknown>) =>
    React.createElement('h2', props, children),
  Text: ({children}: {children?: React.ReactNode}) => React.createElement('span', null, children)
}));

vi.mock('@vue-spectrum/divider', () => ({
  Divider: () => React.createElement('hr')
}));

vi.mock('@vue-aria/dialog', () => ({
  useDialog: (props: Record<string, unknown>) => ({
    dialogProps: {
      role: props.role ?? 'dialog',
      tabIndex: -1,
      'aria-label': props['aria-label'],
      'aria-labelledby': props['aria-labelledby'],
      'data-testid': props['data-testid']
    },
    titleProps: {
      id: 'dialog-title'
    }
  })
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocalizedStringFormatter: () => ({
    format: (key: string) => {
      if (key === 'dismiss') {
        return 'Dismiss';
      }

      if (key === 'alert') {
        return 'alert';
      }

      return key;
    }
  })
}));

vi.mock('@vue-stately/overlays', () => ({
  useOverlayTriggerState: (props: Record<string, unknown> = {}) => {
    let isControlled = props.isOpen !== undefined;
    let [internalOpen, setInternalOpen] = React.useState(Boolean(props.defaultOpen));
    let isOpen = isControlled ? Boolean(props.isOpen) : internalOpen;

    let notify = (value: boolean) => {
      let onOpenChange = props.onOpenChange;
      if (typeof onOpenChange === 'function') {
        onOpenChange(value);
      }
    };

    return {
      isOpen,
      toggle() {
        if (isOpen) {
          if (!isControlled) {
            setInternalOpen(false);
          }
          notify(false);
        } else {
          if (!isControlled) {
            setInternalOpen(true);
          }
          notify(true);
        }
      },
      close() {
        if (!isControlled) {
          setInternalOpen(false);
        }
        notify(false);
      }
    };
  }
}));

vi.mock('@vue-aria/interactions', () => ({
  PressResponder: ({
    children,
    onPress
  }: {children?: React.ReactNode; onPress?: () => void}) => {
    if (!React.isValidElement(children)) {
      return children;
    }

    let child = children as React.ReactElement<Record<string, unknown>>;
    return React.cloneElement(child, {
      ...child.props,
      onClick: (...args: unknown[]) => {
        onPress?.();
        (child.props.onClick as ((...args: unknown[]) => void) | undefined)?.(...args);
      }
    });
  }
}));

vi.mock('@vue-aria/overlays', () => ({
  useOverlayTrigger: () => ({
    triggerProps: {},
    overlayProps: {}
  })
}));

vi.mock('@vue-spectrum/overlays', () => ({
  Modal: ({
    state,
    children
  }: {state: {isOpen: boolean}; children?: React.ReactNode}) =>
    state.isOpen ? React.createElement('div', {'data-testid': 'modal'}, children) : null,
  Popover: ({
    state,
    children
  }: {state: {isOpen: boolean}; children?: React.ReactNode}) =>
    state.isOpen ? React.createElement('div', {'data-testid': 'popover'}, children) : null,
  Tray: ({
    state,
    children
  }: {state: {isOpen: boolean}; children?: React.ReactNode}) =>
    state.isOpen ? React.createElement('div', {'data-testid': 'tray'}, children) : null
}));
