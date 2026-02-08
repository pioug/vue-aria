import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();

const requiredTestFiles = [
  "packages/@vue-aria/utils/test/mergeProps.test.ts",
  "packages/@vue-aria/ssr/test/useId.test.ts",
  "packages/@vue-aria/focus/test/useFocusVisible.test.ts",
  "packages/@vue-aria/focus/test/useFocusRing.test.ts",
  "packages/@vue-aria/interactions/test/usePress.test.ts",
  "packages/@vue-aria/interactions/test/useKeyboard.test.ts",
  "packages/@vue-aria/interactions/test/useFocus.test.ts",
  "packages/@vue-aria/interactions/test/useFocusWithin.test.ts",
  "packages/@vue-aria/interactions/test/useHover.test.ts",
  "packages/@vue-aria/button/test/useButton.test.ts",
  "packages/@vue-aria/link/test/useLink.test.ts",
  "packages/@vue-aria/label/test/useLabel.test.ts",
  "packages/@vue-aria/label/test/useField.test.ts",
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
