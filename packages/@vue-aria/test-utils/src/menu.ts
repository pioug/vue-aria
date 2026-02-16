import { BaseTester } from "./_base";
import type { MenuTesterOpts } from "./types";

export class MenuTester extends BaseTester {
  constructor(opts: MenuTesterOpts) {
    super(opts);
    this.isSubmenu = opts.isSubmenu;
    this.rootMenu = opts.rootMenu;
  }

  isSubmenu?: boolean;
  rootMenu?: HTMLElement;

  async openByTrigger() {
    await this.click(this.root);
  }
}
