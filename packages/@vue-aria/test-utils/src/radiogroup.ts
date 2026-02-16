import { BaseTester } from "./_base";
import type { RadioGroupTesterOpts } from "./types";

export class RadioGroupTester extends BaseTester {
  constructor(opts: RadioGroupTesterOpts) {
    super(opts);
    this.direction = opts.direction ?? "ltr";
  }

  direction: RadioGroupTesterOpts["direction"];

  async choose(option: string | number | HTMLElement) {
    await this.click(option instanceof HTMLElement ? option : this.root);
  }
}
