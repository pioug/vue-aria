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
import {createPortal} from 'react-dom';

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
    useDOMRef: <T,>(ref: T) => ref,
    useStyleProps: (props: Record<string, unknown> = {}) => ({
      styleProps: {
        className: typeof props.UNSAFE_className === 'string' ? props.UNSAFE_className : undefined,
        style: props.UNSAFE_style
      }
    })
  };
});

vi.mock('@vue-spectrum/provider', () => ({
  Provider: React.forwardRef(function MockProvider(
    props: {children?: React.ReactNode; UNSAFE_style?: React.CSSProperties} & Record<string, unknown>,
    ref: React.ForwardedRef<HTMLDivElement>
  ) {
    let {
      children,
      UNSAFE_style,
      isDisabled: _isDisabled,
      ...domProps
    } = props;

    return React.createElement(
      'div',
      {
        ...domProps,
        ref,
        style: UNSAFE_style
      },
      children
    );
  })
}));

vi.mock('@vue-aria/utils', async () => {
  let actual = await vi.importActual<typeof import('@vue-aria/utils')>('@vue-aria/utils');
  return {
    ...actual,
    mergeProps,
    useObjectRef: <T,>(ref: T) => {
      if (ref && typeof ref === 'object' && 'current' in (ref as Record<string, unknown>)) {
        return ref;
      }

      return React.useRef(null);
    },
    useViewportSize: () => ({
      width: 1024,
      height: 768
    }),
    useLayoutEffect: React.useEffect,
    isScrollable: () => false
  };
});

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
      open() {
        if (!isControlled) {
          setInternalOpen(true);
        }
        notify(true);
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

vi.mock('@vue-aria/overlays', () => ({
  Overlay: ({
    children,
    portalContainer
  }: {
    children?: React.ReactNode;
    portalContainer?: Element | null;
  }) => createPortal(children, portalContainer ?? document.body),
  useModalOverlay: (
    props: Record<string, unknown>,
    state: {close: () => void}
  ) => ({
    modalProps: {
      role: 'dialog',
      tabIndex: -1,
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          state.close();
        }
      },
      onBlur: props.shouldCloseOnBlur ? () => state.close() : undefined
    },
    underlayProps: {
      onMouseDown: () => {
        if (props.isDismissable) {
          state.close();
        }
      },
      onMouseUp: () => {
        if (props.isDismissable) {
          state.close();
        }
      }
    }
  }),
  usePopover: (
    _props: Record<string, unknown>,
    state: {close: () => void}
  ) => ({
    popoverProps: {
      id: 'mock-popover',
      tabIndex: -1,
      style: {},
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          state.close();
        }
      }
    },
    arrowProps: {},
    underlayProps: {
      onMouseDown: () => state.close(),
      onMouseUp: () => state.close()
    },
    placement: 'bottom'
  }),
  DismissButton: ({onDismiss}: {onDismiss?: () => void}) =>
    React.createElement('button', {type: 'button', 'aria-label': 'Dismiss', onClick: () => onDismiss?.()})
}));

vi.mock('../src/OpenTransition', () => ({
  OpenTransition: ({
    in: isOpen,
    children,
    onEnter,
    onEntering,
    onEntered,
    onExit,
    onExiting,
    onExited
  }: {
    in?: boolean;
    children?: React.ReactNode;
    onEnter?: () => void;
    onEntering?: () => void;
    onEntered?: () => void;
    onExit?: () => void;
    onExiting?: () => void;
    onExited?: () => void;
  }) => {
    React.useEffect(() => {
      if (isOpen) {
        onEnter?.();
        onEntering?.();
        onEntered?.();
      } else {
        onExit?.();
        onExiting?.();
        onExited?.();
      }
    }, [isOpen, onEnter, onEntering, onEntered, onExit, onExiting, onExited]);

    return isOpen ? children : null;
  }
}));
