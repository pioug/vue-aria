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

import clsx from 'clsx';
import {chain} from './chain';
import {mergeRefs} from './mergeRefs';
import {mergeIds} from './useId';

interface Props {
  [key: string]: any;
}

type PropsArg = Props | null | undefined;

type TupleTypes<T> = {[P in keyof T]: T[P]} extends {[key: number]: infer V} ? NullToObject<V> : never;
type NullToObject<T> = T extends null | undefined ? {} : T;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

/**
 * Merges multiple props objects together. Event handlers are chained,
 * classNames are combined, ids are deduplicated, and refs are merged.
 */
export function mergeProps<T extends PropsArg[]>(...args: T): UnionToIntersection<TupleTypes<T>> {
  const result: Props = {...args[0]};
  for (let i = 1; i < args.length; i++) {
    const props = args[i];
    for (const key in props) {
      const a = result[key];
      const b = props[key];

      if (
        typeof a === 'function' &&
        typeof b === 'function' &&
        key[0] === 'o' &&
        key[1] === 'n' &&
        key.charCodeAt(2) >= 65 &&
        key.charCodeAt(2) <= 90
      ) {
        result[key] = chain(a, b);
      } else if (
        (key === 'className' || key === 'UNSAFE_className') &&
        typeof a === 'string' &&
        typeof b === 'string'
      ) {
        result[key] = clsx(a, b);
      } else if (key === 'id' && a && b) {
        result.id = mergeIds(a, b);
      } else if (key === 'ref' && a && b) {
        result.ref = mergeRefs(a, b);
      } else {
        result[key] = b !== undefined ? b : a;
      }
    }
  }

  return result as UnionToIntersection<TupleTypes<T>>;
}
