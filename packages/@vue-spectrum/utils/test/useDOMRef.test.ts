import { createApp, defineComponent, h, nextTick, ref, type PropType, type Ref } from "vue";
import { afterEach, describe, expect, it } from "vitest";
import {
  createDOMRef,
  createFocusableRef,
  type DOMRefValue,
  type FocusableRefValue,
  unwrapDOMRef,
  useDOMRef,
  useFocusableRef,
  useUnwrapDOMRef,
} from "../src/useDOMRef";

function mount(component: unknown) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const app = createApp(component as Parameters<typeof createApp>[0]);
  app.mount(container);
  return {
    container,
    unmount() {
      app.unmount();
      container.remove();
    },
  };
}

describe("useDOMRef", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("creates a DOM ref wrapper", () => {
    const element = document.createElement("div");
    const elementRef = ref<HTMLElement | null>(element);
    const domRef = createDOMRef(elementRef);

    expect(domRef.UNSAFE_getDOMNode()).toBe(element);
  });

  it("creates a focusable ref wrapper", () => {
    const element = document.createElement("button");
    document.body.appendChild(element);
    const domRef = ref<HTMLElement | null>(element);
    const focusableRef = createFocusableRef(domRef);

    focusableRef.focus();
    expect(document.activeElement).toBe(element);
    element.remove();
  });

  it("binds and clears forwarded DOM refs in components", async () => {
    const forwardedRef = ref<DOMRefValue<HTMLDivElement> | null>(null);
    const Probe = defineComponent({
      props: {
        forwardedRef: {
          type: Object as PropType<Ref<DOMRefValue<HTMLDivElement> | null>>,
          required: true,
        },
      },
      setup(props) {
        const domRef = useDOMRef<HTMLDivElement>(props.forwardedRef);
        return () => h("div", { ref: domRef, "data-testid": "probe" });
      },
    });

    const { container, unmount } = mount(() => h(Probe, { forwardedRef }));
    await nextTick();

    const node = container.querySelector('[data-testid="probe"]') as HTMLDivElement | null;
    expect(forwardedRef.value?.UNSAFE_getDOMNode()).toBe(node);

    unmount();
    await nextTick();
    expect(forwardedRef.value).toBe(null);
  });

  it("binds focusable refs and unwraps DOM refs", async () => {
    const forwardedRef = ref<FocusableRefValue<HTMLDivElement> | null>(null);
    const Probe = defineComponent({
      props: {
        forwardedRef: {
          type: Object as PropType<Ref<FocusableRefValue<HTMLDivElement> | null>>,
          required: true,
        },
      },
      setup(props) {
        const focusRef = ref<HTMLButtonElement | null>(null);
        const domRef = useFocusableRef<HTMLDivElement>(props.forwardedRef, focusRef);
        return () =>
          h("div", { ref: domRef }, [h("button", { ref: focusRef, "data-testid": "focus-target" }, "focus")]);
      },
    });

    const { container, unmount } = mount(() => h(Probe, { forwardedRef }));
    await nextTick();

    forwardedRef.value?.focus();
    const target = container.querySelector('[data-testid="focus-target"]') as HTMLButtonElement | null;
    expect(document.activeElement).toBe(target);

    const unwrapped = unwrapDOMRef(forwardedRef as Ref<DOMRefValue<HTMLDivElement> | null>);
    expect(unwrapped.value).not.toBeNull();
    const viaComposable = useUnwrapDOMRef(forwardedRef as Ref<DOMRefValue<HTMLDivElement> | null>);
    expect(viaComposable.value).toBe(unwrapped.value);

    unmount();
  });
});
