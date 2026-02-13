import { useId as useSsrId } from "@vue-aria/ssr";
import { toValue, type MaybeRefOrGetter } from "vue";
import { useValueEffect } from "./useValueEffect";

export const idsUpdaterMap: Map<string, { current: string | null }[]> = new Map();

export function useId(defaultId?: MaybeRefOrGetter<string | undefined>): string {
  const id = useSsrId(toValue(defaultId));
  return id.value;
}

export function mergeIds(idA: string, idB: string): string {
  if (idA === idB) {
    return idA;
  }

  const setIdsA = idsUpdaterMap.get(idA);
  if (setIdsA) {
    setIdsA.forEach((ref) => {
      ref.current = idB;
    });
    return idB;
  }

  const setIdsB = idsUpdaterMap.get(idB);
  if (setIdsB) {
    setIdsB.forEach((ref) => {
      ref.current = idA;
    });
    return idA;
  }

  return idB;
}

export function useSlotId(depArray: ReadonlyArray<unknown> = []): string | undefined {
  const id = useId();
  const [resolvedId, setResolvedId] = useValueEffect<string | undefined>(id);

  const depsKey = JSON.stringify(depArray);
  setResolvedId(function *() {
    yield id;
    void depsKey;
    yield document.getElementById(id) ? id : undefined;
  });

  return resolvedId.value;
}
