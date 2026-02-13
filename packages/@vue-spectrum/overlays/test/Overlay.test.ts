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
import {render, screen} from '@testing-library/react';

import './testSetup';
import {Overlay} from '../src';

let ExampleOverlay = React.forwardRef(function ExampleOverlay(
  _props: Record<string, unknown>,
  ref: React.ForwardedRef<HTMLSpanElement>
) {
  return React.createElement('span', {'data-testid': 'contents', ref}, 'Overlay');
});

describe('Overlay', () => {
  it('should render nothing if isOpen is not set', () => {
    let modalRef = React.createRef<HTMLSpanElement>();
    render(
      React.createElement(
        Overlay,
        {
          nodeRef: modalRef as any
        },
        React.createElement(ExampleOverlay, {ref: modalRef})
      )
    );

    expect(screen.queryByTestId('contents')).toBeNull();
  });

  it('should render into a portal in the body', () => {
    let modalRef = React.createRef<HTMLSpanElement>();
    let {container} = render(
      React.createElement(
        Overlay,
        {
          isOpen: true,
          nodeRef: modalRef as any
        },
        React.createElement(ExampleOverlay, {ref: modalRef})
      )
    );

    let content = screen.getByTestId('contents');
    expect(document.body.contains(content)).toBe(true);
    expect(container.contains(content)).toBe(false);
  });
});
