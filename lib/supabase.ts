import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Hilfreiche Fehlermeldung, falls die .env.local vergessen wurde.
  throw new Error(
    "Supabase-Zugangsdaten fehlen. Lege eine Datei .env.local an (siehe .env.local.example)."
  );
}

export const supabase = createClient(url, anonKey);

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
