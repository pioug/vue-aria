import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function parsePackageName(argument) {
  if (!argument) {
    fail("Missing package name. Usage: npm run scaffold:spectrum-package -- <package-name>");
  }

  const trimmed = argument.trim();
  if (!/^[a-z0-9-]+$/.test(trimmed)) {
    fail("Package name must contain only lowercase letters, numbers, and dashes.");
  }

  return trimmed;
}

function ensureDirectory(absolutePath) {
  fs.mkdirSync(absolutePath, { recursive: true });
}

function writeFileIfMissing(absolutePath, content) {
  if (fs.existsSync(absolutePath)) {
    fail(`Refusing to overwrite existing file: ${absolutePath}`);
  }

  fs.writeFileSync(absolutePath, content, "utf8");
}

const root = process.cwd();
const packageName = parsePackageName(process.argv[2]);
const packageDir = path.join(root, "packages", "@vue-spectrum", packageName);
const docsFile = path.join(root, "docs", "spectrum", `${packageName}.md`);

if (fs.existsSync(packageDir)) {
  fail(`Package already exists: ${path.relative(root, packageDir)}`);
}

if (fs.existsSync(docsFile)) {
  fail(`Docs page already exists: ${path.relative(root, docsFile)}`);
}

ensureDirectory(path.join(packageDir, "src"));
ensureDirectory(path.join(packageDir, "test"));
ensureDirectory(path.dirname(docsFile));

writeFileIfMissing(
  path.join(packageDir, "package.json"),
  JSON.stringify(
    {
      name: `@vue-spectrum/${packageName}`,
      version: "0.1.0",
      private: true,
      type: "module",
      main: "src/index.ts",
    },
    null,
    2
  ) + "\n"
);

const symbolName = packageName
  .split("-")
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join("");

writeFileIfMissing(
  path.join(packageDir, "src", "index.ts"),
  `export interface ${symbolName}PackageMeta {\n  packageName: string;\n}\n\nexport const ${symbolName}PackageMeta: ${symbolName}PackageMeta = {\n  packageName: \"@vue-spectrum/${packageName}\",\n};\n`
);

writeFileIfMissing(
  path.join(packageDir, "test", `${packageName}.test.ts`),
  `import { describe, expect, it } from "vitest";\nimport { ${symbolName}PackageMeta } from "../src";\n\ndescribe("@vue-spectrum/${packageName}", () => {\n  it("exposes package metadata", () => {\n    expect(${symbolName}PackageMeta.packageName).toBe("@vue-spectrum/${packageName}");\n  });\n});\n`
);

writeFileIfMissing(
  docsFile,
  `# @vue-spectrum/${packageName}\n\nScaffolded package placeholder for the Spectrum migration.\n\n## Status\n\n- Scaffolded by \`npm run scaffold:spectrum-package -- ${packageName}\`\n- Replace this page with real API documentation when implementation starts.\n`
);

console.log(`Scaffolded @vue-spectrum/${packageName}:`);
console.log(`- ${path.relative(root, path.join(packageDir, "package.json"))}`);
console.log(`- ${path.relative(root, path.join(packageDir, "src", "index.ts"))}`);
console.log(`- ${path.relative(root, path.join(packageDir, "test", `${packageName}.test.ts`))}`);
console.log(`- ${path.relative(root, docsFile)}`);
