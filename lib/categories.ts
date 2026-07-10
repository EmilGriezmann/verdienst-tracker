// Zentrale Liste der Kategorien. Hier einfach ergänzen oder umbenennen.
export const CATEGORIES = [
  "Minijob",
  "Gartenarbeit",
  "CSSBuy",
  "Online",
  "Sonstiges",
] as const;

export type Category = (typeof CATEGORIES)[number];
