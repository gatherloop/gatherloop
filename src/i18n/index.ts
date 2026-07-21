import { id } from "./id";
import { en } from "./en";

export type Locale = "id" | "en";

export const DEFAULT_LOCALE: Locale = "id";

export const LOCALES: Locale[] = ["id", "en"];

export interface Dictionary {
  backLink: {
    label: string;
  };
  languageSwitch: {
    ariaLabel: string;
    id: string;
    en: string;
  };
  units: {
    minute: string;
    player: string;
  };
  hero: {
    imageAlt: string;
    tagline: string;
    taglineSub: string;
    reserveButton: string;
    reserveAriaLabel: string;
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
  activities: {
    ariaLabel: string;
    sectionTitle: string;
    prevLabel: string;
    nextLabel: string;
    goToSlideTemplate: string;
  };
  faq: {
    ariaLabel: string;
    sectionTitle: string;
  };
  footer: {
    instagramAriaLabel: string;
    tiktokAriaLabel: string;
  };
  gamesPage: {
    title: string;
    description: string;
    heading: string;
    emptyState: string;
  };
  gameCard: {
    imageAltPrefix: string;
  };
  menuPage: {
    title: string;
    description: string;
    heading: string;
    imageAlt: string;
  };
  gameFilters: {
    panelAriaLabel: string;
    titleLabel: string;
    titlePlaceholder: string;
    tagsLabel: string;
    playersLabel: string;
    playersPlaceholder: string;
    durationLabel: string;
    durationShort: string;
    durationMedium: string;
    durationLong: string;
    ageLabel: string;
    agePlaceholder: string;
    shelfLabel: string;
    allShelvesOption: string;
    resetLabel: string;
    filterLabel: string;
    filterLabelWithCountTemplate: string;
    countAllTemplate: string;
    countFilteredTemplate: string;
  };
  tags: {
    "adu strategi": string;
    "adu cepat": string;
    "adu ketelitian": string;
    "game keluarga": string;
    "kerja sama tim": string;
    "party game": string;
  };
}

const dictionaries: Record<Locale, Dictionary> = { id, en };

export function t(locale: Locale): Dictionary {
  return dictionaries[locale];
}
