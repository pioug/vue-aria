export function isSetEqual<T>(left: Set<T>, right: Set<T>): boolean {
  if (left === right) {
    return true;
  }

  if (left.size !== right.size) {
    return false;
  }

  for (const value of left) {
    if (!right.has(value)) {
      return false;
    }
  }

  return true;
}
