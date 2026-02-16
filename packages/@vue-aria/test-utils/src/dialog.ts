import { BaseTester } from "./_base";
import type { DialogTesterOpts } from "./types";

export class DialogTester extends BaseTester {
  overlayType?: DialogTesterOpts["overlayType"];

  constructor(opts: DialogTesterOpts) {
    super(opts);
    this.overlayType = opts.overlayType;
  }

  async open() {
    await this.click(this.root);
  }

  async close() {
    await this.keyboard("[Escape]");
  }
}
