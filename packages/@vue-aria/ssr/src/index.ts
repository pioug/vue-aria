import { readonly, ref } from "vue";

let idCounter = 0;

export function useId(defaultId?: string, prefix = "vue-aria") {
  if (defaultId) {
    return readonly(ref(defaultId));
  }

  idCounter += 1;
  return readonly(ref(`${prefix}-${idCounter}`));
}
