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

function classNames(...values: Array<unknown>) {
  let classes: string[] = [];

  for (let value of values) {
    if (!value) {
      continue;
    }

    if (typeof value === 'string') {
      classes.push(value);
      continue;
    }

    if (typeof value === 'object') {
      for (let [key, enabled] of Object.entries(value)) {
        if (enabled) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(' ');
}

vi.mock('@vue-spectrum/utils', () => ({
  classNames,
  useDOMRef: (ref: unknown) => ref,
  useStyleProps: (props: Record<string, unknown> = {}) => ({
    styleProps: {
      className: typeof props.UNSAFE_className === 'string' ? props.UNSAFE_className : undefined,
      style: props.UNSAFE_style,
      'data-testid': props['data-testid']
    }
  })
}));

vi.mock('@vue-aria/progress', () => ({
  useProgressBar: (props: Record<string, unknown>) => {
    let minValue = Number(props.minValue ?? 0);
    let maxValue = Number(props.maxValue ?? 100);
    let value = Number(props.value ?? 0);
    let clampedValue = Math.min(maxValue, Math.max(minValue, value));
    let percentage = Math.round(((clampedValue - minValue) / (maxValue - minValue)) * 100);

    return {
      progressBarProps: {
        role: 'progressbar',
        'aria-valuemin': minValue,
        'aria-valuemax': maxValue,
        'aria-valuenow': props.isIndeterminate ? undefined : clampedValue,
        'aria-valuetext': props.isIndeterminate ? undefined : `${percentage}%`,
        'aria-label': props['aria-label'],
        'aria-labelledby': props['aria-labelledby'] ?? (props.label ? 'progress-label' : undefined),
        'data-testid': props['data-testid']
      },
      labelProps: {
        id: 'progress-label'
      }
    };
  }
}));
