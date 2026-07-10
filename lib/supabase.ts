import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Praktische Warnung in der Konsole, falls die Werte fehlen — aber KEIN throw.
// Ein throw beim Import würde sonst den Next.js-Build (Prerendering) abbrechen.
// Fehlen die Werte, verhindert ein Platzhalter nur den Crash; echte Aufrufe
// scheitern dann zur Laufzeit sichtbar im Browser.
if (!url || !anonKey) {
  console.warn(
    "[Supabase] Zugangsdaten fehlen. Lokal: .env.local anlegen. " +
      "Auf Vercel: NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY " +
      "in den Project Settings -> Environment Variables setzen."
  );
}

export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-key"
);

// Ein Eintrag in der Tabelle "earnings".
export type Earning = {
  id: string;
  user_name: string;
  category: string;
  amount: number; // immer der Gesamtbetrag in Euro
  hourly_rate: number | null; // gesetzt, wenn nach Stundensatz eingetragen
  hours: number | null; // gesetzt, wenn nach Stundensatz eingetragen
  note: string | null;
  earned_on: string; // Datum im Format YYYY-MM-DD
  created_at: string;
};
