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
import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react';

interface MockQueuedToast<T> {
  key: string,
  content: T
}

interface MockToastQueueState<T> {
  visibleToasts: Array<MockQueuedToast<T>>
}

vi.mock('@vue-stately/toast', () => {
  class ToastQueue<T> {
    private listeners = new Set<() => void>();
    private key = 0;
    private state: MockToastQueueState<T> = {visibleToasts: []};

    constructor(_options?: unknown) {}

    subscribe(listener: () => void) {
      this.listeners.add(listener);
      return () => {
        this.listeners.delete(listener);
      };
    }

    getState() {
      return this.state;
    }

    add(content: T) {
      this.key += 1;
      let key = String(this.key);
      this.state = {
        visibleToasts: [...this.state.visibleToasts, {key, content}]
      };
      this.emit();
      return key;
    }

    close(key: string) {
      this.state = {
        visibleToasts: this.state.visibleToasts.filter((toast) => toast.key !== key)
      };
      this.emit();
    }

    private emit() {
      for (let listener of this.listeners) {
        listener();
      }
    }
  }

  function useToastQueue<T>(queue: ToastQueue<T>) {
    let state = React.useSyncExternalStore(
      (listener) => queue.subscribe(listener),
      () => queue.getState(),
      () => queue.getState()
    );

    return {
      visibleToasts: state.visibleToasts,
      close: (key: string) => queue.close(key)
    };
  }

  return {
    ToastQueue,
    useToastQueue
  };
});

vi.mock('../src/Toaster', () => ({
  Toaster: ({children, state: _state, ...props}: {children?: React.ReactNode, state: unknown} & Record<string, unknown>) => (
    React.createElement(
      'div',
      {role: 'region', ...props},
      children
    )
  )
}));

interface MockToastProps {
  toast: {
    key: string,
    content: {
      children: string,
      actionLabel?: string,
      [key: string]: unknown
    }
  },
  state: {
    close: (key: string) => void
  }
}

vi.mock('../src/Toast', () => ({
  Toast: ({toast, state}: MockToastProps) => {
    let {
      children,
      actionLabel,
      onAction: _onAction,
      shouldCloseOnAction: _shouldCloseOnAction,
      ...domProps
    } = toast.content;

    return React.createElement(
      'div',
      {role: 'alertdialog', ...domProps},
      React.createElement('div', {role: 'alert'}, children),
      actionLabel ? React.createElement('button', null, actionLabel) : null,
      React.createElement(
        'button',
        {
          'aria-label': 'Close',
          onClick: () => state.close(toast.key)
        },
        'Close'
      )
    );
  }
}));

import {ToastContainer, ToastQueue} from '../src';
import {clearToastQueue} from '../src/ToastContainer';

describe('ToastContainer', () => {
  beforeEach(() => {
    clearToastQueue();
  });

  afterEach(() => {
    clearToastQueue();
  });

  it('renders and closes a queued toast', async () => {
    render(React.createElement(ToastContainer, {'data-testid': 'toast-region'}));
    expect(screen.queryByRole('alertdialog')).toBeNull();

    act(() => {
      ToastQueue.neutral('Toast is default');
    });

    let region = await screen.findByTestId('toast-region');
    expect(region).toBeTruthy();

    let toast = await screen.findByRole('alertdialog');
    let alert = within(toast).getByRole('alert');
    expect(alert.textContent).toBe('Toast is default');

    fireEvent.click(within(toast).getByRole('button', {name: 'Close'}));

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
  });

  it('supports DOM props on queued toast content', async () => {
    render(React.createElement(ToastContainer));

    act(() => {
      ToastQueue.neutral('Toast is default', {
        actionLabel: 'Update',
        'data-testid': 'toast-content'
      });
    });

    let toast = await screen.findByTestId('toast-content');
    expect(toast).toBeTruthy();
    expect(within(toast).getByText('Update')).toBeTruthy();
  });
});
