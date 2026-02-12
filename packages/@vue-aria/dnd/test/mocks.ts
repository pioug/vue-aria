/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

export class DataTransferItem {
  kind: 'string' | 'file';
  type: string;
  private _data: unknown;

  constructor(type: string, data: unknown, kind: 'string' | 'file' = 'string') {
    this.kind = kind;
    this.type = type;
    this._data = data;
  }

  getAsString(callback: (value: string) => void) {
    if (this.kind === 'string') {
      callback(this._data as string);
    }
  }
}

export class DataTransferItemList {
  _items: DataTransferItem[];

  constructor(items: DataTransferItem[] = []) {
    this._items = items;
  }

  add(data: unknown, type: string) {
    this._items.push(new DataTransferItem(type, data));
  }

  *[Symbol.iterator]() {
    yield* this._items;
  }
}

export class DataTransfer {
  items: DataTransferItemList;
  dropEffect = 'none';
  effectAllowed = 'all';

  constructor() {
    this.items = new DataTransferItemList();
  }

  get types() {
    let types = new Set<string>();
    for (let item of this.items) {
      types.add(item.type);
    }
    return [...types];
  }

  getData(type: string) {
    return this.items._items.find(item => item.kind === 'string' && item.type === type);
  }
}

export class ClipboardEvent extends Event {
  clipboardData: DataTransfer;

  constructor(type: string, init: {clipboardData: DataTransfer}) {
    super(type, {
      bubbles: true,
      cancelable: true,
      composed: true
    });
    this.clipboardData = init.clipboardData;
  }
}
