export function chain(...callbacks: Array<((...args: any[]) => void) | null | undefined>) {
  return (...args: any[]) => {
    for (const callback of callbacks) {
      if (typeof callback === "function") {
        callback(...args);
      }
    }
  };
}
