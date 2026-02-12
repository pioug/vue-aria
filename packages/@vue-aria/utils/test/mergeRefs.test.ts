import {describe, expect, it, vi} from 'vitest';

import {mergeRefs} from '../src/mergeRefs';

describe('mergeRefs', () => {
  it('merges object refs', () => {
    const ref1: {current: HTMLInputElement | null} = {current: null};
    const ref2: {current: HTMLInputElement | null} = {current: null};
    const node = document.createElement('input');

    const merged = mergeRefs(ref1, ref2) as (value: HTMLInputElement | null) => void;
    merged(node);

    expect(ref1.current).toBe(node);
    expect(ref2.current).toBe(node);
  });

  it('supports callback ref cleanup', () => {
    const cleanup = vi.fn();
    const callback = vi.fn((_node: HTMLInputElement | null) => cleanup);
    const refObj: {current: HTMLInputElement | null} = {current: null};
    const node = document.createElement('input');

    const merged = mergeRefs(refObj, callback) as (value: HTMLInputElement | null) => void | (() => void);
    const mergedCleanup = merged(node);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(node);
    expect(refObj.current).toBe(node);

    if (typeof mergedCleanup === 'function') {
      mergedCleanup();
    }

    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
