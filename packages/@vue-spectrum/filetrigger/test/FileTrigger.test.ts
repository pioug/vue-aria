import { render } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { FileTrigger } from "../src";

describe("FileTrigger", () => {
  it("renders with link child", () => {
    const { getByRole } = render(FileTrigger, {
      slots: {
        default: () => h("a", { href: "#" }, "Upload"),
      },
    });

    expect(getByRole("link")).toBeTruthy();
  });

  it("renders with button child", () => {
    const { getByRole } = render(FileTrigger, {
      attrs: {
        "data-testid": "foo",
      },
      slots: {
        default: () => h("button", { type: "button" }, "Upload"),
      },
    });

    expect(getByRole("button")).toBeTruthy();
  });

  it("uploads a file and calls onSelect", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const file = new File(["hello"], "hello.png", { type: "image/png" });
    const { container } = render(FileTrigger, {
      props: {
        onSelect,
      },
      slots: {
        default: () => h("button", { type: "button" }, "Upload"),
      },
    });

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();

    await user.upload(input, file);

    expect(input.files?.[0]).toStrictEqual(file);
    expect(input.files?.item(0)).toStrictEqual(file);
    expect(input.files).toHaveLength(1);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]?.[0]?.item(0)).toStrictEqual(file);
  });

  it("opens file picker on child click and clears existing value", async () => {
    const user = userEvent.setup();
    const { container, getByRole } = render(FileTrigger, {
      slots: {
        default: () => h("button", { type: "button" }, "Upload"),
      },
    });

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, "click").mockImplementation(() => {});
    Object.defineProperty(input, "value", {
      configurable: true,
      writable: true,
      value: "C:/fakepath/test.png",
    });

    await user.click(getByRole("button"));

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(input.value).toBe("");
  });

  it("sets webkitdirectory when acceptDirectory is true", () => {
    const { container } = render(FileTrigger, {
      props: {
        acceptDirectory: true,
      },
      slots: {
        default: () => h("button", { type: "button" }, "Upload Directory"),
      },
    });

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.hasAttribute("webkitdirectory")).toBe(true);
  });

  it("forwards input configuration props", () => {
    const { container } = render(FileTrigger, {
      props: {
        acceptedFileTypes: ["image/png", "image/jpeg"],
        allowsMultiple: true,
        defaultCamera: "environment",
      },
      slots: {
        default: () => h("button", { type: "button" }, "Upload"),
      },
    });

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    expect(input.getAttribute("accept")).toBe("image/png,image/jpeg");
    expect(input.multiple).toBe(true);
    expect(input.getAttribute("capture")).toBe("environment");
  });

  it("exposes input element through component ref", async () => {
    const triggerRef = ref<{
      getInputElement: () => HTMLInputElement | null;
      UNSAFE_getDOMNode: () => HTMLInputElement | null;
      open: () => void;
    } | null>(null);

    const App = defineComponent({
      setup() {
        return () =>
          h(
            FileTrigger,
            {
              ref: triggerRef,
            },
            {
              default: () => h("button", { type: "button" }, "Upload"),
            }
          );
      },
    });

    const { container } = render(App);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, "click").mockImplementation(() => {});

    expect(triggerRef.value?.getInputElement()).toBe(input);
    expect(triggerRef.value?.UNSAFE_getDOMNode()).toBe(input);

    triggerRef.value?.open();

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("does not open picker if click default is prevented", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: MouseEvent) => {
      event.preventDefault();
    });
    const { container, getByRole } = render(FileTrigger, {
      slots: {
        default: () => h("button", { type: "button", onClick }, "Upload"),
      },
    });

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, "click").mockImplementation(() => {});

    await user.click(getByRole("button"));

    expect(onClick).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalledTimes(0);
  });

  it("works when no child is provided", async () => {
    const onSelect = vi.fn();
    const file = new File(["test"], "test.txt", { type: "text/plain" });
    const { container } = render(FileTrigger, {
      props: {
        onSelect,
      },
    });

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, "files", {
      configurable: true,
      value: [file],
    });
    input.dispatchEvent(new Event("change"));

    expect(onSelect).toHaveBeenCalled();
  });
});
