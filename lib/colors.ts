// Feste Farbe pro Person. Namen werden klein-geschrieben verglichen,
// damit "Emil" und "emil" dieselbe Farbe bekommen.
const USER_COLORS: Record<string, string> = {
  moritz: "#eab308", // Gelb
  julian: "#16a34a", // Grün
  emil: "#2563eb", // Blau
};

// Fallback für unbekannte Namen (neutrales Grau-Blau).
const FALLBACK = "#64748b";

export function userColor(name: string): string {
  return USER_COLORS[name.trim().toLowerCase()] ?? FALLBACK;
}
