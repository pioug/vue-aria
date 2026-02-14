export async function pressElement(target: {
  trigger: (eventName: string, options?: Record<string, unknown>) => Promise<void>;
}) {
  await target.trigger("pointerdown", {
    button: 0,
    pointerId: 1,
    pointerType: "mouse",
    clientX: 1,
    clientY: 1,
  });
  await target.trigger("pointerup", {
    button: 0,
    pointerId: 1,
    pointerType: "mouse",
    clientX: 1,
    clientY: 1,
  });
  await target.trigger("click", {
    button: 0,
  });
}
