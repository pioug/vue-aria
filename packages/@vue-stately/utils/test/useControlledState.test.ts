import {describe, expect, it, vi} from 'vitest';
import {effectScope, nextTick, ref} from 'vue';

import {useControlledState} from '../src/useControlledState';

describe('useControlledState', () => {
  it('handles uncontrolled setValue behavior and does not call onChange for identical values', () => {
    const onChange = vi.fn();
    const scope = effectScope();

    scope.run(() => {
      const [value, setValue] = useControlledState<string>(undefined, 'defaultValue', onChange);
      expect(value.value).toBe('defaultValue');
      expect(onChange).not.toHaveBeenCalled();

      setValue('newValue');
      expect(value.value).toBe('newValue');
      expect(onChange).toHaveBeenLastCalledWith('newValue');

      onChange.mockClear();
      setValue('newValue');
      expect(value.value).toBe('newValue');
      expect(onChange).not.toHaveBeenCalled();
    });

    scope.stop();
  });

  it('handles uncontrolled callback setValue behavior', () => {
    const onChange = vi.fn();
    const scope = effectScope();

    scope.run(() => {
      const [value, setValue] = useControlledState<string>(undefined, 'defaultValue', onChange);

      setValue((prev) => {
        expect(prev).toBe('defaultValue');
        return 'newValue';
      });

      expect(value.value).toBe('newValue');
      expect(onChange).toHaveBeenLastCalledWith('newValue');
    });

    scope.stop();
  });

  it('handles controlled setValue behavior', () => {
    const onChange = vi.fn();
    const controlledValue = ref('controlledValue');
    const scope = effectScope();

    scope.run(() => {
      const [value, setValue] = useControlledState(controlledValue, 'defaultValue', onChange);
      expect(value.value).toBe('controlledValue');
      expect(onChange).not.toHaveBeenCalled();

      setValue('newValue');
      expect(value.value).toBe('controlledValue');
      expect(onChange).toHaveBeenLastCalledWith('newValue');
    });

    scope.stop();
  });

  it('supports multiple controlled callback updates in sequence', () => {
    const onChange = vi.fn();
    const controlledValue = ref('controlledValue');
    const scope = effectScope();

    scope.run(() => {
      const [value, setValue] = useControlledState(controlledValue, 'defaultValue', (next) => {
        controlledValue.value = next;
        onChange(next);
      });

      setValue((prev) => `${prev}-newValue`);
      setValue((prev) => `${prev}-wombat`);

      expect(value.value).toBe('controlledValue-newValue-wombat');
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenNthCalledWith(1, 'controlledValue-newValue');
      expect(onChange).toHaveBeenNthCalledWith(2, 'controlledValue-newValue-wombat');
    });

    scope.stop();
  });

  it('warns when switching between controlled and uncontrolled modes', async () => {
    const onChange = vi.fn();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const controlledValue = ref<string | undefined>('controlledValue');
    const scope = effectScope();

    scope.run(() => {
      useControlledState(controlledValue, 'defaultValue', onChange);
    });

    controlledValue.value = undefined;
    await nextTick();
    expect(warn).toHaveBeenLastCalledWith('WARN: A component changed from controlled to uncontrolled.');

    controlledValue.value = 'restored';
    await nextTick();
    expect(warn).toHaveBeenLastCalledWith('WARN: A component changed from uncontrolled to controlled.');

    warn.mockRestore();
    scope.stop();
  });
});
