import { DEFAULT_LOCALE, type Locale } from "../i18n";

/** Prefixes a root-relative path with the configured base path (see astro.config.mjs). */
export function withBase(path: string): string {
  return `${import.meta.env.BASE_URL.replace(/\/$/, "")}${path}`;
}

/** Prefixes a root-relative path with its locale prefix (if any), then the base path. */
export function localizePath(locale: Locale, path: string): string {
  const localizedPath = locale === DEFAULT_LOCALE ? path : `/${locale}${path}`;
  return withBase(localizedPath);
}
