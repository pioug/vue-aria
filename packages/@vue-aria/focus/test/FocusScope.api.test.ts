import { defineComponent, h, onMounted } from "vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import {
  FocusScope,
  isElementInChildOfActiveScope,
  useFocusManager,
  type FocusManager,
} from "../src/index";

describe("FocusScope API", () => {
  it("provides a focus manager via useFocusManager", async () => {
    let manager: FocusManager | undefined;

    const Probe = defineComponent({
      setup() {
        onMounted(() => {
          manager = useFocusManager();
        });
        return () => null;
      },
    });

    const wrapper = mount(FocusScope, {
      attachTo: document.body,
      slots: {
        default: () => [
          h("button", { id: "first" }, "First"),
          h("button", { id: "second" }, "Second"),
          h(Probe),
        ],
      },
    });

    expect(manager).toBeDefined();
    const first = wrapper.get("#first").element as HTMLButtonElement;

    manager?.focusFirst();
    expect(document.activeElement).toBe(first);
    wrapper.unmount();
  });

  it("tracks whether an element is in the active focus scope", () => {
    const wrapper = mount(FocusScope, {
      attachTo: document.body,
      slots: {
        default: () => [h("button", { id: "inside" }, "Inside")],
      },
    });

    const inside = wrapper.get("#inside").element as Element;
    const outside = document.createElement("button");

    expect(isElementInChildOfActiveScope(inside)).toBe(true);
    expect(isElementInChildOfActiveScope(outside)).toBe(false);
    wrapper.unmount();
  });
});
