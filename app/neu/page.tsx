"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getUser } from "@/lib/user";
import { CATEGORIES } from "@/lib/categories";

type Mode = "total" | "hourly";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function NewEntry() {
  const router = useRouter();
  const [user, setUserState] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>("total");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [total, setTotal] = useState("");
  const [rate, setRate] = useState("");
  const [hours, setHours] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(today());

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) router.push("/");
    else setUserState(u);
  }, [router]);

  // Berechneter Gesamtbetrag im Stundensatz-Modus.
  const computed =
    mode === "hourly"
      ? (parseFloat(rate || "0") || 0) * (parseFloat(hours || "0") || 0)
      : parseFloat(total || "0") || 0;

  const canSave =
    computed > 0 &&
    (mode === "total"
      ? total.trim() !== ""
      : rate.trim() !== "" && hours.trim() !== "");

  async function save() {
    if (!user || !canSave) return;
    setSaving(true);
    setMsg(null);

    const row = {
      user_name: user,
      category,
      amount: Number(computed.toFixed(2)),
      hourly_rate: mode === "hourly" ? parseFloat(rate) : null,
      hours: mode === "hourly" ? parseFloat(hours) : null,
      note: note.trim() || null,
      earned_on: date,
    };

    const { error } = await supabase.from("earnings").insert(row);
    setSaving(false);

    if (error) {
      setMsg({ ok: false, text: error.message });
      return;
    }
    setMsg({ ok: true, text: "Gespeichert! ✔" });
    // Formular zurücksetzen
    setTotal("");
    setRate("");
    setHours("");
    setNote("");
  }

  if (!user) return null;

  return (
    <div className="container">
      <h1>Neue Einkunft</h1>
      <p className="subtitle">Trag ein, was du verdient hast.</p>

      <div className="card">
        {/* Kategorie */}
        <div className="field">
          <label>Kategorie</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Umschalter Gesamtbetrag / Stundensatz */}
        <label>Wie rechnest du?</label>
        <div className="toggle">
          <button
            className={mode === "total" ? "on" : ""}
            onClick={() => setMode("total")}
          >
            Gesamtbetrag
          </button>
          <button
            className={mode === "hourly" ? "on" : ""}
            onClick={() => setMode("hourly")}
          >
            Stundensatz
          </button>
        </div>

        {mode === "total" ? (
          <div className="field">
            <label>Betrag (€)</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="z. B. 120"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
            />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="field">
                <label>Stundensatz (€)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="z. B. 15"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Stunden</label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="z. B. 8"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </div>
            </div>
            {computed > 0 && (
              <div className="result">
                = {computed.toLocaleString("de-DE", { minimumFractionDigits: 2 })}{" "}
                €
              </div>
            )}
          </>
        )}

        <div className="row" style={{ marginTop: 6 }}>
          <div className="field">
            <label>Datum</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Notiz (optional)</label>
            <input
              placeholder="z. B. Kellnern Samstag"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <button className="btn" onClick={save} disabled={!canSave || saving}>
          {saving ? "Speichert…" : "Speichern"}
        </button>

        {msg && (
          <div className={`msg ${msg.ok ? "ok" : "err"}`}>{msg.text}</div>
        )}
      </div>
    </div>
  );
}
