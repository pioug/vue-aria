import {act, waitFor, within} from './testing';
import {BaseTester} from "./_base";
import {MenuTesterOpts, UserOpts} from './types';
import {triggerLongPress} from './events';

interface MenuOpenOpts {
  needsLongPress?: boolean;
  interactionType?: UserOpts['interactionType'];
  direction?: 'up' | 'down';
}

interface MenuSelectOpts extends MenuOpenOpts {
  option: number | string | HTMLElement;
  menuSelectionMode?: 'single' | 'multiple';
  closesOnSelect?: boolean;
  keyboardActivation?: 'Space' | 'Enter';
}

interface MenuOpenSubmenuOpts extends MenuOpenOpts {
  submenuTrigger: string | HTMLElement;
}

export class MenuTester extends BaseTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _advanceTimer: UserOpts['advanceTimer'];
  private _trigger: HTMLElement | undefined;
  private _isSubmenu = false;
  private _rootMenu: HTMLElement | undefined;

  constructor(opts: MenuTesterOpts) {
    super(opts);
    let {root, user, interactionType, advanceTimer, isSubmenu, rootMenu} = opts;
    this.user = user;
    this._interactionType = interactionType || 'mouse';
    this._advanceTimer = advanceTimer;

    if (root.getAttribute('role') === 'menuitem') {
      this._trigger = root;
    } else {
      let trigger = within(root).queryByRole('button');
      this._trigger = trigger || root;
    }

    this._isSubmenu = isSubmenu || false;
    this._rootMenu = rootMenu;
  }

  setInteractionType(type: UserOpts['interactionType']): void {
    this._interactionType = type;
  }

  async open(opts: MenuOpenOpts = {}): Promise<void> {
    let {needsLongPress, interactionType = this._interactionType, direction} = opts;
    let trigger = this.trigger;
    let isDisabled = trigger.hasAttribute('disabled');
    if (interactionType === 'mouse' || interactionType === 'touch') {
      if (needsLongPress) {
        if (this._advanceTimer == null) {
          throw new Error('No advanceTimers provided for long press.');
        }
        let pointerType = interactionType === 'mouse' ? 'mouse' : 'touch';
        await triggerLongPress({element: trigger, advanceTimer: this._advanceTimer, pointerOpts: {pointerType}});
      } else if (interactionType === 'mouse') {
        await this.user.click(trigger);
      } else {
        await this.user.pointer({target: trigger, keys: '[TouchA]'});
      }
    } else if (interactionType === 'keyboard' && !isDisabled) {
      if (direction === 'up') {
        act(() => trigger.focus());
        await this.user.keyboard('[ArrowUp]');
      } else if (direction === 'down') {
        act(() => trigger.focus());
        await this.user.keyboard('[ArrowDown]');
      } else {
        act(() => trigger.focus());
        await this.user.keyboard('[Enter]');
      }
    }

    await waitFor(() => {
      if (trigger.getAttribute('aria-controls') == null && !isDisabled) {
        throw new Error('No aria-controls found on menu trigger element.');
      } else {
        return true;
      }
    });
    if (!isDisabled) {
      let menuId = trigger.getAttribute('aria-controls');
      await waitFor(() => {
        if (!menuId || document.getElementById(menuId) == null) {
          throw new Error(`Menu with id of ${menuId} not found in document.`);
        } else {
          return true;
        }
      });
    }
  }

  findOption(opts: {optionIndexOrText: number | string}): HTMLElement {
    let {optionIndexOrText} = opts;
    let option;
    let options = this.options();
    let menu = this.menu;

    if (typeof optionIndexOrText === 'number') {
      option = options[optionIndexOrText];
    } else if (typeof optionIndexOrText === 'string' && menu != null) {
      option = (within(menu!).getByText(optionIndexOrText).closest('[role=menuitem], [role=menuitemradio], [role=menuitemcheckbox]')) as HTMLElement;
    }

    return option;
  }

  async selectOption(opts: MenuSelectOpts): Promise<void> {
    let {
      menuSelectionMode = 'single',
      needsLongPress,
      closesOnSelect = true,
      option,
      interactionType = this._interactionType,
      keyboardActivation = 'Enter',
    } = opts;
    let trigger = this.trigger;

    if (!trigger.getAttribute('aria-controls') && !trigger.hasAttribute('aria-expanded')) {
      await this.open({needsLongPress});
    }

    let menu = this.menu;
    if (!menu) {
      throw new Error('Menu not found.');
    }

    if (menu) {
      if (typeof option === 'string' || typeof option === 'number') {
        option = this.findOption({optionIndexOrText: option});
      }

      if (!option) {
        throw new Error('Target option not found in the menu.');
      }

      if (interactionType === 'keyboard') {
        if (option?.getAttribute('aria-disabled') === 'true') {
          return;
        }

        if (document.activeElement !== menu && !menu.contains(document.activeElement)) {
          act(() => menu.focus());
        }

        await this.keyboardNavigateToOption({option});
        await this.user.keyboard(`[${keyboardActivation}]`);
      } else {
        if (interactionType === 'mouse') {
          await this.user.click(option);
        } else {
          await this.user.pointer({target: option, keys: '[TouchA]'});
        }
      }

      if (
        !(menuSelectionMode === 'single' && !closesOnSelect) &&
        !(menuSelectionMode === 'multiple' && (keyboardActivation === 'Space' || interactionType === 'mouse'))
      ) {
        if (this._isSubmenu) {
          await waitFor(() => {
            if (document.activeElement === document.body) {
              throw new Error('Expected focus to move to somewhere other than the body after selecting a submenu option.');
            } else {
              return true;
            }
          });
        }

        await waitFor(() => {
          if (document.activeElement === option) {
            throw new Error('Expected focus after selecting an option to move away from the option.');
          } else {
            return true;
          }
        });

        if (this._isSubmenu) {
          await waitFor(() => {
            if (document.activeElement === this.trigger || this._rootMenu?.contains(document.activeElement)) {
              throw new Error('Expected focus after selecting an submenu option to move away from the original submenu trigger.');
            } else {
              return true;
            }
          });
        }

        await waitFor(() => {
          if (document.activeElement === document.body) {
            throw new Error('Expected focus to move to somewhere other than the body after selecting a menu option.');
          } else {
            return true;
          }
        });
      }
    } else {
      throw new Error("Attempted to select a option in the menu, but menu wasn't found.");
    }
  }

  async openSubmenu(opts: MenuOpenSubmenuOpts): Promise<MenuTester | null> {
    let {
      submenuTrigger,
      needsLongPress,
      interactionType = this._interactionType
    } = opts;

    let trigger = this.trigger;
    let isDisabled = trigger.hasAttribute('disabled');
    if (!trigger.getAttribute('aria-controls') && !isDisabled) {
      await this.open({needsLongPress});
    }
    if (!isDisabled) {
      let menu = this.menu;
      if (menu) {
        if (typeof submenuTrigger === 'string') {
          submenuTrigger = (within(menu!).getByText(submenuTrigger).closest('[role=menuitem]')) as HTMLElement;
        }

        let submenuTriggerTester = new MenuTester({
          user: this.user,
          interactionType: this._interactionType,
          root: submenuTrigger,
          isSubmenu: true,
          advanceTimer: this._advanceTimer,
          rootMenu: (this._isSubmenu ? this._rootMenu : this.menu) || undefined
        }) as MenuTester;
        if (interactionType === 'mouse') {
          await this.user.pointer({target: submenuTrigger});
        } else if (interactionType === 'keyboard') {
          await this.keyboardNavigateToOption({option: submenuTrigger});
          await this.user.keyboard('[ArrowRight]');
        } else {
          await submenuTriggerTester.open();
        }

        await waitFor(() => {
          if (submenuTriggerTester.trigger?.getAttribute('aria-expanded') !== 'true') {
            throw new Error("aria-expanded for the submenu trigger wasn't changed to \"true\", unable to confirm the existance of the submenu");
          } else {
            return true;
          }
        });

        return submenuTriggerTester;
      }
    }

    return null;
  }

  private async keyboardNavigateToOption(opts: {option: HTMLElement}) {
    let {option} = opts;
    let options = this.options();
    let targetIndex = options.findIndex(opt => (opt === option) || opt.contains(option));

    if (targetIndex === -1) {
      throw new Error('Option provided is not in the menu');
    }
    if (document.activeElement === this.menu) {
      await this.user.keyboard('[ArrowDown]');
    }
    let currIndex = options.indexOf(document.activeElement as HTMLElement);
    if (currIndex === -1) {
      throw new Error('ActiveElement is not in the menu');
    }
    let direction = targetIndex > currIndex ? 'down' : 'up';

    for (let i = 0; i < Math.abs(targetIndex - currIndex); i++) {
      await this.user.keyboard(`[${direction === 'down' ? 'ArrowDown' : 'ArrowUp'}]`);
    }
  };

  async close(): Promise<void> {
    let menu = this.menu;
    if (menu) {
      act(() => menu.focus());
      await this.user.keyboard('[Escape]');

      await waitFor(() => {
        if (document.activeElement !== this.trigger) {
          throw new Error(`Expected the document.activeElement after closing the menu to be the menu trigger but got ${document.activeElement}`);
        } else {
          return true;
        }
      });

      if (document.contains(menu)) {
        throw new Error('Expected the menu to not be in the document after closing it.');
      }
    }
  }

  get trigger(): HTMLElement {
    if (!this._trigger) {
      throw new Error('No trigger element found for menu.');
    }
    return this._trigger;
  }

  get menu(): HTMLElement | null {
    let menuId = this.trigger.getAttribute('aria-controls');
    return menuId ? document.getElementById(menuId) : null;
  }

  get sections(): HTMLElement[] {
    let menu = this.menu;
    if (menu) {
      return within(menu).queryAllByRole('group');
    } else {
      return [];
    }
  }

  options(opts: {element?: HTMLElement} = {}): HTMLElement[] {
    let {element = this.menu} = opts;
    let options: HTMLElement[] = [];
    if (element) {
      options = within(element).queryAllByRole('menuitem');
      if (options.length === 0) {
        options = within(element).queryAllByRole('menuitemradio');
        if (options.length === 0) {
          options = within(element).queryAllByRole('menuitemcheckbox');
        }
      }
    }

    return options;
  }

  get submenuTriggers(): HTMLElement[] {
    let options = this.options();
    if (options.length > 0) {
      return options.filter(item => item.getAttribute('aria-haspopup') != null);
    }

    return [];
  }
}
