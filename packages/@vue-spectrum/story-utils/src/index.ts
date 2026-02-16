export const ErrorBoundary = (props: unknown) => props;
export const generatePowerset = <T,>(items: readonly T[]): T[][] =>
  items.reduce<T[][]>((acc, item, index) => {
    const rest = acc.slice();
    for (let i = 0, len = acc.length; i < len; i += 1) {
      rest.push([...acc[i], item]);
    }
    return rest;
  }, [[]] as T[][]);
