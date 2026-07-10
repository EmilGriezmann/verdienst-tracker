# Verdienste-Tracker

Eine kleine Website, auf der du und deine Freunde eure Einkünfte eintragen und
pro Monat vergleichen könnt. Gebaut mit **Next.js** + **Supabase**.

## Was die Seite kann

- **Namensauswahl** (`/`) — beim Öffnen wählst du deinen Namen. Kein Passwort.
- **Eintragen** (`/neu`) — Kategorie wählen und entweder einen **Gesamtbetrag**
  oder einen **Stundensatz × Stunden** eingeben. Der Betrag wird automatisch
  ausgerechnet.
- **Vergleich** (`/dashboard`) — Rangliste aller Freunde für den Monat. Mit den
  Pfeilen `‹ ›` blätterst du zu früheren Monaten zurück.

---

## Einrichtung — Schritt für Schritt

### 1. Supabase-Projekt anlegen (kostenlos)

1. Geh auf <https://supabase.com> und erstelle ein Konto.
2. Klick auf **New Project**, gib einen Namen + Passwort ein, Region **Central
   EU (Frankfurt)**. Warte ~1 Minute, bis es fertig ist.

### 2. Tabellen anlegen

1. Im Supabase-Projekt links auf **SQL Editor** → **New query**.
2. Öffne die Datei [`supabase-schema.sql`](./supabase-schema.sql), kopiere den
   ganzen Inhalt hinein und klick auf **Run**.
3. Fertig — es gibt jetzt die Tabellen `users` und `earnings`.

### 3. Zugangsdaten in die App eintragen

1. In Supabase links auf **Project Settings** (Zahnrad) → **API**.
2. Kopiere **Project URL** und den **anon public** Key.
3. Im Projektordner: kopiere `.env.local.example` zu `.env.local` und trag die
   beiden Werte ein:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://deinprojekt.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
   ```

### 4. Starten

```bash
cd verdienste-tracker
npm install
npm run dev
```

Dann im Browser **http://localhost:3000** öffnen.

---

## Online stellen (damit Freunde drauf können)

Am einfachsten mit **Vercel**:

1. Lade den Ordner als Repo zu GitHub hoch.
2. Geh auf <https://vercel.com>, **Add New → Project**, wähle das Repo.
3. Trage bei **Environment Variables** dieselben zwei Werte wie in `.env.local`
   ein.
4. **Deploy** klicken → du bekommst eine Adresse wie
   `dein-projekt.vercel.app`, die du mit Freunden teilen kannst.

---

## Anpassen

- **Kategorien** ändern: [`lib/categories.ts`](./lib/categories.ts)
- **Farben** ändern: oben in [`app/globals.css`](./app/globals.css) (die
  `--blue…`-Variablen)
