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
import {renderToString} from 'react-dom/server';

import './testSetup';
import {ActionButton, Button, FieldButton, LogicButton} from '../src';

describe('Button SSR', () => {
  it('ActionButton should render without errors', () => {
    expect(() => renderToString(React.createElement(ActionButton, null, 'Button'))).not.toThrow();
  });

  it('Button should render without errors', () => {
    expect(() => renderToString(React.createElement(Button, null, 'Button'))).not.toThrow();
  });

  it('FieldButton should render without errors', () => {
    expect(() => renderToString(React.createElement(FieldButton, null, 'Button'))).not.toThrow();
  });

  it('LogicButton should render without errors', () => {
    expect(() => renderToString(React.createElement(LogicButton, null, 'Button'))).not.toThrow();
  });
});
