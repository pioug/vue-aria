import { BaseTester } from "./_base";
import type { ComboBoxTesterOpts } from "./types";

export class ComboBoxTester extends BaseTester {
  constructor(opts: ComboBoxTesterOpts) {
    super(opts);
    this.trigger = opts.trigger;
  }

  trigger?: HTMLElement;

  async open() {
    if (this.trigger) {
      return this.click(this.trigger);
    }
    return this.click(this.root);
  }

  async close() {
    return this.keyboard("[Escape]");
  }
}
