export function isDocsEnv(): boolean {
  return Boolean(process.env.DOCS_ENV);
}
