import {describe, expect, it, vi} from 'vitest';

import {useObjectRef} from '../src/useObjectRef';

describe('useObjectRef', () => {
  it('returns an empty object ref by default', () => {
    const ref = useObjectRef<HTMLInputElement>();
    expect(ref).toBeDefined();
    expect(ref.current).toBeNull();
  });

  it('supports object refs', () => {
    const forwarded: {current: HTMLInputElement | null} = {current: null};
    const ref = useObjectRef<HTMLInputElement>(forwarded);
    const input = document.createElement('input');

    ref.current = input;
    expect(forwarded.current).toBe(input);
  });

  it('supports function refs', () => {
    let inputElem: HTMLInputElement | null = null;
    const callback = (el: HTMLInputElement | null) => {
      inputElem = el;
    };

    const ref = useObjectRef<HTMLInputElement>(callback);
    const input = document.createElement('input');
    ref.current = input;

    expect(inputElem).toBe(input);
  });

  it('calls cleanup function when ref is reassigned', () => {
    const cleanup = vi.fn();
    const setup = vi.fn((_el: HTMLInputElement | null) => cleanup);
    const ref = useObjectRef<HTMLInputElement>(setup);
    const input = document.createElement('input');

    ref.current = input;
    expect(setup).toHaveBeenCalledTimes(1);
    expect(cleanup).toHaveBeenCalledTimes(0);

    ref.current = null;
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
