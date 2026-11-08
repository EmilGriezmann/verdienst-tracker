"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, type Earning } from "@/lib/supabase";
import { getUser } from "@/lib/user";
import { CATEGORIES } from "@/lib/categories";
import { Button, Glass, Input, SegmentedControl } from "glisse";

type Mode = "total" | "hourly";

function today() {
  return new Date().toISOString().slice(0, 10);
}
function euro(n: number) {
  return n.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
}
function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export default function NewEntry() {
  const router = useRouter();
  const [user, setUserState] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>("total");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [total, setTotal] = useState("");
  const [rate, setRate] = useState("");
  const [hours, setHours] = useState("");
  const [date, setDate] = useState(today());

  // null = neuer Eintrag, sonst wird der Eintrag mit dieser id bearbeitet
  const [editingId, setEditingId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [rows, setRows] = useState<Earning[]>([]);

  useEffect(() => {
    const u = getUser();
    if (!u) router.push("/");
    else setUserState(u);
  }, [router]);

  // Eigene Einträge laden, neueste zuerst
  const loadRows = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("earnings")
      .select("*")
      .eq("user_name", user)
      .order("earned_on", { ascending: false })
      .order("created_at", { ascending: false });
    setRows((data as Earning[]) ?? []);
  }, [user]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const computed =
    mode === "hourly"
      ? (parseFloat(rate || "0") || 0) * (parseFloat(hours || "0") || 0)
      : parseFloat(total || "0") || 0;

  const canSave =
    computed > 0 &&
    (mode === "total"
      ? total.trim() !== ""
      : rate.trim() !== "" && hours.trim() !== "");

  function resetForm() {
    setEditingId(null);
    setMode("total");
    setCategory(CATEGORIES[0]);
    setTotal("");
    setRate("");
    setHours("");
    setDate(today());
  }

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
      earned_on: date,
    };

    const { error } = editingId
      ? await supabase.from("earnings").update(row).eq("id", editingId)
      : await supabase.from("earnings").insert(row);

    setSaving(false);

    if (error) {
      setMsg({ ok: false, text: error.message });
      return;
    }
    setMsg({
      ok: true,
      text: editingId ? "Aktualisiert! ✔" : "Gespeichert! ✔",
    });
    resetForm();
    loadRows();
  }

  // Eintrag zum Bearbeiten ins Formular laden
  function startEdit(e: Earning) {
    setEditingId(e.id);
    setCategory(e.category);
    setDate(e.earned_on);
    if (e.hours != null) {
      setMode("hourly");
      setRate(String(Number(e.hourly_rate)));
      setHours(String(Number(e.hours)));
      setTotal("");
    } else {
      setMode("total");
      setTotal(String(Number(e.amount)));
      setRate("");
      setHours("");
    }
    setMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(e: Earning) {
    if (!confirm(`Eintrag „${e.category}" (${euro(Number(e.amount))}) löschen?`))
      return;
    const { error } = await supabase.from("earnings").delete().eq("id", e.id);
    if (error) {
      setMsg({ ok: false, text: error.message });
      return;
    }
    if (editingId === e.id) resetForm();
    loadRows();
  }

  if (!user) return null;

  return (
    <div className="container">
      <Glass className="card">
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
        <SegmentedControl
          className="toggle-seg"
          aria-label="Wie rechnest du?"
          items={[
            { value: "total", label: "Gesamtbetrag" },
            { value: "hourly", label: "Stundensatz" },
          ]}
          value={mode}
          onValueChange={(v) => setMode(v as Mode)}
        />

        {mode === "total" ? (
          <div className="field">
            <label>Betrag (€)</label>
            <Input
              type="number"
              inputMode="decimal"
              placeholder="z. B. 120"
              value={total}
              onValueChange={setTotal}
            />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="field">
                <label>Stundensatz (€)</label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="z. B. 15"
                  value={rate}
                  onValueChange={setRate}
                />
              </div>
              <div className="field">
                <label>Stunden</label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="z. B. 8"
                  value={hours}
                  onValueChange={setHours}
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

        <div className="field" style={{ marginTop: 6 }}>
          <label>Datum</label>
          <Input type="date" value={date} onValueChange={setDate} />
        </div>

        <Button
          className="btn-save"
          variant="filled"
          onClick={save}
          disabled={!canSave || saving}
        >
          {saving
            ? "Speichert…"
            : editingId
              ? "Änderungen speichern"
              : "Speichern"}
        </Button>

        {editingId && (
          <Button className="btn-cancel" onClick={resetForm}>
            Abbrechen
          </Button>
        )}

        {msg && (
          <div className={`msg ${msg.ok ? "ok" : "err"}`}>{msg.text}</div>
        )}
      </Glass>

      {/* Vergangene Sessions */}
      <div className="sessions">
        <h3>Deine Einträge</h3>
        {rows.length === 0 ? (
          <p className="empty">Noch keine Einträge.</p>
        ) : (
          rows.map((e) => (
            <Glass
              key={e.id}
              className={`session ${editingId === e.id ? "editing" : ""}`}
            >
              <div className="session-main">
                <div className="session-top">
                  <span className="session-cat">{e.category}</span>
                  <span className="session-amount">{euro(Number(e.amount))}</span>
                </div>
                <div className="session-sub">
                  {formatDate(e.earned_on)}
                  {e.hours != null &&
                    ` · ${Number(e.hourly_rate)} €/h × ${Number(e.hours)} h`}
                  {e.note && ` · ${e.note}`}
                </div>
              </div>
              <div className="session-actions">
                <Button
                  onClick={() => startEdit(e)}
                  aria-label="Bearbeiten"
                  icon={<span aria-hidden>✏️</span>}
                />
                <Button
                  onClick={() => remove(e)}
                  aria-label="Löschen"
                  destructive
                  icon={<span aria-hidden>🗑️</span>}
                />
              </div>
            </Glass>
          ))
        )}
      </div>
    </div>
  );
}
