import { chain } from "./chain";
import { mergeRefs } from "./mergeRefs";
import { mergeIds } from "./useId";

type Props = Record<string, any>;
type PropsArg = Props | null | undefined;
type TupleTypes<T> = { [P in keyof T]: T[P] } extends { [key: number]: infer V } ? NullToObject<V> : never;
type NullToObject<T> = T extends (null | undefined) ? {} : T;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

export function mergeProps<T extends PropsArg[]>(...args: T): UnionToIntersection<TupleTypes<T>> {
  const result: Props = { ...args[0] };

  for (let i = 1; i < args.length; i++) {
    const props = args[i];
    for (const key in props) {
      const a = result[key];
      const b = props[key];

      if (
        typeof a === "function"
        && typeof b === "function"
        && key[0] === "o"
        && key[1] === "n"
        && key.charCodeAt(2) >= 65
        && key.charCodeAt(2) <= 90
      ) {
        result[key] = chain(a, b);
      } else if (
        (key === "className" || key === "UNSAFE_className")
        && typeof a === "string"
        && typeof b === "string"
      ) {
        result[key] = `${a} ${b}`.trim();
      } else if (key === "class" && a && b) {
        result[key] = [a, b];
      } else if (key === "id" && a && b) {
        result[key] = mergeIds(a, b);
      } else if (
        (key === "style" || key === "UNSAFE_style")
        && a
        && b
        && typeof a === "object"
        && typeof b === "object"
      ) {
        result[key] = { ...a, ...b };
      } else if (key === "ref" && a && b) {
        result[key] = mergeRefs(a, b);
      } else {
        result[key] = b !== undefined ? b : a;
      }
    }
  }

  return result as UnionToIntersection<TupleTypes<T>>;
}
