import {act, waitFor, within} from './testing';
import {BaseTester} from "./_base";
import {DialogTesterOpts, UserOpts} from './types';

interface DialogOpenOpts {
  interactionType?: UserOpts['interactionType'];
}

export class DialogTester extends BaseTester {
  private user;
  private _interactionType: UserOpts['interactionType'];
  private _trigger: HTMLElement | undefined;
  private _dialog: HTMLElement | undefined;
  private _overlayType: DialogTesterOpts['overlayType'];

  constructor(opts: DialogTesterOpts) {
    super(opts);
    let {root, user, interactionType, overlayType} = opts;
    this.user = user;
    this._interactionType = interactionType || 'mouse';
    this._overlayType = overlayType || 'modal';

    let trigger = within(root).queryByRole('button');
    if (trigger) {
      this._trigger = trigger;
    } else {
      this._trigger = root;
    }
  }

  setInteractionType(type: UserOpts['interactionType']): void {
    this._interactionType = type;
  }

  async open(opts: DialogOpenOpts = {}): Promise<void> {
    let {interactionType = this._interactionType} = opts;
    let trigger = this.trigger;
    if (!trigger.hasAttribute('disabled')) {
      if (interactionType === 'mouse') {
        await this.user.click(trigger);
      } else if (interactionType === 'touch') {
        await this.user.pointer({target: trigger, keys: '[TouchA]'});
      } else if (interactionType === 'keyboard') {
        act(() => trigger.focus());
        await this.user.keyboard('[Enter]');
      }

      if (this._overlayType === 'popover') {
        await waitFor(() => {
          if (trigger.getAttribute('aria-controls') == null) {
            throw new Error('No aria-controls found on dialog trigger element.');
          } else {
            return true;
          }
        });

        let dialogId = trigger.getAttribute('aria-controls');
        await waitFor(() => {
          if (!dialogId || document.getElementById(dialogId) == null) {
            throw new Error(`Dialog with id of ${dialogId} not found in document.`);
          } else {
            this._dialog = document.getElementById(dialogId)!;
            return true;
          }
        });
      } else {
        let dialog;
        await waitFor(() => {
          dialog = document.querySelector('[role=dialog], [role=alertdialog]');
          if (dialog == null) {
            throw new Error('No dialog of type role="dialog" or role="alertdialog" found after pressing the trigger.');
          } else {
            return true;
          }
        });

        if (dialog && document.activeElement !== this._trigger && dialog.contains(document.activeElement)) {
          this._dialog = dialog;
        } else {
          throw new Error('New modal dialog doesnt contain the active element OR the active element is still the trigger. Uncertain if the proper modal dialog was found');
        }
      }
    }
  }

  async close(): Promise<void> {
    let dialog = this._dialog;
    if (dialog) {
      await this.user.keyboard('[Escape]');
      await waitFor(() => {
        if (document.contains(dialog)) {
          throw new Error('Expected the dialog to not be in the document after closing it.');
        } else {
          this._dialog = undefined;
          return true;
        }
      });
    }
  }

  get trigger(): HTMLElement {
    if (!this._trigger) {
      throw new Error('No trigger element found for dialog.');
    }
    return this._trigger;
  }

  get dialog(): HTMLElement | null {
    return this._dialog && document.contains(this._dialog) ? this._dialog : null;
  }
}
