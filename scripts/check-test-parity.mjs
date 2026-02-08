import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();

const requiredTestFiles = [
  "packages/@vue-aria/utils/test/mergeProps.test.ts",
  "packages/@vue-aria/utils/test/filterDOMProps.test.ts",
  "packages/@vue-aria/utils/test/nodeContains.test.ts",
  "packages/@vue-aria/utils/test/router.test.ts",
  "packages/@vue-aria/utils/test/useDescription.test.ts",
  "packages/@vue-aria/utils/test/useErrorMessage.test.ts",
  "packages/@vue-aria/ssr/test/useId.test.ts",
  "packages/@vue-aria/ssr/test/ssrProvider.test.ts",
  "packages/@vue-aria/live-announcer/test/liveAnnouncer.test.ts",
  "packages/@vue-aria/i18n/test/useLocale.test.ts",
  "packages/@vue-aria/focus/test/useFocusVisible.test.ts",
  "packages/@vue-aria/focus/test/useFocusRing.test.ts",
  "packages/@vue-aria/interactions/test/usePress.test.ts",
  "packages/@vue-aria/interactions/test/useKeyboard.test.ts",
  "packages/@vue-aria/interactions/test/useFocus.test.ts",
  "packages/@vue-aria/interactions/test/useFocusWithin.test.ts",
  "packages/@vue-aria/interactions/test/useHover.test.ts",
  "packages/@vue-aria/interactions/test/useLongPress.test.ts",
  "packages/@vue-aria/interactions/test/useMove.test.ts",
  "packages/@vue-aria/interactions/test/useInteractOutside.test.ts",
  "packages/@vue-aria/button/test/useButton.test.ts",
  "packages/@vue-aria/button/test/useToggleButton.test.ts",
  "packages/@vue-aria/checkbox/test/useCheckbox.test.ts",
  "packages/@vue-aria/checkbox/test/useCheckboxGroup.test.ts",
  "packages/@vue-aria/radio/test/useRadioGroup.test.ts",
  "packages/@vue-aria/radio/test/useRadio.test.ts",
  "packages/@vue-aria/switch/test/useSwitch.test.ts",
  "packages/@vue-aria/tabs/test/useTabListState.test.ts",
  "packages/@vue-aria/tabs/test/useTabList.test.ts",
  "packages/@vue-aria/tabs/test/useTab.test.ts",
  "packages/@vue-aria/tabs/test/useTabPanel.test.ts",
  "packages/@vue-aria/tabs/test/useTabs.test.ts",
  "packages/@vue-aria/slider/test/useSlider.test.ts",
  "packages/@vue-aria/slider/test/useSliderThumb.test.ts",
  "packages/@vue-aria/slider/test/useSliderState.test.ts",
  "packages/@vue-aria/progress/test/useProgressBar.test.ts",
  "packages/@vue-aria/progress/test/useProgressCircle.test.ts",
  "packages/@vue-aria/meter/test/useMeter.test.ts",
  "packages/@vue-aria/datefield/test/useDateField.test.ts",
  "packages/@vue-aria/datefield/test/useDateSegment.test.ts",
  "packages/@vue-aria/datepicker/test/useDatePickerGroup.test.ts",
  "packages/@vue-aria/datepicker/test/useDatePicker.test.ts",
  "packages/@vue-aria/datepicker/test/useDateRangePicker.test.ts",
  "packages/@vue-aria/datepicker/test/useTimeField.test.ts",
  "packages/@vue-aria/calendar/test/useCalendar.test.ts",
  "packages/@vue-aria/calendar/test/useRangeCalendar.test.ts",
  "packages/@vue-aria/calendar/test/useCalendarCell.test.ts",
  "packages/@vue-aria/breadcrumbs/test/useBreadcrumbItem.test.ts",
  "packages/@vue-aria/disclosure/test/useDisclosureState.test.ts",
  "packages/@vue-aria/disclosure/test/useDisclosureGroupState.test.ts",
  "packages/@vue-aria/disclosure/test/useAccordionItem.test.ts",
  "packages/@vue-aria/disclosure/test/useDisclosure.test.ts",
  "packages/@vue-aria/collections/test/buildCollection.test.ts",
  "packages/@vue-aria/listbox/test/useListBoxState.test.ts",
  "packages/@vue-aria/listbox/test/useListBox.test.ts",
  "packages/@vue-aria/listbox/test/useOption.test.ts",
  "packages/@vue-aria/listbox/test/useListBoxSection.test.ts",
  "packages/@vue-aria/selection/test/useListKeyboardDelegate.test.ts",
  "packages/@vue-aria/selection/test/useTypeSelect.test.ts",
  "packages/@vue-aria/link/test/useLink.test.ts",
  "packages/@vue-aria/label/test/useLabel.test.ts",
  "packages/@vue-aria/label/test/useField.test.ts",
  "packages/@vue-aria/textfield/test/useTextField.test.ts",
  "packages/@vue-aria/searchfield/test/useSearchField.test.ts",
  "packages/@vue-aria/select/test/useSelectState.test.ts",
  "packages/@vue-aria/select/test/useSelect.test.ts",
  "packages/@vue-aria/numberfield/test/useNumberField.test.ts",
  "packages/@vue-aria/spinbutton/test/useSpinButton.test.ts",
  "packages/@vue-aria/separator/test/useSeparator.test.ts",
  "packages/@vue-aria/visually-hidden/test/useVisuallyHidden.test.ts",
];

const missing = requiredTestFiles.filter((file) => {
  const absolute = path.join(root, file);
  return !fs.existsSync(absolute);
});

if (missing.length > 0) {
  console.error("Parity check failed. Missing test files:");
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log("Parity check passed for currently ported modules.");
