import { t, type Locale } from "../i18n";

export function formatDuration(locale: Locale, min: number, max: number): string {
  const unit = t(locale).units.minute;
  return min === max ? `${min} ${unit}` : `${min}–${max} ${unit}`;
}

export function formatPlayers(locale: Locale, min: number, max: number): string {
  const unit = t(locale).units.player;
  return min === max ? `${min} ${unit}` : `${min}–${max} ${unit}`;
}

export function formatAge(minAge: number): string {
  return `${minAge}+`;
}
