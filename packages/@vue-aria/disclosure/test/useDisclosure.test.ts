import { afterEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { useDisclosure, useDisclosureState } from "../src";

interface DisclosureSetup {
  panel: HTMLElement;
  state: ReturnType<typeof useDisclosureState>;
  disclosure: ReturnType<typeof useDisclosure>;
  cleanup: () => void;
}

function setupDisclosure(
  options: Parameters<typeof useDisclosure>[0] = {},
  stateOptions: Parameters<typeof useDisclosureState>[0] = {}
): DisclosureSetup {
  const panel = document.createElement("div");
  document.body.appendChild(panel);

  const scope = effectScope();
  let state!: ReturnType<typeof useDisclosureState>;
  let disclosure!: ReturnType<typeof useDisclosure>;

  scope.run(() => {
    state = useDisclosureState(stateOptions);
    disclosure = useDisclosure(options, state, panel);
  });

  return {
    panel,
    state,
    disclosure,
    cleanup: () => {
      scope.stop();
      panel.remove();
    },
  };
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("useDisclosure", () => {
  it("returns collapsed aria attributes by default", () => {
    const { disclosure, cleanup } = setupDisclosure();

    expect(disclosure.buttonProps.value["aria-expanded"]).toBe(false);
    expect(disclosure.panelProps.value["aria-hidden"]).toBe(true);

    cleanup();
  });

  it("returns expanded aria attributes when defaultExpanded", () => {
    const { disclosure, cleanup } = setupDisclosure({}, { defaultExpanded: true });

    expect(disclosure.buttonProps.value["aria-expanded"]).toBe(true);
    expect(disclosure.panelProps.value["aria-hidden"]).toBe(false);

    cleanup();
  });

  it("toggles disclosure on mouse press", () => {
    const { disclosure, state, cleanup } = setupDisclosure();

    (disclosure.buttonProps.value.onPress as ((event: { pointerType: string }) => void))({
      pointerType: "mouse",
    });

    expect(state.isExpanded.value).toBe(true);

    cleanup();
  });

  it("toggles disclosure on keyboard press start", () => {
    const { disclosure, state, cleanup } = setupDisclosure();

    (
      disclosure.buttonProps.value.onPressStart as ((event: { pointerType: string }) => void)
    )({
      pointerType: "keyboard",
    });

    expect(state.isExpanded.value).toBe(true);

    cleanup();
  });

  it("does not toggle when disabled", () => {
    const { disclosure, state, cleanup } = setupDisclosure({ isDisabled: true });

    (disclosure.buttonProps.value.onPress as ((event: { pointerType: string }) => void))({
      pointerType: "mouse",
    });

    expect(state.isExpanded.value).toBe(false);

    cleanup();
  });

  it("connects button and panel ids for accessibility", () => {
    const { disclosure, cleanup } = setupDisclosure();

    expect(disclosure.buttonProps.value["aria-controls"]).toBe(disclosure.panelProps.value.id);
    expect(disclosure.panelProps.value["aria-labelledby"]).toBe(disclosure.buttonProps.value.id);

    cleanup();
  });

  it("expands when beforematch event occurs", async () => {
    const { panel, state, cleanup } = setupDisclosure();

    expect(state.isExpanded.value).toBe(false);
    expect(panel.getAttribute("hidden")).toBe("until-found");

    panel.dispatchEvent(new Event("beforematch", { bubbles: true }));
    await nextTick();

    expect(state.isExpanded.value).toBe(true);
    expect(panel.hasAttribute("hidden")).toBe(false);

    cleanup();
  });

  it("calls onExpandedChange on beforematch in controlled mode", () => {
    const isExpanded = ref(false);
    const onExpandedChange = vi.fn();

    const panel = document.createElement("div");
    document.body.appendChild(panel);

    const scope = effectScope();
    let state!: ReturnType<typeof useDisclosureState>;

    scope.run(() => {
      state = useDisclosureState({ isExpanded, onExpandedChange });
      useDisclosure({}, state, panel);
    });

    expect(state.isExpanded.value).toBe(false);
    expect(panel.getAttribute("hidden")).toBe("until-found");

    panel.dispatchEvent(new Event("beforematch", { bubbles: true }));

    expect(state.isExpanded.value).toBe(false);
    expect(panel.getAttribute("hidden")).toBe("until-found");
    expect(onExpandedChange).toHaveBeenCalledWith(true);

    scope.stop();
    panel.remove();
  });
});
