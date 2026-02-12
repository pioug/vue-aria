/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {focusSafely} from '../src/focusSafely';

const {focusWithoutScrollingMock, runAfterTransitionMock, modalityState} = vi.hoisted(() => ({
  focusWithoutScrollingMock: vi.fn(),
  runAfterTransitionMock: vi.fn(),
  modalityState: {value: 'keyboard'}
}));

vi.mock('@vue-aria/utils', async () => {
  const actual = await vi.importActual<typeof import('@vue-aria/utils')>('@vue-aria/utils');
  return {
    ...actual,
    focusWithoutScrolling: (el: any) => focusWithoutScrollingMock(el),
    runAfterTransition: (cb: () => void) => runAfterTransitionMock(cb)
  };
});

vi.mock('../src/useFocusVisible', () => ({
  getInteractionModality: () => modalityState.value
}));

describe('focusSafely', () => {
  beforeEach(() => {
    focusWithoutScrollingMock.mockClear();
    runAfterTransitionMock.mockClear();
    modalityState.value = 'keyboard';
  });

  it('focuses immediately when interaction modality is not virtual', () => {
    let button = document.createElement('button');
    document.body.appendChild(button);

    focusSafely(button);

    expect(focusWithoutScrollingMock).toHaveBeenCalledTimes(1);
    expect(focusWithoutScrollingMock).toHaveBeenCalledWith(button);
    expect(runAfterTransitionMock).not.toHaveBeenCalled();

    button.remove();
  });

  it('does not focus an element that disconnects before deferred focus runs', () => {
    modalityState.value = 'virtual';
    let button = document.createElement('button');
    document.body.appendChild(button);
    let deferred: (() => void) | undefined;
    runAfterTransitionMock.mockImplementation((cb) => {
      deferred = cb;
    });

    focusSafely(button);
    button.remove();
    deferred?.();

    expect(focusWithoutScrollingMock).not.toHaveBeenCalled();
  });

  it('focuses connected element when modality is virtual and deferred callback runs', () => {
    modalityState.value = 'virtual';
    let button = document.createElement('button');
    document.body.appendChild(button);
    let deferred: (() => void) | undefined;
    runAfterTransitionMock.mockImplementation((cb) => {
      deferred = cb;
    });

    focusSafely(button);
    expect(focusWithoutScrollingMock).not.toHaveBeenCalled();

    deferred?.();
    expect(focusWithoutScrollingMock).toHaveBeenCalledTimes(1);
    expect(focusWithoutScrollingMock).toHaveBeenCalledWith(button);

    button.remove();
  });
});
