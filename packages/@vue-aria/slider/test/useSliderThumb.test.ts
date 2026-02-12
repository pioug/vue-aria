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

import {fireEvent, render, renderHook, screen} from '@testing-library/react';
import {useRef} from 'react';
import {useSlider, useSliderThumb} from '../src';
import {useSliderState} from '@vue-stately/slider';
import React from 'react';

vi.mock('@vue-aria/i18n', () => ({
  useLocale: () => ({
    direction: 'ltr',
    locale: 'en-US'
  })
}));

describe('useSliderThumb', () => {
  let numberFormatter = new Intl.NumberFormat('en-US', {});

  describe('aria labels', () => {
    it('should have the right labels with Slider-level label', () => {
      let result = renderHook(() => {
        let trackRef = React.createRef(null);
        let inputRef = React.createRef(null);
        let sliderProps = {
          defaultValue: [50],
          label: 'slider',
          maxValue: 200,
          minValue: 10,
          step: 2
        };
        let state = useSliderState({...sliderProps, numberFormatter});
        let {groupProps, labelProps} = useSlider(sliderProps, state, trackRef);
        let props = useSliderThumb({
          index: 0,
          inputRef,
          trackRef
        }, state);
        return {groupProps, labelProps, props};
      }).result;

      let {inputProps} = result.current.props;
      let labelId = result.current.labelProps.id;
      expect(inputProps).toMatchObject({
        'aria-labelledby': `${labelId}`,
        max: 200,
        min: 10,
        step: 2,
        type: 'range',
        value: 50
      });
    });

    it('should have the right labels with Slider thumb aria-label', () => {
      let result = renderHook(() => {
        let trackRef = React.createRef(null);
        let inputRef = React.createRef(null);
        let sliderProps = {
          'aria-label': 'slider',
          defaultValue: [50, 70],
          maxValue: 200,
          minValue: 10,
          step: 2
        };
        let state = useSliderState({...sliderProps, numberFormatter});
        let {groupProps} = useSlider(sliderProps, state, trackRef);
        let props0 = useSliderThumb({
          'aria-label': 'thumb0',
          index: 0,
          inputRef,
          trackRef
        }, state);
        let props1 = useSliderThumb({
          'aria-label': 'thumb1',
          index: 1,
          inputRef,
          trackRef
        }, state);
        return {groupProps, props0, props1};
      }).result;

      let {inputProps: inputProps0} = result.current.props0;
      let {inputProps: inputProps1} = result.current.props1;
      let labelId = result.current.groupProps.id;
      expect(inputProps0).toMatchObject({
        'aria-label': 'thumb0',
        'aria-labelledby': `${inputProps0.id} ${labelId}`,
        max: 70,
        min: 10,
        step: 2,
        type: 'range',
        value: 50
      });
      expect(inputProps1).toMatchObject({
        'aria-label': 'thumb1',
        'aria-labelledby': `${inputProps1.id} ${labelId}`,
        max: 200,
        min: 50,
        step: 2,
        type: 'range',
        value: 70
      });
    });
  });

  describe('interactions on thumbs, where track contains thumbs', () => {
    let rectSpy: ReturnType<typeof vi.spyOn>;

    beforeAll(() => {
      rectSpy = vi.spyOn(window.HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({
        bottom: 100,
        height: 100,
        left: 0,
        right: 100,
        toJSON: () => ({}),
        top: 0,
        width: 100,
        x: 0,
        y: 0
      }));
    });

    afterAll(() => {
      rectSpy.mockRestore();
    });

    function Example(props) {
      let trackRef = useRef<HTMLDivElement>(null);
      let inputRef = useRef<HTMLInputElement>(null);
      let state = useSliderState({...props, numberFormatter});
      let {trackProps} = useSlider(props, state, trackRef);
      let {inputProps, thumbProps} = useSliderThumb({
        'aria-label': 'Min',
        index: 0,
        inputRef,
        trackRef
      }, state);

      return React.createElement(
        'div',
        {
          ...trackProps,
          'data-testid': 'track',
          ref: trackRef
        },
        React.createElement(
          'div',
          {
            ...thumbProps,
            'data-testid': 'thumb'
          },
          React.createElement('input', {
            ...inputProps,
            ref: inputRef
          })
        )
      );
    }

    it('can be moved by dragging', () => {
      let onChangeSpy = vi.fn();
      let onChangeEndSpy = vi.fn();
      render(React.createElement(Example, {
        'aria-label': 'Slider',
        defaultValue: [10],
        onChange: onChangeSpy,
        onChangeEnd: onChangeEndSpy
      }));

      let thumb = screen.getByTestId('thumb');
      fireEvent.mouseDown(thumb, {button: 0, clientX: 10, pageX: 10});
      expect(onChangeSpy).not.toHaveBeenCalled();
      expect(onChangeEndSpy).not.toHaveBeenCalled();

      fireEvent.mouseMove(thumb, {clientX: 20, pageX: 20});
      expect(onChangeSpy).toHaveBeenLastCalledWith([20]);
      expect(onChangeEndSpy).not.toHaveBeenCalled();

      fireEvent.mouseUp(thumb, {clientX: 20, pageX: 20});
      expect(onChangeEndSpy).toHaveBeenCalledTimes(1);
    });
  });
});
