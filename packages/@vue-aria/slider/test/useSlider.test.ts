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

describe('useSlider', () => {
  let numberFormatter = new Intl.NumberFormat('en-US', {});

  describe('aria labels', () => {
    function renderUseSlider(sliderProps) {
      return renderHook(() => {
        let trackRef = useRef(null);
        let inputRef = useRef(null);
        let state = useSliderState({...sliderProps, numberFormatter});
        let props = useSlider(sliderProps, state, trackRef);
        let {inputProps} = useSliderThumb({
          index: 0,
          inputRef,
          trackRef
        }, state);
        return {inputProps, props, state, trackRef};
      }).result;
    }

    it('should have the right labels when setting label', () => {
      let result = renderUseSlider({
        defaultValue: [0],
        label: 'Slider'
      });

      let {groupProps, labelProps} = result.current.props;
      expect(groupProps.role).toBe('group');
      expect(labelProps.htmlFor).toBeUndefined();
    });

    it('should have the right labels when setting aria-label', () => {
      let result = renderUseSlider({
        defaultValue: [0],
        'aria-label': 'Slider'
      });

      let {groupProps, labelProps} = result.current.props;
      expect(labelProps).toEqual({});
      expect(groupProps.role).toBe('group');
      expect(groupProps['aria-label']).toBe('Slider');
    });
  });

  describe('interactions on track', () => {
    let rectSpy: ReturnType<typeof vi.spyOn>;
    let stateRef = React.createRef<any>();

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
      let state = useSliderState({...props, numberFormatter});
      stateRef.current = state;
      let {trackProps} = useSlider(props, state, trackRef);
      return React.createElement(
        'div',
        {
          ...trackProps,
          'data-testid': 'track',
          ref: trackRef
        }
      );
    }

    it('should allow you to set value of closest thumb by dragging on track', () => {
      let onChangeSpy = vi.fn();
      let onChangeEndSpy = vi.fn();
      render(React.createElement(Example, {
        'aria-label': 'Slider',
        defaultValue: [10, 80],
        onChange: onChangeSpy,
        onChangeEnd: onChangeEndSpy
      }));

      let track = screen.getByTestId('track');
      fireEvent.mouseDown(track, {button: 0, clientX: 20, pageX: 20});
      expect(onChangeSpy).toHaveBeenLastCalledWith([20, 80]);
      expect(onChangeEndSpy).not.toHaveBeenCalled();

      fireEvent.mouseMove(track, {clientX: 40, pageX: 40});
      expect(onChangeSpy).toHaveBeenLastCalledWith([30, 80]);
      expect(onChangeEndSpy).not.toHaveBeenCalled();

      fireEvent.mouseUp(track, {clientX: 40, pageX: 40});
      expect(onChangeEndSpy).toHaveBeenLastCalledWith([30, 80]);
    });

    it('should not allow you to set value if disabled', () => {
      let onChangeSpy = vi.fn();
      let onChangeEndSpy = vi.fn();
      render(React.createElement(Example, {
        'aria-label': 'Slider',
        defaultValue: [10, 80],
        isDisabled: true,
        onChange: onChangeSpy,
        onChangeEnd: onChangeEndSpy
      }));

      let track = screen.getByTestId('track');
      fireEvent.mouseDown(track, {button: 0, clientX: 20, pageX: 20});
      fireEvent.mouseMove(track, {clientX: 30, pageX: 30});
      fireEvent.mouseUp(track, {clientX: 30, pageX: 30});

      expect(onChangeSpy).not.toHaveBeenCalled();
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([10, 80]);
    });
  });
});
