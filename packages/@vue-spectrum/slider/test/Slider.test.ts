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

let sliderBaseSpy = vi.fn();

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    direction: 'ltr'
  })
}));

vi.mock('@vue-spectrum/utils', () => ({
  classNames: (...values: Array<string | null | undefined>) => values.filter(Boolean).join(' ')
}));

vi.mock('../src/SliderBase', () => ({
  SliderBase: React.forwardRef(function MockSliderBase(
    props: Record<string, unknown>,
    ref: React.ForwardedRef<HTMLDivElement>
  ) {
    sliderBaseSpy(props);
    let values = (props.value as number[] | undefined) ?? (props.defaultValue as number[] | undefined) ?? [0];
    let value = values[0];

    return React.createElement(
      'div',
      {
        ref,
        role: 'group',
        'aria-label': props['aria-label'] as string | undefined
      },
      props.label ? React.createElement('span', null, props.label as React.ReactNode) : null,
      React.createElement('input', {
        role: 'slider',
        defaultValue: String(value),
        'aria-valuetext': String(value),
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
          let onChange = props.onChange as ((value: number[]) => void) | undefined;
          onChange?.([Number(event.target.value)]);
        }
      }),
      props.showValueLabel === false
        ? null
        : React.createElement(
          'output',
          {role: 'status'},
          props.getValueLabel
            ? (props.getValueLabel as (values: number[]) => string)([value])
            : String(value)
        )
    );
  })
}));

import {Slider} from '../src';

describe('Slider', () => {
  beforeEach(() => {
    sliderBaseSpy.mockClear();
  });

  it('supports aria-label', () => {
    render(React.createElement(Slider, {'aria-label': 'The Label'}));

    let group = screen.getByRole('group');
    let slider = screen.getByRole('slider');

    expect(group.getAttribute('aria-label')).toBe('The Label');
    expect(slider.getAttribute('aria-valuetext')).toBe('0');
  });

  it('supports defaultValue and maps onChange', () => {
    let onChangeSpy = vi.fn();

    render(
      React.createElement(
        Slider,
        {
          label: 'The Label',
          defaultValue: 20,
          onChange: onChangeSpy
        }
      )
    );

    let slider = screen.getByRole('slider') as HTMLInputElement;
    let output = screen.getByRole('status');

    expect(slider.value).toBe('20');
    expect(output.textContent).toBe('20');

    fireEvent.change(slider, {target: {value: '40'}});
    expect(onChangeSpy).toHaveBeenCalledWith(40);
  });

  it('normalizes value for SliderBase', () => {
    render(
      React.createElement(
        Slider,
        {
          label: 'The Label',
          value: 50
        }
      )
    );

    expect(sliderBaseSpy).toHaveBeenCalledTimes(1);
    let props = sliderBaseSpy.mock.calls[0][0];
    expect(props.value).toEqual([50]);
  });
});
