/** Prefixes a root-relative path with the configured base path (see astro.config.mjs). */
export function withBase(path: string): string {
  return `${import.meta.env.BASE_URL.replace(/\/$/, "")}${path}`;
}
