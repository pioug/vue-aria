import { effectScope, nextTick, reactive } from "vue";
import { describe, expect, it, vi } from "vitest";
import { setInteractionModality } from "@vue-aria/interactions";
import { useToastRegion } from "../src";

describe("useToastRegion", () => {
  const run = (props: Record<string, unknown>, state: any) => {
    const scope = effectScope();
    const regionElement = document.createElement("section");
    document.body.append(regionElement);
    const result = scope.run(() =>
      useToastRegion(props as any, state, { current: regionElement as HTMLElement | null })
    )!;
    return {
      ...result,
      regionElement,
      cleanup() {
        scope.stop();
        regionElement.remove();
      },
    };
  };

  it("returns region props", () => {
    const state = {
      visibleToasts: [],
      pauseAll: vi.fn(),
      resumeAll: vi.fn(),
    };
    const { regionProps, cleanup } = run({ "aria-label": "Notifications" }, state);
    expect(regionProps.role).toBe("region");
    expect(regionProps["aria-label"]).toBe("Notifications");
    expect(regionProps.tabIndex).toBe(-1);
    expect(regionProps["data-react-aria-top-layer"]).toBe(true);
    cleanup();
  });

  it("pauses and resumes timers on hover transitions", () => {
    const state = reactive({
      visibleToasts: [],
      pauseAll: vi.fn(),
      resumeAll: vi.fn(),
    });
    const { regionProps, cleanup } = run({ "aria-label": "Notifications" }, state);

    const region = document.createElement("section");
    const onEnter =
      (regionProps.onPointerenter as ((event: PointerEvent) => void) | undefined)
      ?? (regionProps.onMouseenter as ((event: MouseEvent) => void) | undefined);
    const onLeave =
      (regionProps.onPointerleave as ((event: PointerEvent) => void) | undefined)
      ?? (regionProps.onMouseleave as ((event: MouseEvent) => void) | undefined);

    onEnter?.({
      pointerType: "mouse",
      currentTarget: region,
      target: region,
    } as unknown as PointerEvent);
    expect(state.pauseAll).toHaveBeenCalledTimes(1);

    onLeave?.({
      pointerType: "mouse",
      currentTarget: region,
      target: region,
    } as unknown as PointerEvent);
    expect(state.resumeAll).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it("pauses and resumes timers on focus transitions", () => {
    const state = reactive({
      visibleToasts: [{ key: "toast-1" }],
      pauseAll: vi.fn(),
      resumeAll: vi.fn(),
    });
    const { regionProps, cleanup } = run({ "aria-label": "Notifications" }, state);

    const region = document.createElement("section");
    const blurTarget = document.createElement("button");

    const focusEvent = new FocusEvent("focus", { relatedTarget: blurTarget });
    Object.defineProperty(focusEvent, "currentTarget", { value: region });
    Object.defineProperty(focusEvent, "target", { value: region });
    (regionProps.onFocus as (event: FocusEvent) => void)?.(focusEvent);
    expect(state.pauseAll).toHaveBeenCalledTimes(1);

    const blurEvent = new FocusEvent("blur", { relatedTarget: blurTarget });
    Object.defineProperty(blurEvent, "currentTarget", { value: region });
    Object.defineProperty(blurEvent, "target", { value: region });
    (regionProps.onBlur as (event: FocusEvent) => void)?.(blurEvent);
    expect(state.resumeAll).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it("moves focus to a replacement toast when the focused toast is removed", async () => {
    const state = reactive({
      visibleToasts: [] as Array<{ key: string }>,
      pauseAll: vi.fn(),
      resumeAll: vi.fn(),
    });
    const { regionProps, regionElement, cleanup } = run({ "aria-label": "Notifications" }, state);

    const launcher = document.createElement("button");
    document.body.append(launcher);
    launcher.focus();

    const firstToast = document.createElement("div");
    firstToast.setAttribute("role", "alertdialog");
    firstToast.tabIndex = 0;
    regionElement.append(firstToast);
    state.visibleToasts = [{ key: "toast-1" }];
    await nextTick();

    const firstFocusEvent = new FocusEvent("focus", { relatedTarget: launcher });
    Object.defineProperty(firstFocusEvent, "currentTarget", { value: regionElement });
    Object.defineProperty(firstFocusEvent, "target", { value: firstToast });
    (regionProps.onFocus as (event: FocusEvent) => void)?.(firstFocusEvent);
    firstToast.focus();
    expect(document.activeElement).toBe(firstToast);

    const secondToast = document.createElement("div");
    secondToast.setAttribute("role", "alertdialog");
    secondToast.tabIndex = 0;
    firstToast.remove();
    regionElement.append(secondToast);
    state.visibleToasts = [{ key: "toast-2" }];
    await nextTick();

    expect(document.activeElement).toBe(secondToast);

    launcher.remove();
    cleanup();
  });

  it("restores focus to the previous element when no toasts remain", async () => {
    const state = reactive({
      visibleToasts: [] as Array<{ key: string }>,
      pauseAll: vi.fn(),
      resumeAll: vi.fn(),
    });
    const { regionProps, regionElement, cleanup } = run({ "aria-label": "Notifications" }, state);

    const launcher = document.createElement("button");
    document.body.append(launcher);
    launcher.focus();

    const toast = document.createElement("div");
    toast.setAttribute("role", "alertdialog");
    toast.tabIndex = 0;
    regionElement.append(toast);
    state.visibleToasts = [{ key: "toast-1" }];
    await nextTick();

    const focusEvent = new FocusEvent("focus", { relatedTarget: launcher });
    Object.defineProperty(focusEvent, "currentTarget", { value: regionElement });
    Object.defineProperty(focusEvent, "target", { value: toast });
    (regionProps.onFocus as (event: FocusEvent) => void)?.(focusEvent);
    toast.focus();
    expect(document.activeElement).toBe(toast);

    toast.remove();
    state.visibleToasts = [];
    await nextTick();
    expect(document.activeElement).toBe(launcher);

    launcher.remove();
    cleanup();
  });

  it("restores focus in pointer modality when no toasts remain", async () => {
    setInteractionModality("pointer");
    const state = reactive({
      visibleToasts: [] as Array<{ key: string }>,
      pauseAll: vi.fn(),
      resumeAll: vi.fn(),
    });
    const { regionProps, regionElement, cleanup } = run({ "aria-label": "Notifications" }, state);

    const launcher = document.createElement("button");
    document.body.append(launcher);
    launcher.focus();

    const toast = document.createElement("div");
    toast.setAttribute("role", "alertdialog");
    toast.tabIndex = 0;
    regionElement.append(toast);
    state.visibleToasts = [{ key: "toast-1" }];
    await nextTick();

    const focusEvent = new FocusEvent("focus", { relatedTarget: launcher });
    Object.defineProperty(focusEvent, "currentTarget", { value: regionElement });
    Object.defineProperty(focusEvent, "target", { value: toast });
    (regionProps.onFocus as (event: FocusEvent) => void)?.(focusEvent);
    toast.focus();
    expect(document.activeElement).toBe(toast);

    toast.remove();
    state.visibleToasts = [];
    await nextTick();
    expect(document.activeElement).toBe(launcher);

    launcher.remove();
    cleanup();
    setInteractionModality("keyboard");
  });

});
