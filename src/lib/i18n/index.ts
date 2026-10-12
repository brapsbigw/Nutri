import { pt, Dictionary } from "./dictionaries/pt";
import { en } from "./dictionaries/en";

export type Locale = "pt" | "en";

export const dictionaries: Record<Locale, Dictionary> = {
  pt,
  en,
};

export function getDictionary(locale: Locale = "pt"): Dictionary {
  return dictionaries[locale] || dictionaries.pt;
}

export { pt, en };
export type { Dictionary };
