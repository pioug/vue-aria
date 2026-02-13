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
import {Tray} from '../src';
import {useOverlayTriggerState} from '@vue-stately/overlays';

function TestTray(props: Record<string, unknown>) {
  let state = useOverlayTriggerState(props);
  return React.createElement(
    Tray,
    {
      ...props,
      state
    } as any,
    React.createElement('div', null, 'contents')
  );
}

describe('Tray', () => {
  it('should render nothing if isOpen is not set', () => {
    render(React.createElement(TestTray, null));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(React.createElement(TestTray, {isOpen: true}));
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('hides the tray when pressing the escape key', () => {
    let onOpenChange = vi.fn();
    render(React.createElement(TestTray, {isOpen: true, onOpenChange}));

    fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('hides the tray when clicking outside', () => {
    let onOpenChange = vi.fn();
    render(React.createElement(TestTray, {isOpen: true, onOpenChange}));

    fireEvent.mouseDown(screen.getByTestId('underlay'));
    fireEvent.mouseUp(screen.getByTestId('underlay'));
    expect(onOpenChange).toHaveBeenCalled();
  });

  it('should have hidden dismiss buttons for screen readers', () => {
    let onOpenChange = vi.fn();
    render(React.createElement(TestTray, {isOpen: true, onOpenChange}));

    let buttons = screen.getAllByRole('button', {name: 'Dismiss'});
    expect(buttons.length).toBe(2);

    fireEvent.click(buttons[0]);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
