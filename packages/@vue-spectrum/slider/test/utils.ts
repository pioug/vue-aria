import userEvent from "@testing-library/user-event";
import { expect } from "vitest";

async function pressKeyOnSlider(key: string, slider: HTMLElement): Promise<void> {
  slider.focus();
  const user = userEvent.setup();
  await user.keyboard(`{${key}}`);
}

export const press = {
  ArrowRight: (slider: HTMLElement) => pressKeyOnSlider("ArrowRight", slider),
  ArrowLeft: (slider: HTMLElement) => pressKeyOnSlider("ArrowLeft", slider),
  ArrowUp: (slider: HTMLElement) => pressKeyOnSlider("ArrowUp", slider),
  ArrowDown: (slider: HTMLElement) => pressKeyOnSlider("ArrowDown", slider),
  Home: (slider: HTMLElement) => pressKeyOnSlider("Home", slider),
  End: (slider: HTMLElement) => pressKeyOnSlider("End", slider),
  PageUp: (slider: HTMLElement) => pressKeyOnSlider("PageUp", slider),
  PageDown: (slider: HTMLElement) => pressKeyOnSlider("PageDown", slider),
} as const;

type SliderCommand =
  | {
      left: (slider: HTMLInputElement) => Promise<void>;
      result: string | number;
      right?: never;
    }
  | {
      right: (slider: HTMLInputElement) => Promise<void>;
      result: string | number;
      left?: never;
    };

export async function testKeypresses(
  [sliderLeft, sliderRight]: [HTMLInputElement, HTMLInputElement],
  commands: SliderCommand[]
): Promise<void> {
  for (const command of commands) {
    const isLeftCommand = typeof command.left === "function";
    const slider = isLeftCommand ? sliderLeft : sliderRight;
    const oldValue = Number(slider.value);
    if (isLeftCommand) {
      await command.left(sliderLeft);
    } else if (typeof command.right === "function") {
      await command.right(sliderRight);
    }

    if (typeof command.result === "string") {
      expect(slider.value).toBe(command.result);
    } else {
      expect(slider.value).toBe(String(oldValue + command.result));
    }
  }
}
