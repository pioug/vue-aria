import {act, within} from './testing';
import {BaseTester} from "./_base";
import {getAltKey, getMetaKey, pressElement, triggerLongPress} from './events';
import {ListBoxTesterOpts, UserOpts} from './types';

interface ListBoxToggleOptionOpts {
  interactionType?: UserOpts['interactionType'];
  option: number | string | HTMLElement;
  keyboardActivation?: 'Space' | 'Enter';
  needsLongPress?: boolean;
  selectionBehavior?: 'toggle' | 'replace';
}

interface ListBoxOptionActionOpts extends Omit<ListBoxToggleOptionOpts, 'keyboardActivation' | 'needsLongPress'> {
  needsDoubleClick?: boolean;
}

export class ListBoxTester extends BaseTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _advanceTimer: UserOpts['advanceTimer'];
  private _listbox: HTMLElement;

  constructor(opts: ListBoxTesterOpts) {
    super(opts);
    let {root, user, interactionType, advanceTimer} = opts;
    this.user = user;
    this._interactionType = interactionType || 'mouse';
    this._listbox = root;
    this._advanceTimer = advanceTimer;
  }

  setInteractionType(type: UserOpts['interactionType']): void {
    this._interactionType = type;
  }

  findOption(opts: {optionIndexOrText: number | string}): HTMLElement {
    let {optionIndexOrText} = opts;

    let option;
    let options = this.options();

    if (typeof optionIndexOrText === 'number') {
      option = options[optionIndexOrText];
    } else if (typeof optionIndexOrText === 'string') {
      option = (within(this.listbox!).getByText(optionIndexOrText).closest('[role=option]')) as HTMLElement;
    }

    return option;
  }

  private async keyboardNavigateToOption(opts: {option: HTMLElement, selectionOnNav?: 'default' | 'none'}) {
    let {option, selectionOnNav = 'default'} = opts;
    let altKey = getAltKey();
    let options = this.options();
    let targetIndex = options.indexOf(option);
    if (targetIndex === -1) {
      throw new Error('Option provided is not in the listbox');
    }

    if (document.activeElement !== this._listbox && !this._listbox.contains(document.activeElement)) {
      act(() => this._listbox.focus());
      await this.user.keyboard(`${selectionOnNav === 'none' ? `[${altKey}>]` : ''}[ArrowDown]${selectionOnNav === 'none' ? `[/${altKey}]` : ''}`);
    }

    let currIndex = options.indexOf(document.activeElement as HTMLElement);
    if (currIndex === -1) {
      throw new Error('ActiveElement is not in the listbox');
    }

    let direction = targetIndex > currIndex ? 'down' : 'up';
    if (selectionOnNav === 'none') {
      await this.user.keyboard(`[${altKey}>]`);
    }
    for (let i = 0; i < Math.abs(targetIndex - currIndex); i++) {
      await this.user.keyboard(`[${direction === 'down' ? 'ArrowDown' : 'ArrowUp'}]`);
    }
    if (selectionOnNav === 'none') {
      await this.user.keyboard(`[/${altKey}]`);
    }
  };

  async toggleOptionSelection(opts: ListBoxToggleOptionOpts): Promise<void> {
    let {
      option,
      needsLongPress,
      keyboardActivation = 'Enter',
      interactionType = this._interactionType,
      selectionBehavior = 'toggle'
    } = opts;

    let altKey = getAltKey();
    let metaKey = getMetaKey();

    if (typeof option === 'string' || typeof option === 'number') {
      option = this.findOption({optionIndexOrText: option});
    }

    if (!option) {
      throw new Error('Target option not found in the listbox.');
    }

    if (interactionType === 'keyboard') {
      if (option?.getAttribute('aria-disabled') === 'true') {
        return;
      }

      await this.keyboardNavigateToOption({option, selectionOnNav: selectionBehavior === 'replace' ? 'none' : 'default'});
      if (selectionBehavior === 'replace') {
        await this.user.keyboard(`[${altKey}>]`);
      }
      await this.user.keyboard(`[${keyboardActivation}]`);
      if (selectionBehavior === 'replace') {
        await this.user.keyboard(`[/${altKey}]`);
      }
    } else {
      if (needsLongPress && interactionType === 'touch') {
        if (this._advanceTimer == null) {
          throw new Error('No advanceTimers provided for long press.');
        }
        await triggerLongPress({element: option, advanceTimer: this._advanceTimer, pointerOpts: {pointerType: 'touch'}});
      } else {
        if (selectionBehavior === 'replace' && interactionType !== 'touch') {
          await this.user.keyboard(`[${metaKey}>]`);
        }
        await pressElement(this.user, option, interactionType);
        if (selectionBehavior === 'replace' && interactionType !== 'touch') {
          await this.user.keyboard(`[/${metaKey}]`);
        }
      }
    }
  }

  async triggerOptionAction(opts: ListBoxOptionActionOpts): Promise<void> {
    let {
      option,
      needsDoubleClick,
      interactionType = this._interactionType
    } = opts;

    if (typeof option === 'string' || typeof option === 'number') {
      option = this.findOption({optionIndexOrText: option});
    }

    if (!option) {
      throw new Error('Target option not found in the listbox.');
    }

    if (needsDoubleClick) {
      await this.user.dblClick(option);
    } else if (interactionType === 'keyboard') {
      if (option?.getAttribute('aria-disabled') === 'true') {
        return;
      }

      await this.keyboardNavigateToOption({option, selectionOnNav: 'none'});
      await this.user.keyboard('[Enter]');
    } else {
      await pressElement(this.user, option, interactionType);
    }
  }

  get listbox(): HTMLElement {
    return this._listbox;
  }

  options(opts: {element?: HTMLElement} = {}): HTMLElement[] {
    let {element = this._listbox} = opts;
    let options = [];
    if (element) {
      options = within(element).queryAllByRole('option');
    }
    return options;
  }

  get selectedOptions(): HTMLElement[] {
    return this.options().filter(row => row.getAttribute('aria-selected') === 'true');
  }

  get sections(): HTMLElement[] {
    return within(this._listbox).queryAllByRole('group');
  }
}
