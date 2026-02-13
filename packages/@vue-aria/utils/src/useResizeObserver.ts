import { onScopeDispose, watch, type Ref } from "vue";

function hasResizeObserver(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.ResizeObserver !== "undefined"
  );
}

export interface UseResizeObserverOptions<T extends Element> {
  ref: Ref<T | undefined | null> | undefined;
  box?: ResizeObserverBoxOptions;
  onResize: () => void;
}

export function useResizeObserver<T extends Element>(
  options: UseResizeObserverOptions<T>
): void {
  let cleanup: (() => void) | null = null;

  const disconnect = (): void => {
    cleanup?.();
    cleanup = null;
  };

  watch(
    [() => options.ref?.value, () => options.box],
    ([element, box]) => {
      disconnect();
      if (!element || typeof window === "undefined") {
        return;
      }

      if (!hasResizeObserver()) {
        const onResize = (): void => {
          options.onResize();
        };
        window.addEventListener("resize", onResize, false);
        cleanup = () => {
          window.removeEventListener("resize", onResize, false);
        };
        return;
      }

      const resizeObserver = new window.ResizeObserver((entries) => {
        if (entries.length === 0) {
          return;
        }

        options.onResize();
      });
      resizeObserver.observe(element, { box });

      cleanup = () => {
        resizeObserver.unobserve(element);
      };
    },
    { immediate: true }
  );

  onScopeDispose(() => {
    disconnect();
  });
}
