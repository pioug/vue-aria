/*
 * Copyright 2021 Adobe. All rights reserved.
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

let inCardView: unknown = null;

vi.mock('../src/CardViewContext', () => ({
  useCardViewContext: () => inCardView
}));

vi.mock('../src/CardBase', () => ({
  CardBase: ({children}: {children?: React.ReactNode}) => React.createElement('article', {role: 'article'}, children)
}));

import {Card} from '../src';

describe('Card', () => {
  it('renders CardBase when outside CardView context', () => {
    inCardView = null;
    render(React.createElement(Card, null, 'Card Content'));
    expect(screen.getByRole('article')).toBeTruthy();
  });

  it('does not render when inside CardView context', () => {
    inCardView = {};
    let tree = render(React.createElement(Card, null, 'Card Content'));
    expect(tree.queryByRole('article')).toBeNull();
  });
});
