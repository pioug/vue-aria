import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import type {
  DOMRefValue,
  FocusableRefValue,
} from "@vue-aria/types";
import {
  createDOMRef,
  createFocusableRef,
  unwrapDOMRef,
  useDOMRef,
  useFocusableRef,
  useUnwrapDOMRef,
} from "../src";

describe("DOM ref utilities", () => {
  it("createDOMRef exposes UNSAFE_getDOMNode", () => {
    const element = document.createElement("div");
    const elementRef = ref<HTMLDivElement | null>(element);
    const domRef = createDOMRef(elementRef);

    expect(domRef.UNSAFE_getDOMNode()).toBe(element);
  });

  it("createFocusableRef forwards focus calls", () => {
    const element = document.createElement("div");
    const focusTarget = {
      focus: vi.fn(),
    };

    const domRef = ref<HTMLDivElement | null>(element);
    const focusableRef = ref(focusTarget);
    const forwarded = createFocusableRef(domRef, focusableRef);

    forwarded.focus();

    expect(forwarded.UNSAFE_getDOMNode()).toBe(element);
    expect(focusTarget.focus).toHaveBeenCalledTimes(1);
  });

  it("useDOMRef wires and clears forwarded refs", () => {
    const forwardedRef = ref<DOMRefValue<HTMLDivElement> | null>(null);

    const App = defineComponent({
      setup() {
        const domRef = useDOMRef<HTMLDivElement>(forwardedRef);
        return () => h("div", { ref: domRef, "data-testid": "target" });
      },
    });

    const wrapper = mount(App);
    const element = wrapper.get('[data-testid="target"]').element as HTMLDivElement;

    expect(forwardedRef.value?.UNSAFE_getDOMNode()).toBe(element);

    wrapper.unmount();
    expect(forwardedRef.value).toBeNull();
  });

  it("useFocusableRef wires focus behavior", () => {
    const forwardedRef = ref<FocusableRefValue<HTMLDivElement> | null>(null);

    const App = defineComponent({
      setup() {
        const focusTargetRef = ref<HTMLButtonElement | null>(null);
        const domRef = useFocusableRef<HTMLDivElement>(forwardedRef, focusTargetRef);

        return () =>
          h("div", [
            h("button", { ref: focusTargetRef, "data-testid": "focus-target" }, "target"),
            h("div", { ref: domRef, "data-testid": "dom-target" }),
          ]);
      },
    });

    const wrapper = mount(App);
    const focusTarget = wrapper.get('[data-testid="focus-target"]').element as HTMLButtonElement;
    const focusSpy = vi.spyOn(focusTarget, "focus");

    forwardedRef.value?.focus();

    expect(focusSpy).toHaveBeenCalledTimes(1);
    expect(forwardedRef.value?.UNSAFE_getDOMNode()).toBe(
      wrapper.get('[data-testid="dom-target"]').element
    );
  });

  it("unwrapDOMRef and useUnwrapDOMRef expose underlying node refs", () => {
    const domNodeRef = ref<HTMLDivElement | null>(null);
    const forwardedRef = ref<DOMRefValue<HTMLDivElement> | null>(
      createDOMRef(domNodeRef)
    );

    const unwrapped = unwrapDOMRef(forwardedRef);
    const unwrappedViaHook = useUnwrapDOMRef(forwardedRef);

    expect(unwrapped.value).toBeNull();
    expect(unwrappedViaHook.value).toBeNull();

    const element = document.createElement("div");
    domNodeRef.value = element;

    expect(unwrapped.value).toBe(element);
    expect(unwrappedViaHook.value).toBe(element);
  });
});
