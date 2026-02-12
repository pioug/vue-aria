import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {effectScope} from 'vue';

import {useToastState} from '../src/useToastState';

function createToastState<T>(props?: Parameters<typeof useToastState<T>>[0]) {
  let state: ReturnType<typeof useToastState<T>> | null = null;
  const scope = effectScope();
  scope.run(() => {
    state = useToastState<T>(props);
  });

  return {
    state: state!,
    stop: () => scope.stop()
  };
}

describe('useToastState', () => {
  const newValue = [{
    content: 'Toast Message',
    props: {timeout: 0}
  }];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it('should add a new toast via add', () => {
    const {state, stop} = createToastState<string>();
    expect(state.visibleToasts.value).toStrictEqual([]);

    state.add(newValue[0].content, newValue[0].props);
    expect(state.visibleToasts.value).toHaveLength(1);
    expect(state.visibleToasts.value[0].content).toBe(newValue[0].content);
    expect(state.visibleToasts.value[0].timeout).toBe(0);
    expect(state.visibleToasts.value[0].timer).toBeUndefined();
    expect(state.visibleToasts.value[0]).toHaveProperty('key');
    stop();
  });

  it('should add a new toast with a timer', () => {
    const {state, stop} = createToastState<string>();
    expect(state.visibleToasts.value).toStrictEqual([]);

    state.add('Test', {timeout: 5000});
    expect(state.visibleToasts.value).toHaveLength(1);
    expect(state.visibleToasts.value[0].content).toBe('Test');
    expect(state.visibleToasts.value[0].timeout).toBe(5000);
    expect(state.visibleToasts.value[0].timer).toBeDefined();
    expect(state.visibleToasts.value[0]).toHaveProperty('key');
    stop();
  });

  it('should be able to add multiple toasts', () => {
    const secondToast = {
      content: 'Second Toast',
      props: {timeout: 0}
    };

    const {state, stop} = createToastState<string>({maxVisibleToasts: 2});
    expect(state.visibleToasts.value).toStrictEqual([]);

    state.add(newValue[0].content, newValue[0].props);
    expect(state.visibleToasts.value[0].content).toBe(newValue[0].content);

    state.add(secondToast.content, secondToast.props);
    expect(state.visibleToasts.value).toHaveLength(2);
    expect(state.visibleToasts.value[0].content).toBe(secondToast.content);
    expect(state.visibleToasts.value[1].content).toBe(newValue[0].content);
    stop();
  });

  it('should maintain queue order on close', () => {
    const {state, stop} = createToastState<string>({maxVisibleToasts: 3});

    state.add('First Toast');
    state.add('Second Toast');
    state.add('Third Toast');

    expect(state.visibleToasts.value.map((toast) => toast.content)).toEqual([
      'Third Toast',
      'Second Toast',
      'First Toast'
    ]);

    state.close(state.visibleToasts.value[1].key);
    expect(state.visibleToasts.value.map((toast) => toast.content)).toEqual([
      'Third Toast',
      'First Toast'
    ]);
    stop();
  });

  it('should queue toasts when maxVisibleToasts is 1', () => {
    const {state, stop} = createToastState<string>();
    expect(state.visibleToasts.value).toStrictEqual([]);

    state.add(newValue[0].content, newValue[0].props);
    expect(state.visibleToasts.value[0].content).toBe(newValue[0].content);

    state.add('Second Toast');
    expect(state.visibleToasts.value).toHaveLength(1);
    expect(state.visibleToasts.value[0].content).toBe('Second Toast');

    state.close(state.visibleToasts.value[0].key);
    expect(state.visibleToasts.value).toHaveLength(1);
    expect(state.visibleToasts.value[0].content).toBe(newValue[0].content);
    stop();
  });

  it('should use provided wrapUpdate', () => {
    const wrapUpdate = vi.fn((fn: () => void) => fn());
    const {state, stop} = createToastState<string>({wrapUpdate});

    state.add(newValue[0].content, newValue[0].props);
    state.add('Second Toast');
    state.close(state.visibleToasts.value[0].key);

    expect(wrapUpdate).toHaveBeenCalledTimes(3);
    stop();
  });
});
