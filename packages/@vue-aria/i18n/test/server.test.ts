/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {getPackageLocalizationScript} from '../src/server';

describe('i18n server', function () {
  it('generates a script with localized strings', function () {
    let res = getPackageLocalizationScript('en-US', {
      '@vue-aria/button': {
        test: 'foo'
      },
      '@vue-aria/checkbox': {
        test: 'foo'
      }
    });

    expect(res).toBe("window[Symbol.for('react-aria.i18n.locale')]=\"en-US\";{let A=\"foo\";window[Symbol.for('react-aria.i18n.strings')]={'@vue-aria/button':{test:A},'@vue-aria/checkbox':{test:A}};}");
  });
});
