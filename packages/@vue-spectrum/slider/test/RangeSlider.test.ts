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

vi.mock('@vue-spectrum/utils', () => ({
  classNames: (...values: Array<string | null | undefined>) => values.filter(Boolean).join(' ')
}));

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    direction: 'ltr'
  }),
  useLocalizedStringFormatter: () => ({
    format: (key: string) => key
  })
}));

vi.mock('../src/SliderBase', () => ({
  SliderBase: React.forwardRef(function MockSliderBase(
    props: Record<string, unknown>,
    ref: React.ForwardedRef<HTMLDivElement>
  ) {
    sliderBaseSpy(props);
    let values = (props.value as number[] | undefined) ?? (props.defaultValue as number[] | undefined) ?? [0, 100];
    let [leftValue, rightValue] = values;

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
        defaultValue: String(leftValue),
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
          let onChange = props.onChange as ((value: number[]) => void) | undefined;
          onChange?.([Number(event.target.value), rightValue]);
        }
      }),
      React.createElement('input', {
        role: 'slider',
        defaultValue: String(rightValue),
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
          let onChange = props.onChange as ((value: number[]) => void) | undefined;
          onChange?.([leftValue, Number(event.target.value)]);
        }
      }),
      React.createElement('output', {role: 'status'}, `${leftValue} – ${rightValue}`)
    );
  })
}));

import {RangeSlider} from '../src';

describe('RangeSlider', () => {
  beforeEach(() => {
    sliderBaseSpy.mockClear();
  });

  it('supports aria-label', () => {
    render(React.createElement(RangeSlider, {'aria-label': 'The Label'}));

    let group = screen.getByRole('group');
    expect(group.getAttribute('aria-label')).toBe('The Label');
  });

  it('normalizes defaultValue and renders value text', () => {
    render(
      React.createElement(
        RangeSlider,
        {
          label: 'The Label',
          defaultValue: {
            start: 20,
            end: 40
          }
        }
      )
    );

    expect(sliderBaseSpy).toHaveBeenCalledTimes(1);
    let props = sliderBaseSpy.mock.calls[0][0];
    expect(props.defaultValue).toEqual([20, 40]);
    expect(screen.getByRole('status').textContent).toBe('20 – 40');
  });

  it('maps onChange values to range object', () => {
    let onChangeSpy = vi.fn();

    render(
      React.createElement(
        RangeSlider,
        {
          value: {
            start: 20,
            end: 40
          },
          onChange: onChangeSpy
        }
      )
    );

    let sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[0], {target: {value: '30'}});

    expect(onChangeSpy).toHaveBeenCalledWith({start: 30, end: 40});
  });
});
