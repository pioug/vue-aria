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

import {Tooltip} from '../src/Tooltip';
import React from 'react';
import {render, screen} from '@testing-library/react';

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  }),
  I18nProvider: ({children}: {children: React.ReactNode}) => children
}));

describe('Tooltip', () => {
  it('supports children', () => {
    render(React.createElement(Tooltip, null, 'This is a tooltip'));
    let tooltip = screen.getByRole('tooltip');
    expect(tooltip.getAttribute('role')).toBe('tooltip');
    expect(tooltip.textContent).toContain('This is a tooltip');
  });

  it('supports aria-label', () => {
    render(React.createElement(Tooltip, {'aria-label': 'Tooltip'}));
    let tooltip = screen.getByRole('tooltip');
    expect(tooltip.getAttribute('aria-label')).toBe('Tooltip');
  });

  it('supports aria-labelledby', () => {
    render(React.createElement(Tooltip, {'aria-labelledby': 'test'}));
    let tooltip = screen.getByRole('tooltip');
    expect(tooltip.getAttribute('aria-labelledby')).toBe('test');
  });

  it('supports a ref', () => {
    let ref = React.createRef<{UNSAFE_getDOMNode(): HTMLElement | null}>();
    render(React.createElement(Tooltip, {ref}, 'This is a tooltip'));
    let tooltip = screen.getByRole('tooltip');
    expect(ref.current?.UNSAFE_getDOMNode()).toBe(tooltip);
  });
});
