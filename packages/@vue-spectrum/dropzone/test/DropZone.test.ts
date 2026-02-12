import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { provideI18n } from "@vue-aria/i18n";
import { mergeProps } from "@vue-aria/utils";
import { useDrag } from "@vue-aria/dnd";
import { DataTransferMock, DragEventMock } from "../../../@vue-aria/dnd/test/mocks";
import { Button } from "@vue-spectrum/button";
import { Content, Header } from "@vue-spectrum/view";
import { IllustratedMessage } from "@vue-spectrum/illustratedmessage";
import { DropZone } from "../src";

function setRect(element: HTMLElement): void {
  Object.defineProperty(element, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      left: 0,
      top: 0,
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      right: 100,
      bottom: 50,
      toJSON: () => ({}),
    }),
  });
}

describe("DropZone", () => {
  it("localizes default replace banner message from i18n locale", () => {
    const Harness = defineComponent({
      name: "DropZoneLocalizedHarness",
      setup() {
        provideI18n({ locale: "fr-FR" });

        return () =>
          h(
            DropZone,
            {
              "data-testid": "dropzone",
              isFilled: true,
            },
            {
              default: () =>
                h(IllustratedMessage, null, {
                  default: () => h(Header, null, () => "Aucun fichier"),
                }),
            }
          );
      },
    });

    const wrapper = mount(Harness);
    const dropzone = wrapper.get("[data-testid=\"dropzone\"]");
    expect(dropzone.text()).toContain("Déposer le fichier à remplacer");
    wrapper.unmount();
  });

  it("should attach a ref on the outer most div", async () => {
    const dropZoneRef = ref<{ UNSAFE_getDOMNode: () => HTMLElement | null } | null>(
      null
    );
    const Harness = defineComponent({
      name: "DropZoneRefHarness",
      setup() {
        return () =>
          h(
            DropZone,
            {
              ref: dropZoneRef,
              "data-testid": "dropzone",
            },
            {
              default: () =>
                h(IllustratedMessage, null, {
                  default: () => h(Header, null, () => "No files"),
                }),
            }
          );
      },
    });

    const wrapper = mount(Harness, {
      attachTo: document.body,
    });

    const dropzone = wrapper.get("[data-testid=\"dropzone\"]").element as HTMLElement;
    expect(wrapper.element).toBe(dropzone);
    expect(dropZoneRef.value?.UNSAFE_getDOMNode()).toBe(dropzone);

    wrapper.unmount();
  });

  it("should show banner when filled", async () => {
    const onDragStart = vi.fn();
    const onDragMove = vi.fn();
    const onDragEnd = vi.fn();
    const onDropEnter = vi.fn();
    const onDropMove = vi.fn();
    const onDrop = vi.fn();

    const Draggable = defineComponent({
      name: "DropZoneTestDraggable",
      setup() {
        const { dragProps, isDragging } = useDrag({
          getItems: () => [
            {
              "text/plain": "hello world",
            },
          ],
          onDragStart,
          onDragMove,
          onDragEnd,
        });

        return () =>
          h(
            "button",
            mergeProps(dragProps, {
              "data-testid": "draggable",
              "data-dragging": isDragging.value ? "true" : "false",
            }),
            "Drag me"
          );
      },
    });

    const Harness = defineComponent({
      name: "DropZoneDragHarness",
      setup() {
        return () =>
          h("div", null, [
            h(Draggable),
            h(
              DropZone,
              {
                "data-testid": "dropzone",
                isFilled: true,
                onDropEnter,
                onDropMove,
                onDrop,
              },
              {
                default: () =>
                  h(IllustratedMessage, null, {
                    default: () => [
                      h(Header, null, () => "No files"),
                      h(Content, null, () =>
                        h(
                          Button,
                          {
                            variant: "primary",
                          },
                          {
                            default: () => "Select a file",
                          }
                        )
                      ),
                    ],
                  }),
              }
            ),
          ]);
      },
    });

    const wrapper = mount(Harness, {
      attachTo: document.body,
    });

    const draggable = wrapper.get("[data-testid=\"draggable\"]").element as HTMLElement;
    const dropzone = wrapper.get("[data-testid=\"dropzone\"]").element as HTMLElement;
    setRect(draggable);
    setRect(dropzone);

    expect(dropzone.className).toContain("spectrum-Dropzone--filled");
    expect(dropzone.textContent).toContain("Drop file to replace");
    expect(dropzone.getAttribute("data-drop-target")).toBeNull();

    const dataTransfer = new DataTransferMock();

    draggable.dispatchEvent(
      new DragEventMock("dragstart", {
        dataTransfer,
        clientX: 0,
        clientY: 0,
      }) as unknown as Event
    );
    await nextTick();

    expect(draggable.getAttribute("data-dragging")).toBe("true");
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragStart).toHaveBeenCalledWith({
      type: "dragstart",
      x: 0,
      y: 0,
    });

    draggable.dispatchEvent(
      new DragEventMock("drag", {
        dataTransfer,
        clientX: 1,
        clientY: 1,
      }) as unknown as Event
    );

    expect(onDragMove).toHaveBeenCalledTimes(1);
    expect(onDragMove).toHaveBeenCalledWith({
      type: "dragmove",
      x: 1,
      y: 1,
    });

    dropzone.dispatchEvent(
      new DragEventMock("dragenter", {
        dataTransfer,
        clientX: 1,
        clientY: 1,
      }) as unknown as Event
    );
    await nextTick();

    expect(onDropEnter).toHaveBeenCalledTimes(1);
    expect(onDropEnter).toHaveBeenCalledWith({
      type: "dropenter",
      x: 1,
      y: 1,
    });
    expect(dataTransfer.dropEffect).toBe("move");
    expect(dropzone.getAttribute("data-drop-target")).toBe("true");

    dropzone.dispatchEvent(
      new DragEventMock("dragover", {
        dataTransfer,
        clientX: 2,
        clientY: 2,
      }) as unknown as Event
    );

    expect(onDropMove).toHaveBeenCalledTimes(1);
    expect(onDropMove).toHaveBeenCalledWith({
      type: "dropmove",
      x: 2,
      y: 2,
    });
    expect(dataTransfer.dropEffect).toBe("move");

    dropzone.dispatchEvent(
      new DragEventMock("drop", {
        dataTransfer,
        clientX: 2,
        clientY: 2,
      }) as unknown as Event
    );
    await nextTick();

    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onDrop).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "drop",
        x: 2,
        y: 2,
        dropOperation: "move",
        items: [
          {
            kind: "text",
            types: new Set(["text/plain"]),
            getText: expect.any(Function),
          },
        ],
      })
    );
    expect(await onDrop.mock.calls[0]?.[0].items[0].getText("text/plain")).toBe(
      "hello world"
    );

    draggable.dispatchEvent(
      new DragEventMock("dragend", {
        dataTransfer,
        clientX: 2,
        clientY: 2,
      }) as unknown as Event
    );
    await nextTick();

    expect(onDragEnd).toHaveBeenCalledTimes(1);
    expect(onDragEnd).toHaveBeenCalledWith({
      type: "dragend",
      x: 2,
      y: 2,
      dropOperation: "move",
    });
    expect(dropzone.getAttribute("data-drop-target")).toBeNull();

    wrapper.unmount();
  });
});
