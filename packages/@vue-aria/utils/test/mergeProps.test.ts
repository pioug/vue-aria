import clsx from 'clsx';
import {describe, expect, it, vi} from 'vitest';

import {mergeIds} from '../src/useId';
import {mergeProps} from '../src/mergeProps';

describe('mergeProps', () => {
  it('handles one argument', () => {
    const onClick = () => {};
    const className = 'primary';
    const id = 'test_id';
    const mergedProps = mergeProps({onClick, className, id});
    expect(mergedProps.onClick).toBe(onClick);
    expect(mergedProps.className).toBe(className);
    expect(mergedProps.id).toBe(id);
  });

  it('combines callbacks', () => {
    const mockFn = vi.fn();
    const mergedProps = mergeProps(
      {onClick: () => mockFn('click1')},
      {onClick: () => mockFn('click2')},
      {onClick: () => mockFn('click3')}
    );

    mergedProps.onClick();
    expect(mockFn).toHaveBeenNthCalledWith(1, 'click1');
    expect(mockFn).toHaveBeenNthCalledWith(2, 'click2');
    expect(mockFn).toHaveBeenNthCalledWith(3, 'click3');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('merges props with different keys', () => {
    const mockFn = vi.fn();
    const mergedProps = mergeProps(
      {onClick: () => mockFn('click1')},
      {onHover: () => mockFn('hover'), styles: {margin: 2}},
      {onClick: () => mockFn('click2'), onFocus: () => mockFn('focus')}
    );

    mergedProps.onClick();
    mergedProps.onFocus();
    mergedProps.onHover();

    expect(mockFn).toHaveBeenNthCalledWith(1, 'click1');
    expect(mockFn).toHaveBeenNthCalledWith(2, 'click2');
    expect(mockFn).toHaveBeenNthCalledWith(3, 'focus');
    expect(mockFn).toHaveBeenNthCalledWith(4, 'hover');
    expect(mergedProps.styles.margin).toBe(2);
  });

  it('combines classNames', () => {
    const mergedProps = mergeProps(
      {className: 'primary'},
      {className: 'hover'},
      {className: 'focus'}
    );
    expect(mergedProps.className).toBe(clsx('primary', 'hover', 'focus'));
  });

  it('combines ids', () => {
    const mergedProps = mergeProps({id: 'id1'}, {id: 'id2'}, {id: 'id3'});
    const mergedIds = mergeIds(mergeIds('id1', 'id2'), 'id3');
    expect(mergedProps.id).toBe(mergedIds);
  });

  it('overrides other props', () => {
    const mergedProps = mergeProps({data: 'id1'}, {data: 'id2'});
    expect(mergedProps.data).toBe('id2');
  });

  it('merges refs', () => {
    const refA: {current: number | null} = {current: null};
    const refB: {current: number | null} = {current: null};
    const merged = mergeProps({ref: refA}, {ref: refB});

    (merged.ref as (value: number) => void)(2);
    expect(refA.current).toBe(2);
    expect(refB.current).toBe(2);
  });
});
