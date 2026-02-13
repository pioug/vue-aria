export { focusSafely } from "./focusSafely";
export {
  isFocusVisible,
  getInteractionModality,
  setInteractionModality,
  getPointerType,
  addWindowFocusTracking,
  useInteractionModality,
  useFocusVisible,
  useFocusVisibleListener,
  changeHandlers,
  hasSetupGlobalListeners,
} from "./useFocusVisible";

export type {
  Modality,
  PointerType,
  FocusVisibleHandler,
  FocusVisibleProps,
  FocusVisibleResult,
} from "./useFocusVisible";
