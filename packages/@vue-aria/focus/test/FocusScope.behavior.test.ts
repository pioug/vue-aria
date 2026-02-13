import { mount } from "@vue/test-utils";
import { disableShadowDOM, enableShadowDOM } from "@vue-aria/flags";
import { Teleport, defineComponent, h, nextTick, onMounted, ref } from "vue";
import { describe, expect, it } from "vitest";
import { FocusScope, useFocusManager, type FocusManager } from "../src";

describe("FocusScope behavior", () => {
  it("auto focuses the first focusable element when autoFocus is enabled", () => {
    const wrapper = mount(FocusScope, {
      attachTo: document.body,
      props: { autoFocus: true },
      slots: {
        default: () => [
          h("div"),
          h("button", { id: "first" }, "First"),
          h("button", { id: "second" }, "Second"),
        ],
      },
    });

    expect(document.activeElement).toBe(wrapper.get("#first").element);
    wrapper.unmount();
  });

  it("auto focuses the first tabbable element when autoFocus is enabled", () => {
    const wrapper = mount(FocusScope, {
      attachTo: document.body,
      props: { autoFocus: true },
      slots: {
        default: () => [
          h("div", { id: "focusable-only", tabIndex: -1 }),
          h("input", { id: "first-tabbable" }),
          h("input", { id: "second-tabbable" }),
        ],
      },
    });

    expect(document.activeElement).toBe(wrapper.get("#first-tabbable").element);
    wrapper.unmount();
  });

  it("restores focus to the previously focused element when unmounted with restoreFocus", () => {
    const outside = document.createElement("button");
    outside.id = "outside-focus";
    document.body.appendChild(outside);
    outside.focus();

    const wrapper = mount(FocusScope, {
      attachTo: document.body,
      props: { autoFocus: true, restoreFocus: true },
      slots: {
        default: () => [h("button", { id: "inside-focus" }, "Inside")],
      },
    });

    expect(document.activeElement).toBe(wrapper.get("#inside-focus").element);
    wrapper.unmount();
    expect(document.activeElement).toBe(outside);
    outside.remove();
  });

  it("restores focus when unmounted after a child receives autofocus", () => {
    const outside = document.createElement("button");
    outside.id = "outside-focus";
    document.body.appendChild(outside);
    outside.focus();

    const FocusInside = defineComponent({
      setup() {
        onMounted(() => {
          const autofocusTarget = document.getElementById("autofocused");
          if (autofocusTarget instanceof HTMLElement) {
            autofocusTarget.focus();
          }
        });
        return () => null;
      },
    });

    const wrapper = mount(FocusScope, {
      attachTo: document.body,
      props: { restoreFocus: true },
      slots: {
        default: () => [
          h("input", { id: "first" }),
          h("input", { id: "autofocused" }),
          h("input", { id: "third" }),
          h(FocusInside),
        ],
      },
    });

    expect(document.activeElement).toBe(wrapper.get("#autofocused").element);

    wrapper.unmount();
    expect(document.activeElement).toBe(outside);
    outside.remove();
  });

  it("allows restore focus to be prevented via restore event", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    container.addEventListener("react-aria-focus-scope-restore", (event) => {
      event.preventDefault();
    });

    const outside = document.createElement("button");
    outside.id = "outside-focus";
    container.appendChild(outside);
    outside.focus();

    const wrapper = mount(FocusScope, {
      attachTo: container,
      props: { autoFocus: true, restoreFocus: true },
      slots: {
        default: () => [h("input", { id: "inside-focus" })],
      },
    });

    expect(document.activeElement).toBe(wrapper.get("#inside-focus").element);
    wrapper.unmount();
    expect(document.activeElement).not.toBe(outside);
    container.remove();
  });

  it("supports focus manager next/previous traversal with wrap", () => {
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

    const first = wrapper.get("#first").element as HTMLButtonElement;
    const second = wrapper.get("#second").element as HTMLButtonElement;

    manager?.focusFirst();
    expect(document.activeElement).toBe(first);

    manager?.focusNext();
    expect(document.activeElement).toBe(second);

    manager?.focusNext({ wrap: true });
    expect(document.activeElement).toBe(first);

    manager?.focusPrevious({ wrap: true });
    expect(document.activeElement).toBe(second);
    wrapper.unmount();
  });

  it("supports focus manager focusLast traversal", () => {
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

    manager?.focusLast();
    expect(document.activeElement).toBe(wrapper.get("#second").element);
    wrapper.unmount();
  });

  it("respects accept filter in focus manager traversal", () => {
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
          h("button", { id: "first", "data-accept": "no" }, "First"),
          h("button", { id: "second", "data-accept": "yes" }, "Second"),
          h(Probe),
        ],
      },
    });

    manager?.focusFirst({
      accept: (node) => (node as HTMLElement).dataset.accept === "yes",
    });
    expect(document.activeElement).toBe(wrapper.get("#second").element);
    wrapper.unmount();
  });

  it("contains tab focus within the scope when contain is enabled", async () => {
    const wrapper = mount(FocusScope, {
      attachTo: document.body,
      props: { contain: true },
      slots: {
        default: () => [
          h("input", { id: "input1" }),
          h("input", { id: "input2" }),
          h("input", { id: "input3" }),
        ],
      },
    });

    const input1 = wrapper.get("#input1").element as HTMLInputElement;
    const input2 = wrapper.get("#input2").element as HTMLInputElement;
    const input3 = wrapper.get("#input3").element as HTMLInputElement;

    input1.focus();
    expect(document.activeElement).toBe(input1);

    const tabFromActive = (shiftKey = false) => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) {
        return;
      }
      active.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey,
          bubbles: true,
          cancelable: true,
        })
      );
    };

    tabFromActive(false);
    expect(document.activeElement).toBe(input2);
    tabFromActive(false);
    expect(document.activeElement).toBe(input3);
    tabFromActive(false);
    expect(document.activeElement).toBe(input1);

    tabFromActive(true);
    expect(document.activeElement).toBe(input3);
    tabFromActive(true);
    expect(document.activeElement).toBe(input2);

    wrapper.unmount();
  });

  it("contains tab focus for nested descendants when contain is enabled", () => {
    const wrapper = mount(FocusScope, {
      attachTo: document.body,
      props: { contain: true },
      slots: {
        default: () => [
          h("input", { id: "input1" }),
          h("div", [h("input", { id: "input2" }), h("div", [h("input", { id: "input3" })])]),
        ],
      },
    });

    const input1 = wrapper.get("#input1").element as HTMLInputElement;
    const input2 = wrapper.get("#input2").element as HTMLInputElement;
    const input3 = wrapper.get("#input3").element as HTMLInputElement;

    const tabFromActive = (shiftKey = false) => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) {
        return;
      }

      active.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey,
          bubbles: true,
          cancelable: true,
        })
      );
    };

    input1.focus();
    expect(document.activeElement).toBe(input1);

    tabFromActive(false);
    expect(document.activeElement).toBe(input2);
    tabFromActive(false);
    expect(document.activeElement).toBe(input3);
    tabFromActive(false);
    expect(document.activeElement).toBe(input1);

    tabFromActive(true);
    expect(document.activeElement).toBe(input3);
    tabFromActive(true);
    expect(document.activeElement).toBe(input2);
    tabFromActive(true);
    expect(document.activeElement).toBe(input1);

    wrapper.unmount();
  });

  it("skips non-tabbable content while containing focus", () => {
    const wrapper = mount(FocusScope, {
      attachTo: document.body,
      props: { contain: true },
      slots: {
        default: () => [
          h("input", { id: "input1" }),
          h("div"),
          h("input", { id: "input2" }),
          h("input", { hidden: true }),
          h("input", { style: { display: "none" } }),
          h("input", { style: { visibility: "hidden" } }),
          h("div", { tabIndex: -1 }),
          h("input", { disabled: true, tabIndex: 0 }),
          h("input", { id: "input3" }),
        ],
      },
    });

    const input1 = wrapper.get("#input1").element as HTMLInputElement;
    const input2 = wrapper.get("#input2").element as HTMLInputElement;
    const input3 = wrapper.get("#input3").element as HTMLInputElement;

    const tabFromActive = (shiftKey = false) => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) {
        return;
      }

      active.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey,
          bubbles: true,
          cancelable: true,
        })
      );
    };

    input1.focus();
    expect(document.activeElement).toBe(input1);

    tabFromActive(false);
    expect(document.activeElement).toBe(input2);
    tabFromActive(false);
    expect(document.activeElement).toBe(input3);
    tabFromActive(false);
    expect(document.activeElement).toBe(input1);

    tabFromActive(true);
    expect(document.activeElement).toBe(input3);
    tabFromActive(true);
    expect(document.activeElement).toBe(input2);
    tabFromActive(true);
    expect(document.activeElement).toBe(input1);

    wrapper.unmount();
  });

  it("only includes contenteditable elements that are tabbable while containing focus", () => {
    const wrapper = mount(FocusScope, {
      attachTo: document.body,
      props: { contain: true },
      slots: {
        default: () => [
          h("input", { id: "input1" }),
          h("span", { id: "editable", contenteditable: "true" }),
          h("span", { contenteditable: "false" }),
          h("span", { contenteditable: false }),
          h("span", { id: "plaintext", contenteditable: "plaintext-only" }),
          h("input", { id: "input4" }),
        ],
      },
    });

    const input1 = wrapper.get("#input1").element as HTMLInputElement;
    const editable = wrapper.get("#editable").element as HTMLElement;
    const plaintext = wrapper.get("#plaintext").element as HTMLElement;
    const input4 = wrapper.get("#input4").element as HTMLInputElement;

    const tabFromActive = (shiftKey = false) => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) {
        return;
      }

      active.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey,
          bubbles: true,
          cancelable: true,
        })
      );
    };

    input1.focus();
    expect(document.activeElement).toBe(input1);

    tabFromActive(false);
    expect(document.activeElement).toBe(editable);
    tabFromActive(false);
    expect(document.activeElement).toBe(plaintext);
    tabFromActive(false);
    expect(document.activeElement).toBe(input4);

    tabFromActive(true);
    expect(document.activeElement).toBe(plaintext);
    tabFromActive(true);
    expect(document.activeElement).toBe(editable);
    tabFromActive(true);
    expect(document.activeElement).toBe(input1);

    wrapper.unmount();
  });

  it("skips non-selected radios in the same group during containment tab traversal", () => {
    const wrapper = mount(FocusScope, {
      attachTo: document.body,
      props: { contain: true },
      slots: {
        default: () => [
          h("button", { id: "button1" }, "button"),
          h("form", [
            h("fieldset", [
              h("legend", "Select a drone"),
              h("div", [
                h("input", { id: "huey", type: "radio", name: "drone", checked: true }),
                h("label", { for: "huey" }, "Huey"),
              ]),
              h("div", [
                h("input", { id: "dewey", type: "radio", name: "drone" }),
                h("label", { for: "dewey" }, "Dewey"),
              ]),
              h("div", [
                h("input", { id: "louie", type: "radio", name: "drone" }),
                h("label", { for: "louie" }, "Louie"),
              ]),
            ]),
          ]),
          h("button", { id: "button2" }, "button"),
        ],
      },
    });

    const button1 = wrapper.get("#button1").element as HTMLButtonElement;
    const selectedRadio = wrapper.get("#huey").element as HTMLInputElement;
    const button2 = wrapper.get("#button2").element as HTMLButtonElement;

    const tabFromActive = (shiftKey = false) => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) {
        return;
      }

      active.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey,
          bubbles: true,
          cancelable: true,
        })
      );
    };

    button1.focus();
    expect(document.activeElement).toBe(button1);

    tabFromActive(false);
    expect(document.activeElement).toBe(selectedRadio);
    tabFromActive(false);
    expect(document.activeElement).toBe(button2);

    tabFromActive(true);
    expect(document.activeElement).toBe(selectedRadio);
    tabFromActive(true);
    expect(document.activeElement).toBe(button1);

    wrapper.unmount();
  });

  it("handles forms with a single radio in containment traversal without crashing", () => {
    const wrapper = mount(FocusScope, {
      attachTo: document.body,
      props: { contain: true },
      slots: {
        default: () => [
          h("button", { id: "button1" }, "First button"),
          h("form", [
            h("input", { id: "only", type: "radio", name: "option" }),
            h("label", { for: "only" }, "Only option"),
          ]),
          h("button", { id: "button2" }, "Second button"),
        ],
      },
    });

    const button1 = wrapper.get("#button1").element as HTMLButtonElement;
    const radio = wrapper.get("#only").element as HTMLInputElement;
    const button2 = wrapper.get("#button2").element as HTMLButtonElement;

    const tabFromActive = (shiftKey = false) => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) {
        return;
      }

      active.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey,
          bubbles: true,
          cancelable: true,
        })
      );
    };

    button1.focus();
    expect(document.activeElement).toBe(button1);

    expect(() => tabFromActive(false)).not.toThrow();
    expect(document.activeElement).toBe(radio);

    expect(() => tabFromActive(false)).not.toThrow();
    expect(document.activeElement).toBe(button2);

    wrapper.unmount();
  });

  it("moves backward through unchecked radio groups and surrounding controls", () => {
    const wrapper = mount(FocusScope, {
      attachTo: document.body,
      props: { contain: true },
      slots: {
        default: () => [
          h("button", { id: "button1" }, "button"),
          h("fieldset", [
            h("legend", "Select a ship"),
            h("div", [
              h("input", { id: "larry", type: "radio", name: "ship" }),
              h("label", { for: "larry" }, "Larry"),
            ]),
            h("div", [
              h("input", { id: "moe", type: "radio", name: "ship" }),
              h("label", { for: "moe" }, "Moe"),
            ]),
            h("button", { id: "button2" }, "button"),
            h("div", [
              h("input", { id: "curly", type: "radio", name: "ship" }),
              h("label", { for: "curly" }, "Curly"),
            ]),
          ]),
          h("button", { id: "button3" }, "button"),
        ],
      },
    });

    const button1 = wrapper.get("#button1").element as HTMLButtonElement;
    const larry = wrapper.get("#larry").element as HTMLInputElement;
    const moe = wrapper.get("#moe").element as HTMLInputElement;
    const button2 = wrapper.get("#button2").element as HTMLButtonElement;
    const curly = wrapper.get("#curly").element as HTMLInputElement;
    const button3 = wrapper.get("#button3").element as HTMLButtonElement;

    const tabFromActive = (shiftKey = false) => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) {
        return;
      }

      active.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey,
          bubbles: true,
          cancelable: true,
        })
      );
    };

    button3.focus();
    expect(document.activeElement).toBe(button3);

    tabFromActive(true);
    expect(document.activeElement).toBe(curly);
    tabFromActive(true);
    expect(document.activeElement).toBe(button2);
    tabFromActive(true);
    expect(document.activeElement).toBe(moe);
    tabFromActive(true);
    expect(document.activeElement).toBe(larry);
    tabFromActive(true);
    expect(document.activeElement).toBe(button1);

    wrapper.unmount();
  });

  it("skips non-selected radios outside forms during forward containment traversal", () => {
    const wrapper = mount(FocusScope, {
      attachTo: document.body,
      props: { contain: true },
      slots: {
        default: () => [
          h("button", { id: "button1" }, "button"),
          h("fieldset", [
            h("legend", "Select a drone"),
            h("div", [
              h("input", { id: "huey", type: "radio", name: "drone", checked: true }),
              h("label", { for: "huey" }, "Huey"),
            ]),
            h("div", [
              h("input", { id: "dewey", type: "radio", name: "drone" }),
              h("label", { for: "dewey" }, "Dewey"),
            ]),
            h("button", { id: "button2" }, "button"),
            h("div", [
              h("input", { id: "louie", type: "radio", name: "drone" }),
              h("label", { for: "louie" }, "Louie"),
            ]),
          ]),
          h("fieldset", [
            h("legend", "Select a ship"),
            h("div", [
              h("input", { id: "larry", type: "radio", name: "ship", checked: true }),
              h("label", { for: "larry" }, "Larry"),
            ]),
            h("div", [
              h("input", { id: "moe", type: "radio", name: "ship" }),
              h("label", { for: "moe" }, "Moe"),
            ]),
            h("button", { id: "button3" }, "button"),
            h("div", [
              h("input", { id: "curly", type: "radio", name: "ship" }),
              h("label", { for: "curly" }, "Curly"),
            ]),
          ]),
          h("button", { id: "button4" }, "button"),
        ],
      },
    });

    const button1 = wrapper.get("#button1").element as HTMLButtonElement;
    const button2 = wrapper.get("#button2").element as HTMLButtonElement;
    const button3 = wrapper.get("#button3").element as HTMLButtonElement;
    const button4 = wrapper.get("#button4").element as HTMLButtonElement;
    const huey = wrapper.get("#huey").element as HTMLInputElement;
    const larry = wrapper.get("#larry").element as HTMLInputElement;

    const tabFromActive = (shiftKey = false) => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) {
        return;
      }

      active.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey,
          bubbles: true,
          cancelable: true,
        })
      );
    };

    button1.focus();
    expect(document.activeElement).toBe(button1);

    tabFromActive(false);
    expect(document.activeElement).toBe(huey);
    tabFromActive(false);
    expect(document.activeElement).toBe(button2);
    tabFromActive(false);
    expect(document.activeElement).toBe(larry);
    tabFromActive(false);
    expect(document.activeElement).toBe(button3);
    tabFromActive(false);
    expect(document.activeElement).toBe(button4);

    wrapper.unmount();
  });

  it("skips non-selected radios outside forms during backward containment traversal", () => {
    const wrapper = mount(FocusScope, {
      attachTo: document.body,
      props: { contain: true },
      slots: {
        default: () => [
          h("button", { id: "button1" }, "button"),
          h("fieldset", [
            h("legend", "Select a drone"),
            h("div", [
              h("input", { id: "huey", type: "radio", name: "drone", checked: true }),
              h("label", { for: "huey" }, "Huey"),
            ]),
            h("div", [
              h("input", { id: "dewey", type: "radio", name: "drone" }),
              h("label", { for: "dewey" }, "Dewey"),
            ]),
            h("button", { id: "button2" }, "button"),
            h("div", [
              h("input", { id: "louie", type: "radio", name: "drone" }),
              h("label", { for: "louie" }, "Louie"),
            ]),
          ]),
          h("fieldset", [
            h("legend", "Select a ship"),
            h("div", [
              h("input", { id: "larry", type: "radio", name: "ship", checked: true }),
              h("label", { for: "larry" }, "Larry"),
            ]),
            h("div", [
              h("input", { id: "moe", type: "radio", name: "ship" }),
              h("label", { for: "moe" }, "Moe"),
            ]),
            h("button", { id: "button3" }, "button"),
            h("div", [
              h("input", { id: "curly", type: "radio", name: "ship" }),
              h("label", { for: "curly" }, "Curly"),
            ]),
          ]),
          h("button", { id: "button4" }, "button"),
        ],
      },
    });

    const button1 = wrapper.get("#button1").element as HTMLButtonElement;
    const button2 = wrapper.get("#button2").element as HTMLButtonElement;
    const button3 = wrapper.get("#button3").element as HTMLButtonElement;
    const button4 = wrapper.get("#button4").element as HTMLButtonElement;
    const huey = wrapper.get("#huey").element as HTMLInputElement;
    const larry = wrapper.get("#larry").element as HTMLInputElement;

    const tabFromActive = (shiftKey = false) => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) {
        return;
      }

      active.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey,
          bubbles: true,
          cancelable: true,
        })
      );
    };

    button4.focus();
    expect(document.activeElement).toBe(button4);

    tabFromActive(true);
    expect(document.activeElement).toBe(button3);
    tabFromActive(true);
    expect(document.activeElement).toBe(larry);
    tabFromActive(true);
    expect(document.activeElement).toBe(button2);
    tabFromActive(true);
    expect(document.activeElement).toBe(huey);
    tabFromActive(true);
    expect(document.activeElement).toBe(button1);

    wrapper.unmount();
  });

  it("keeps focus in the active scope when another contain scope receives focus", () => {
    const wrapper = mount(defineComponent({
      components: { FocusScope },
      render() {
        return h("div", [
          h(
            FocusScope,
            { contain: true },
            {
              default: () => [
                h("input", { id: "input1" }),
                h("input", { id: "input2" }),
                h("input", { id: "input3" }),
              ],
            }
          ),
          h(
            FocusScope,
            { contain: true },
            {
              default: () => [
                h("input", { id: "input4" }),
                h("input", { id: "input5" }),
              ],
            }
          ),
        ]);
      },
    }), {
      attachTo: document.body,
    });

    const input1 = wrapper.get("#input1").element as HTMLInputElement;
    const input4 = wrapper.get("#input4").element as HTMLInputElement;

    input1.focus();
    expect(document.activeElement).toBe(input1);

    input4.focus();
    expect(document.activeElement).toBe(input1);

    wrapper.unmount();
  });

  it("locks tab containment to the active child scope when nested scopes are present", () => {
    const wrapper = mount(defineComponent({
      render() {
        return h("div", [
          h(
            FocusScope,
            { contain: true },
            {
              default: () => [
                h("input", { id: "parent1" }),
                h("input", { id: "parent2" }),
                h("input", { id: "parent3" }),
                h(
                  FocusScope,
                  { contain: true },
                  {
                    default: () => [
                      h("input", { id: "child1" }),
                      h("input", { id: "child2" }),
                      h("input", { id: "child3" }),
                    ],
                  }
                ),
              ],
            }
          ),
        ]);
      },
    }), {
      attachTo: document.body,
    });

    const child1 = wrapper.get("#child1").element as HTMLInputElement;
    const child2 = wrapper.get("#child2").element as HTMLInputElement;
    const child3 = wrapper.get("#child3").element as HTMLInputElement;

    const tabFromActive = (shiftKey = false) => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) {
        return;
      }

      active.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey,
          bubbles: true,
          cancelable: true,
        })
      );
    };

    child1.focus();
    expect(document.activeElement).toBe(child1);

    tabFromActive(false);
    expect(document.activeElement).toBe(child2);
    tabFromActive(false);
    expect(document.activeElement).toBe(child3);
    tabFromActive(false);
    expect(document.activeElement).toBe(child1);

    tabFromActive(true);
    expect(document.activeElement).toBe(child3);

    wrapper.unmount();
  });

  it("does not lock tab navigation inside a nested scope without contain", () => {
    const wrapper = mount(defineComponent({
      render() {
        return h("div", [
          h("input", { id: "outside" }),
          h(
            FocusScope,
            { autoFocus: true, restoreFocus: true, contain: true },
            {
              default: () => [
                h("input", { id: "parent" }),
                h("div", [
                  h("div", [
                    h(
                      FocusScope,
                      {},
                      {
                        default: () => [
                          h("input", { id: "child1" }),
                          h("input", { id: "child2" }),
                          h("input", { id: "child3" }),
                        ],
                      }
                    ),
                  ]),
                ]),
              ],
            }
          ),
        ]);
      },
    }), {
      attachTo: document.body,
    });

    const parent = wrapper.get("#parent").element as HTMLInputElement;
    const child1 = wrapper.get("#child1").element as HTMLInputElement;
    const child2 = wrapper.get("#child2").element as HTMLInputElement;
    const child3 = wrapper.get("#child3").element as HTMLInputElement;

    const tabOrder = [parent, child1, child2, child3];
    const tabFromActive = (shiftKey = false) => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) {
        return;
      }

      const handled = active.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey,
          bubbles: true,
          cancelable: true,
        })
      );
      if (!handled) {
        return;
      }

      const index = tabOrder.findIndex((element) => element === active);
      if (index < 0) {
        return;
      }

      const nextIndex = shiftKey
        ? (index - 1 + tabOrder.length) % tabOrder.length
        : (index + 1) % tabOrder.length;
      tabOrder[nextIndex]?.focus();
    };

    expect(document.activeElement).toBe(parent);
    tabFromActive(false);
    expect(document.activeElement).toBe(child1);
    tabFromActive(false);
    expect(document.activeElement).toBe(child2);
    tabFromActive(false);
    expect(document.activeElement).toBe(child3);
    tabFromActive(false);
    expect(document.activeElement).toBe(parent);
    tabFromActive(true);
    expect(document.activeElement).toBe(child3);

    wrapper.unmount();
  });

  it("does not lock tab navigation inside a nested scope with restoreFocus and without contain", () => {
    const wrapper = mount(defineComponent({
      render() {
        return h("div", [
          h("input", { id: "outside" }),
          h(
            FocusScope,
            { autoFocus: true, restoreFocus: true, contain: true },
            {
              default: () => [
                h("input", { id: "parent" }),
                h("div", [
                  h("div", [
                    h(
                      FocusScope,
                      { restoreFocus: true },
                      {
                        default: () => [
                          h("input", { id: "child1" }),
                          h("input", { id: "child2" }),
                          h("input", { id: "child3" }),
                        ],
                      }
                    ),
                  ]),
                ]),
              ],
            }
          ),
        ]);
      },
    }), {
      attachTo: document.body,
    });

    const parent = wrapper.get("#parent").element as HTMLInputElement;
    const child1 = wrapper.get("#child1").element as HTMLInputElement;
    const child2 = wrapper.get("#child2").element as HTMLInputElement;
    const child3 = wrapper.get("#child3").element as HTMLInputElement;

    const tabOrder = [parent, child1, child2, child3];
    const tabFromActive = (shiftKey = false) => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) {
        return;
      }

      const handled = active.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey,
          bubbles: true,
          cancelable: true,
        })
      );
      if (!handled) {
        return;
      }

      const index = tabOrder.findIndex((element) => element === active);
      if (index < 0) {
        return;
      }

      const nextIndex = shiftKey
        ? (index - 1 + tabOrder.length) % tabOrder.length
        : (index + 1) % tabOrder.length;
      tabOrder[nextIndex]?.focus();
    };

    expect(document.activeElement).toBe(parent);
    tabFromActive(false);
    expect(document.activeElement).toBe(child1);
    tabFromActive(false);
    expect(document.activeElement).toBe(child2);
    tabFromActive(false);
    expect(document.activeElement).toBe(child3);
    tabFromActive(false);
    expect(document.activeElement).toBe(parent);
    tabFromActive(true);
    expect(document.activeElement).toBe(child3);

    wrapper.unmount();
  });

  it("restores to the correct nested scope when contained child scopes unmount", async () => {
    const Host = defineComponent({
      props: {
        show1: Boolean,
        show2: Boolean,
        show3: Boolean,
      },
      setup(props) {
        return () =>
          h("div", [
            h("input", { id: "outside" }),
            h(
              FocusScope,
              { autoFocus: true, restoreFocus: true, contain: true },
              {
                default: () => [
                  h("input", { id: "parent" }),
                  props.show1
                    ? h(
                      FocusScope,
                      { contain: true },
                      {
                        default: () => [
                          h("input", { id: "child1" }),
                          props.show2
                            ? h(
                              FocusScope,
                              { contain: true },
                              {
                                default: () => [
                                  h("input", { id: "child2" }),
                                  props.show3
                                    ? h(
                                      FocusScope,
                                      { contain: true },
                                      {
                                        default: () => [h("input", { id: "child3" })],
                                      }
                                    )
                                    : null,
                                ],
                              }
                            )
                            : null,
                        ],
                      }
                    )
                    : null,
                ],
              }
            ),
          ]);
      },
    });

    const wrapper = mount(Host, {
      attachTo: document.body,
      props: {
        show1: false,
        show2: false,
        show3: false,
      },
    });

    const tabFromActive = (shiftKey = false) => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) {
        return;
      }

      active.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey,
          bubbles: true,
          cancelable: true,
        })
      );
    };

    const byId = (id: string) => document.getElementById(id) as HTMLInputElement;

    expect(document.activeElement).toBe(byId("parent"));

    await wrapper.setProps({ show1: true });
    expect(document.activeElement).toBe(byId("parent"));

    tabFromActive(false);
    expect(document.activeElement).toBe(byId("child1"));

    byId("parent").focus();
    expect(document.activeElement).toBe(byId("child1"));

    await wrapper.setProps({ show1: true, show2: true });
    expect(document.activeElement).toBe(byId("child1"));
    tabFromActive(false);
    expect(document.activeElement).toBe(byId("child2"));

    byId("child1").focus();
    expect(document.activeElement).toBe(byId("child2"));

    byId("parent").focus();
    expect(document.activeElement).toBe(byId("child2"));

    await wrapper.setProps({ show1: true, show2: true, show3: true });
    tabFromActive(false);
    expect(document.activeElement).toBe(byId("child3"));

    await wrapper.setProps({ show1: true, show2: false, show3: false });

    byId("child1").focus();
    expect(document.activeElement).toBe(byId("child1"));

    byId("parent").focus();
    expect(document.activeElement).toBe(byId("child1"));

    wrapper.unmount();
  });

  it("navigates in DOM order when scope focus starts on an in-scope element", () => {
    const wrapper = mount(defineComponent({
      render() {
        return h("div", [
          h("input", { id: "beforeScope" }),
          h(
            FocusScope,
            {},
            {
              default: () => [h("input", { id: "inScope" })],
            }
          ),
          h("input", { id: "afterScope" }),
        ]);
      },
    }), {
      attachTo: document.body,
    });

    const beforeScope = document.getElementById("beforeScope") as HTMLInputElement;
    const inScope = document.getElementById("inScope") as HTMLInputElement;
    const afterScope = document.getElementById("afterScope") as HTMLInputElement;

    const tabOrder = [beforeScope, inScope, afterScope];
    const tabFromActive = (shiftKey = false) => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) {
        return;
      }

      const handled = active.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey,
          bubbles: true,
          cancelable: true,
        })
      );
      if (!handled) {
        return;
      }

      const index = tabOrder.findIndex((element) => element === active);
      if (index < 0) {
        return;
      }

      const nextIndex = shiftKey
        ? Math.max(index - 1, 0)
        : Math.min(index + 1, tabOrder.length - 1);
      tabOrder[nextIndex]?.focus();
    };

    inScope.focus();
    tabFromActive(false);
    expect(document.activeElement).toBe(afterScope);

    inScope.focus();
    tabFromActive(true);
    expect(document.activeElement).toBe(beforeScope);

    wrapper.unmount();
  });

  it("contains focus within a shadow-dom focus scope", () => {
    enableShadowDOM();

    const host = document.createElement("div");
    document.body.appendChild(host);
    const shadowRoot = host.attachShadow({ mode: "open" });

    const wrapper = mount(defineComponent({
      render() {
        return h(
          Teleport,
          { to: shadowRoot },
          h(
            FocusScope,
            { contain: true },
            {
              default: () => [
                h("input", { id: "input1" }),
                h("input", { id: "input2" }),
                h("input", { id: "input3" }),
              ],
            }
          )
        );
      },
    }), {
      attachTo: document.body,
    });

    try {
      const input1 = shadowRoot.querySelector("#input1") as HTMLInputElement;
      const input2 = shadowRoot.querySelector("#input2") as HTMLInputElement;
      const input3 = shadowRoot.querySelector("#input3") as HTMLInputElement;

      const tabFromShadowActive = (shiftKey = false) => {
        const active = shadowRoot.activeElement as HTMLElement | null;
        if (!active) {
          return;
        }
        active.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Tab",
            shiftKey,
            bubbles: true,
            cancelable: true,
          })
        );
      };

      input1.focus();
      expect(document.activeElement).toBe(host);
      expect(shadowRoot.activeElement).toBe(input1);

      tabFromShadowActive(false);
      expect(shadowRoot.activeElement).toBe(input2);
      tabFromShadowActive(false);
      expect(shadowRoot.activeElement).toBe(input3);
      tabFromShadowActive(false);
      expect(shadowRoot.activeElement).toBe(input1);
    } finally {
      wrapper.unmount();
      host.remove();
      disableShadowDOM();
    }
  });

  it("manages focus traversal within nested shadow roots", () => {
    enableShadowDOM();

    const parentHost = document.createElement("div");
    document.body.appendChild(parentHost);
    const parentShadowRoot = parentHost.attachShadow({ mode: "open" });
    const nestedHost = document.createElement("div");
    parentShadowRoot.appendChild(nestedHost);
    const childShadowRoot = nestedHost.attachShadow({ mode: "open" });

    const wrapper = mount(defineComponent({
      render() {
        return h(
          Teleport,
          { to: childShadowRoot },
          h(
            FocusScope,
            { contain: true },
            {
              default: () => [
                h("input", { id: "input1" }),
                h("input", { id: "input2" }),
              ],
            }
          )
        );
      },
    }), {
      attachTo: document.body,
    });

    try {
      const input1 = childShadowRoot.querySelector("#input1") as HTMLInputElement;
      const input2 = childShadowRoot.querySelector("#input2") as HTMLInputElement;

      const tabFromChildShadowActive = (shiftKey = false) => {
        const active = childShadowRoot.activeElement as HTMLElement | null;
        if (!active) {
          return;
        }
        active.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Tab",
            shiftKey,
            bubbles: true,
            cancelable: true,
          })
        );
      };

      input1.focus();
      expect(childShadowRoot.activeElement).toBe(input1);

      tabFromChildShadowActive(false);
      expect(childShadowRoot.activeElement).toBe(input2);
    } finally {
      wrapper.unmount();
      parentHost.remove();
      disableShadowDOM();
    }
  });

  it("restores focus outside shadow DOM on unmount when an outer restore scope exists", () => {
    enableShadowDOM();

    const outerWrapper = mount(defineComponent({
      render() {
        return h("div", [
          h(
            FocusScope,
            { restoreFocus: true },
            {
              default: () => [h("input", { id: "outside" })],
            }
          ),
          h("div", { id: "shadow-host" }),
        ]);
      },
    }), {
      attachTo: document.body,
    });

    const shadowHost = outerWrapper.get("#shadow-host").element as HTMLDivElement;
    const shadowRoot = shadowHost.attachShadow({ mode: "open" });

    const innerWrapper = mount(defineComponent({
      render() {
        return h(
          Teleport,
          { to: shadowRoot },
          h(
            FocusScope,
            { restoreFocus: true },
            {
              default: () => [
                h("input", { id: "input1" }),
                h("input", { id: "input2" }),
                h("input", { id: "input3" }),
              ],
            }
          )
        );
      },
    }), {
      attachTo: document.body,
    });

    try {
      const input1 = shadowRoot.querySelector("#input1") as HTMLInputElement;
      input1.focus();
      expect(shadowRoot.activeElement).toBe(input1);

      const outside = outerWrapper.get("#outside").element as HTMLInputElement;
      outside.focus();
      expect(document.activeElement).toBe(outside);

      innerWrapper.unmount();
      expect(document.activeElement).toBe(outside);
    } finally {
      if (innerWrapper.exists()) {
        innerWrapper.unmount();
      }
      outerWrapper.unmount();
      disableShadowDOM();
    }
  });

  it("does not bubble restore focus events out of nested scopes", async () => {
    const Host = defineComponent({
      setup() {
        const show = ref(false);
        return { show };
      },
      render() {
        return h("div", { id: "host-root" }, [
          h(
            FocusScope,
            { restoreFocus: true, contain: true },
            {
              default: () => [
                h("button", { id: "trigger" }, "Trigger"),
                this.show
                  ? h(
                    FocusScope,
                    { restoreFocus: true, autoFocus: true },
                    {
                      default: () => [h("input", { id: "inside" })],
                    }
                  )
                  : null,
              ],
            }
          ),
        ]);
      },
    });

    const wrapper = mount(Host, { attachTo: document.body });
    const root = wrapper.get("#host-root").element;
    root.addEventListener("react-aria-focus-scope-restore", (event) => {
      event.preventDefault();
    });

    const trigger = wrapper.get("#trigger").element as HTMLButtonElement;
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    (wrapper.vm as unknown as { show: boolean }).show = true;
    await nextTick();
    expect(document.activeElement).toBe(wrapper.get("#inside").element);

    (wrapper.vm as unknown as { show: boolean }).show = false;
    await nextTick();
    expect(document.activeElement).toBe(trigger);

    wrapper.unmount();
  });

  it("does not autoFocus when an element inside the scope is already focused", async () => {
    const FocusInside = defineComponent({
      setup() {
        onMounted(() => {
          const existing = document.getElementById("second");
          if (existing instanceof HTMLElement) {
            existing.focus();
          }
        });
        return () => null;
      },
    });

    const wrapper = mount(FocusScope, {
      attachTo: document.body,
      props: { autoFocus: true },
      slots: {
        default: () => [
          h("input", { id: "first" }),
          h("input", { id: "second" }),
          h(FocusInside),
        ],
      },
    });

    await nextTick();
    expect(document.activeElement).toBe(wrapper.get("#second").element);
    wrapper.unmount();
  });

  it("does not wrap focus for contain when modifier keys are pressed", () => {
    const wrapper = mount(FocusScope, {
      attachTo: document.body,
      props: { contain: true },
      slots: {
        default: () => [
          h("input", { id: "input1" }),
          h("input", { id: "input2" }),
        ],
      },
    });

    const input1 = wrapper.get("#input1").element as HTMLInputElement;
    input1.focus();
    expect(document.activeElement).toBe(input1);

    input1.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        altKey: true,
        bubbles: true,
        cancelable: true,
      })
    );

    expect(document.activeElement).toBe(input1);
    wrapper.unmount();
  });

  it("restores focus to the last focused element in scope when focus moves outside", () => {
    const outside = document.createElement("button");
    outside.id = "outside";
    document.body.appendChild(outside);

    const wrapper = mount(FocusScope, {
      attachTo: document.body,
      props: { contain: true },
      slots: {
        default: () => [
          h("input", { id: "input1" }),
          h("input", { id: "input2" }),
        ],
      },
    });

    const input2 = wrapper.get("#input2").element as HTMLInputElement;
    input2.focus();
    expect(document.activeElement).toBe(input2);

    outside.focus();
    expect(document.activeElement).toBe(input2);

    wrapper.unmount();
    outside.remove();
  });

  it("focuses first tabbable element when contained scope loses focus before any in-scope focus tracking", () => {
    const outside = document.createElement("button");
    outside.id = "outside";
    document.body.appendChild(outside);

    const wrapper = mount(FocusScope, {
      attachTo: document.body,
      props: { contain: true },
      slots: {
        default: () => [
          h("input", { id: "first" }),
          h("input", { id: "second" }),
        ],
      },
    });

    outside.focus();
    expect(document.activeElement).toBe(wrapper.get("#first").element);

    wrapper.unmount();
    outside.remove();
  });

  it("does not lock focus in parent scope when child scope is teleported without contain", () => {
    const wrapper = mount(defineComponent({
      render() {
        return h("div", [
          h(
            FocusScope,
            { autoFocus: true, restoreFocus: true, contain: true },
            {
              default: () => [
                h("input", { id: "parent" }),
                h("div", [
                  h(
                    Teleport,
                    { to: "body" },
                    h(
                      FocusScope,
                      {},
                      {
                        default: () => [h("input", { id: "child" })],
                      }
                    )
                  ),
                ]),
              ],
            }
          ),
        ]);
      },
    }), {
      attachTo: document.body,
    });

    const parent = document.getElementById("parent") as HTMLInputElement;
    const child = document.getElementById("child") as HTMLInputElement;

    expect(document.activeElement).toBe(parent);
    child.focus();
    expect(document.activeElement).toBe(child);
    parent.focus();
    expect(document.activeElement).toBe(parent);

    wrapper.unmount();
  });

  it("locks focus in teleported child scope when child scope has contain", () => {
    const wrapper = mount(defineComponent({
      render() {
        return h("div", [
          h(
            FocusScope,
            { autoFocus: true, restoreFocus: true, contain: true },
            {
              default: () => [
                h("input", { id: "parent" }),
                h("div", [
                  h(
                    Teleport,
                    { to: "body" },
                    h(
                      FocusScope,
                      { contain: true },
                      {
                        default: () => [h("input", { id: "child" })],
                      }
                    )
                  ),
                ]),
              ],
            }
          ),
        ]);
      },
    }), {
      attachTo: document.body,
    });

    const parent = document.getElementById("parent") as HTMLInputElement;
    const child = document.getElementById("child") as HTMLInputElement;

    expect(document.activeElement).toBe(parent);
    child.focus();
    expect(document.activeElement).toBe(child);
    parent.focus();
    expect(document.activeElement).toBe(child);

    wrapper.unmount();
  });
});
