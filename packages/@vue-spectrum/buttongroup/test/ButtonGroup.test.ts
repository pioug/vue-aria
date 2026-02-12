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

import {ButtonGroup} from '../src';
import React from 'react';
import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const buttonGroupId = 'button-group';

vi.mock('@vue-spectrum/provider', () => ({
  Provider: ({children, isDisabled}: {children: React.ReactNode; isDisabled?: boolean}) => (
    React.createElement(
      React.Fragment,
      null,
      React.Children.map(children, (child) => {
        if (!React.isValidElement(child) || isDisabled == null || child.props?.isDisabled != null) {
          return child;
        }

        return React.cloneElement(child, {isDisabled});
      })
    )
  ),
  useProvider: () => ({scale: 'medium'}),
  useProviderProps: <T,>(props: T) => props
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    locale: 'en-US',
    direction: 'ltr'
  })
}));

const Button = React.forwardRef(function Button(props: any, ref: React.Ref<HTMLButtonElement>) {
  let {children, onPress, isDisabled, ...otherProps} = props;
  return React.createElement(
    'button',
    {
      ...otherProps,
      disabled: isDisabled,
      onClick: () => {
        if (!isDisabled) {
          onPress?.();
        }
      },
      ref
    },
    children
  );
});

function renderComponent(props: Record<string, unknown> = {}) {
  let onPress1 = vi.fn();
  let onPress2 = vi.fn();
  let onPress3 = vi.fn();

  let view = render(
    React.createElement(
      ButtonGroup,
      {
        'data-testid': buttonGroupId,
        ...props
      },
      React.createElement(Button, {onPress: onPress1, variant: 'primary'}, 'Button1'),
      React.createElement(Button, {onPress: onPress2, variant: 'primary'}, 'Button2'),
      React.createElement(Button, {onPress: onPress3, variant: 'primary'}, 'Button3')
    )
  );

  return {
    ...view,
    onPress1,
    onPress2,
    onPress3
  };
}

describe('ButtonGroup', () => {
  it('renders multiple buttons', async () => {
    let user = userEvent.setup();
    let tree = renderComponent();
    let buttonGroup = tree.getByTestId(buttonGroupId);
    expect(buttonGroup).toBeTruthy();

    let button1 = within(buttonGroup).getByText('Button1');
    let button2 = within(buttonGroup).getByText('Button2');
    let button3 = within(buttonGroup).getByText('Button3');

    await user.click(button1);
    await user.click(button2);
    await user.click(button3);

    expect(tree.onPress1).toHaveBeenCalledTimes(1);
    expect(tree.onPress2).toHaveBeenCalledTimes(1);
    expect(tree.onPress3).toHaveBeenCalledTimes(1);
  });

  it('supports UNSAFE_className', () => {
    renderComponent({UNSAFE_className: 'custom class'});
    let buttonGroup = screen.getByTestId(buttonGroupId);
    expect((buttonGroup.getAttribute('class') || '').includes('custom class')).toBe(true);
  });

  it('supports attaching a ref to the button group', () => {
    let ref = React.createRef<{UNSAFE_getDOMNode(): HTMLElement | null}>();
    renderComponent({ref});
    let buttonGroup = screen.getByTestId(buttonGroupId);
    expect(ref.current?.UNSAFE_getDOMNode()).toBe(buttonGroup);
  });

  it('supports disabling all buttons via isDisabled', async () => {
    let user = userEvent.setup();
    let tree = renderComponent({isDisabled: true});
    let buttonGroup = tree.getByTestId(buttonGroupId);

    let button1 = within(buttonGroup).getByText('Button1');
    let button2 = within(buttonGroup).getByText('Button2');
    let button3 = within(buttonGroup).getByText('Button3');

    await user.click(button1);
    await user.click(button2);
    await user.click(button3);

    expect(tree.onPress1).toHaveBeenCalledTimes(0);
    expect(tree.onPress2).toHaveBeenCalledTimes(0);
    expect(tree.onPress3).toHaveBeenCalledTimes(0);
  });

  it('supports vertical orientation', () => {
    renderComponent({orientation: 'vertical'});
    let buttonGroup = screen.getByTestId(buttonGroupId);
    expect((buttonGroup.getAttribute('class') || '').includes('spectrum-ButtonGroup--vertical')).toBe(true);
  });
});
