/*
 * Copyright 2023 Adobe. All rights reserved.
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
import {render, screen} from '@testing-library/react';

import './testSetup';
import {ActionGroup} from '../src';

interface ToolbarProps {
  children?: React.ReactNode,
  orientation?: 'horizontal' | 'vertical',
  'aria-label'?: string
}

function Divider(props: {orientation?: 'horizontal' | 'vertical'}) {
  if (props.orientation === 'vertical') {
    return React.createElement('div', {role: 'separator', 'aria-orientation': 'vertical'});
  }

  return React.createElement('div', {role: 'separator'});
}

function Toolbar({children, orientation = 'horizontal', ...domProps}: ToolbarProps) {
  let mappedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child) || child.type !== Divider) {
      return child;
    }

    return React.cloneElement(child, {
      orientation: orientation === 'horizontal' ? 'vertical' : 'horizontal'
    });
  });

  return React.createElement('div', {role: 'toolbar', ...domProps}, mappedChildren);
}

describe('Toolbar', () => {
  it('renders action buttons for items with keys and children', () => {
    render(
      React.createElement(
        Toolbar,
        {'aria-label': 'Toolbar'},
        React.createElement(
          ActionGroup,
          null,
          React.createElement('div', {key: 'alignleft'}, 'Align left'),
          React.createElement('div', {key: 'aligncenter'}, 'Align center'),
          React.createElement('div', {key: 'alignright'}, 'Align right')
        )
      )
    );

    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('renders dividers with expected orientation', () => {
    let {rerender} = render(
      React.createElement(
        Toolbar,
        {'aria-label': 'Toolbar'},
        React.createElement(
          ActionGroup,
          null,
          React.createElement('div', {key: 'left'}, 'Left')
        ),
        React.createElement(Divider),
        React.createElement(
          ActionGroup,
          null,
          React.createElement('div', {key: 'right'}, 'Right')
        )
      )
    );

    screen.getAllByRole('separator').forEach((separator) => {
      expect(separator.getAttribute('aria-orientation')).toBe('vertical');
    });

    rerender(
      React.createElement(
        Toolbar,
        {
          'aria-label': 'Toolbar',
          orientation: 'vertical'
        },
        React.createElement(
          ActionGroup,
          null,
          React.createElement('div', {key: 'left'}, 'Left')
        ),
        React.createElement(Divider),
        React.createElement(
          ActionGroup,
          null,
          React.createElement('div', {key: 'right'}, 'Right')
        )
      )
    );

    screen.getAllByRole('separator').forEach((separator) => {
      expect(separator.hasAttribute('aria-orientation')).toBe(false);
    });
  });

  it('sets aria-label', () => {
    render(
      React.createElement(
        Toolbar,
        {'aria-label': 'Toolbar aria-label'},
        React.createElement(
          ActionGroup,
          null,
          React.createElement('div', {key: 'left'}, 'Left')
        )
      )
    );

    expect(screen.getByLabelText('Toolbar aria-label')).toBeTruthy();
  });
});
