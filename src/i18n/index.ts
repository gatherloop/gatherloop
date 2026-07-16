import { id } from "./id";
import { en } from "./en";

export type Locale = "id" | "en";

export const DEFAULT_LOCALE: Locale = "id";

export const LOCALES: Locale[] = ["id", "en"];

export interface Dictionary {
  backLink: {
    label: string;
  };
  units: {
    minute: string;
    player: string;
  };
  hero: {
    imageAlt: string;
    tagline: string;
    taglineSub: string;
  };
  hargaMain: {
    sectionTitle: string;
    imageAlt: string;
    caption: string;
  };
  infoLinks: {
    ariaLabel: string;
    sectionTitle: string;
    games: string;
    menu: string;
    location: string;
  };
  faq: {
    ariaLabel: string;
    sectionTitle: string;
  };
  footer: {
    instagramAriaLabel: string;
    tiktokAriaLabel: string;
  };
}

const dictionaries: Record<Locale, Dictionary> = { id, en };

export function t(locale: Locale): Dictionary {
  return dictionaries[locale];
}
