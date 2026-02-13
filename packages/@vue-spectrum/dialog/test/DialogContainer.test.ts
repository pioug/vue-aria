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
import {Dialog, DialogContainer} from '../src';

describe('DialogContainer', () => {
  it('opens dialog from child content', () => {
    render(
      React.createElement(
        DialogContainer,
        {
          onDismiss: vi.fn()
        },
        React.createElement(Dialog, null, 'contents')
      )
    );

    expect(screen.getByTestId('modal')).toBeTruthy();
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('passes dismiss through dialog context', () => {
    let onDismiss = vi.fn();
    render(
      React.createElement(
        DialogContainer,
        {
          onDismiss,
          isDismissable: true
        },
        React.createElement(Dialog, null, 'contents')
      )
    );

    fireEvent.click(screen.getByRole('button', {name: 'Dismiss'}));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
