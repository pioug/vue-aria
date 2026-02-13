import { FocusScope } from "@vue-aria/focus";
import { ClearPressResponder } from "@vue-aria/interactions";
import { useIsSSR } from "@vue-aria/ssr";
import {
  Teleport,
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  inject,
  provide,
  ref,
  watchEffect,
  type PropType,
} from "vue";
import { useUNSAFE_PortalContext } from "./PortalProvider";

export interface OverlayProps {
  portalContainer?: Element | null;
  disableFocusManagement?: boolean;
  shouldContainFocus?: boolean;
  isExiting?: boolean;
}

interface OverlayContextValue {
  contain: { value: boolean };
  setContain: (value: boolean) => void;
}

const OverlayContext = Symbol("OverlayContext");

export const Overlay = defineComponent({
  name: "Overlay",
  props: {
    portalContainer: Object as PropType<Element | null | undefined>,
    disableFocusManagement: Boolean,
    shouldContainFocus: Boolean,
    isExiting: Boolean,
  },
  setup(props, { slots }) {
    const isSSR = useIsSSR();
    const contain = ref(false);
    const contextValue: OverlayContextValue = {
      contain,
      setContain: (value: boolean) => {
        contain.value = value;
      },
    };

    provide(OverlayContext, contextValue);

    const { getContainer } = useUNSAFE_PortalContext();
    const container = computed(() => {
      if (props.portalContainer) {
        return props.portalContainer;
      }
      if (getContainer) {
        return getContainer();
      }
      return isSSR ? null : document.body;
    });

    return () => {
      if (!container.value) {
        return null;
      }

      let content = slots.default?.() ?? [];

      if (!props.disableFocusManagement) {
        content = [
          h(
            FocusScope,
            {
              restoreFocus: true,
              contain: (props.shouldContainFocus || contain.value) && !props.isExiting,
            },
            { default: () => content }
          ),
        ];
      }

      return h(
        Teleport,
        { to: container.value },
        h(ClearPressResponder, null, { default: () => content })
      );
    };
  },
});

export function useOverlayFocusContain(): void {
  const ctx = inject<OverlayContextValue | null>(OverlayContext, null);
  if (!ctx) {
    return;
  }

  watchEffect(() => {
    ctx.setContain(true);
  });
}
