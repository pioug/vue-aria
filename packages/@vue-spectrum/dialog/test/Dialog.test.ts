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
import {fireEvent, render, screen} from '@testing-library/react';

import './testSetup';
import {Dialog} from '../src';
import {DialogContext} from '../src/context';
import {Header} from '@vue-spectrum/view';
import {Heading} from '@vue-spectrum/text';

describe('Dialog', () => {
  it('renders a basic dialog', () => {
    render(React.createElement(Dialog, null, 'contents'));
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('contents')).toBeTruthy();
  });

  it('if aria-label is specified, it takes precedence', () => {
    render(
      React.createElement(
        Dialog,
        {
          'aria-label': 'robin'
        },
        React.createElement(
          Heading,
          null,
          React.createElement(Header, null, 'The Title')
        )
      )
    );

    expect(screen.getByRole('dialog').getAttribute('aria-label')).toBe('robin');
  });

  it('supports custom data attributes', () => {
    render(
      React.createElement(
        Dialog,
        {
          'data-testid': 'test'
        },
        'contents'
      )
    );

    expect(screen.getByTestId('test')).toBeTruthy();
  });

  it('renders dismiss button from context and handles onClose', () => {
    let onClose = vi.fn();
    render(
      React.createElement(
        DialogContext.Provider,
        {
          value: {
            type: 'tray',
            isDismissable: true,
            onClose
          }
        },
        React.createElement(Dialog, null, 'contents')
      )
    );

    fireEvent.click(screen.getByRole('button', {name: 'Dismiss'}));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
