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
import {AlertDialog} from '../src';

describe('AlertDialog', () => {
  it('renders alert dialog with onPrimaryAction', () => {
    let onPrimaryAction = vi.fn();
    render(
      React.createElement(
        AlertDialog,
        {
          variant: 'confirmation',
          title: 'the title',
          primaryActionLabel: 'confirm',
          onPrimaryAction
        },
        'Content body'
      )
    );

    fireEvent.click(screen.getByRole('button', {name: 'confirm'}));
    expect(onPrimaryAction).toHaveBeenCalledTimes(1);
  });

  it('renders 2 button alert dialog with onPrimaryAction and onCancel', () => {
    let onPrimaryAction = vi.fn();
    let onCancel = vi.fn();

    render(
      React.createElement(
        AlertDialog,
        {
          variant: 'confirmation',
          title: 'the title',
          primaryActionLabel: 'confirm',
          cancelLabel: 'cancel',
          onPrimaryAction,
          onCancel
        },
        'Content body'
      )
    );

    fireEvent.click(screen.getByRole('button', {name: 'cancel'}));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onPrimaryAction).toHaveBeenCalledTimes(0);

    fireEvent.click(screen.getByRole('button', {name: 'confirm'}));
    expect(onPrimaryAction).toHaveBeenCalledTimes(1);
  });

  it('can add test ids', () => {
    render(
      React.createElement(
        AlertDialog,
        {
          variant: 'confirmation',
          title: 'the title',
          cancelLabel: 'cancel',
          primaryActionLabel: 'confirm',
          secondaryActionLabel: 'secondary',
          'data-testid': 'alert-dialog'
        },
        'Content body'
      )
    );

    expect(screen.getByTestId('alert-dialog')).toBeTruthy();
    expect(screen.getByTestId('rsp-AlertDialog-cancelButton')).toBeTruthy();
    expect(screen.getByTestId('rsp-AlertDialog-secondaryButton')).toBeTruthy();
    expect(screen.getByTestId('rsp-AlertDialog-confirmButton')).toBeTruthy();
  });
});
