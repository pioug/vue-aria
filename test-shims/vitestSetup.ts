const ignoredWarnFragments = [
  'inject() can only be used inside setup() or functional components.',
  'onScopeDispose() is called when there is no active effect scope to be associated with.'
];

const ignoredErrorFragments = [
  'React does not recognize the',
  'Received `true` for a non-boolean attribute',
  'If you want to write it to the DOM, pass a string instead'
];

const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args: unknown[]) => {
  const text = args.map((value) => String(value)).join(' ');
  if (ignoredWarnFragments.some((fragment) => text.includes(fragment))) {
    return;
  }
  originalWarn(...args);
};

console.error = (...args: unknown[]) => {
  const text = args.map((value) => String(value)).join(' ');
  if (ignoredErrorFragments.some((fragment) => text.includes(fragment))) {
    return;
  }
  originalError(...args);
};
