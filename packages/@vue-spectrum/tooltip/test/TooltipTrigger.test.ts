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

import {Focusable} from '@vue-aria/focus';
import {Tooltip} from '../src/Tooltip';
import {TooltipTrigger} from '../src/TooltipTrigger';
import React from 'react';
import {render, screen} from '@testing-library/react';

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  }),
  I18nProvider: ({children}: {children: React.ReactNode}) => children
}));

vi.mock('@vue-spectrum/overlays', () => ({
  Overlay: ({isOpen, children}: {isOpen: boolean; children: React.ReactNode}) => isOpen
    ? React.createElement(React.Fragment, null, children)
    : null
}));

vi.mock('@vue-aria/overlays', () => ({
  useOverlayPosition: () => ({
    overlayProps: {style: {}},
    arrowProps: {},
    placement: 'top'
  })
}));

function renderTooltipTrigger(props: Record<string, unknown> = {}, tooltipProps: Record<string, unknown> = {}) {
  return render(
    React.createElement(
      TooltipTrigger,
      props,
      React.createElement(
        Focusable,
        null,
        React.createElement('button', {'aria-label': 'trigger', type: 'button'}, 'Trigger')
      ),
      React.createElement(Tooltip, tooltipProps, 'Helpful information.')
    )
  );
}

describe('TooltipTrigger', () => {
  it('can be controlled open', () => {
    renderTooltipTrigger({isOpen: true, delay: 0});

    let tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeTruthy();
    expect(tooltip.textContent).toContain('Helpful information.');
  });

  it('can be controlled hidden', () => {
    renderTooltipTrigger({isOpen: false, delay: 0});
    expect(screen.queryByRole('tooltip')).toBe(null);
  });

  it('can be uncontrolled open', () => {
    renderTooltipTrigger({defaultOpen: true, delay: 0});
    expect(screen.getByRole('tooltip')).toBeTruthy();
  });

  it('supports a ref on Tooltip inside TooltipTrigger', () => {
    let ref = React.createRef<{UNSAFE_getDOMNode(): HTMLElement | null}>();
    renderTooltipTrigger({isOpen: true, delay: 0}, {ref});

    let tooltip = screen.getByRole('tooltip');
    expect(ref.current?.UNSAFE_getDOMNode()).toBe(tooltip);
  });

  it('supports aria label props on the tooltip', () => {
    renderTooltipTrigger({isOpen: true, delay: 0}, {'aria-label': 'Tooltip label'});
    let tooltip = screen.getByRole('tooltip');
    expect(tooltip.getAttribute('aria-label')).toBe('Tooltip label');
  });
});
