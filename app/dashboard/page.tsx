"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, type Earning } from "@/lib/supabase";
import { getUser } from "@/lib/user";

const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

function euro(n: number) {
  return n.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
}

// erster und letzter Tag eines Monats als YYYY-MM-DD
function monthRange(year: number, month: number) {
  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 0));
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(start), to: fmt(end) };
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-basiert

  const [rows, setRows] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) router.push("/");
    else setUser(u);
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { from, to } = monthRange(year, month);
    const { data, error } = await supabase
      .from("earnings")
      .select("*")
      .gte("earned_on", from)
      .lte("earned_on", to);
    if (error) setError(error.message);
    else setRows((data as Earning[]) ?? []);
    setLoading(false);
  }, [year, month]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  // Summe pro Person
  const perPerson = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      map.set(r.user_name, (map.get(r.user_name) ?? 0) + Number(r.amount));
    }
    return [...map.entries()]
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [rows]);

  // Gearbeitete Stunden pro Person (nur Einträge mit Stundenangabe)
  const perPersonHours = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      if (r.hours == null) continue;
      map.set(r.user_name, (map.get(r.user_name) ?? 0) + Number(r.hours));
    }
    return [...map.entries()]
      .map(([name, hours]) => ({ name, hours }))
      .sort((a, b) => b.hours - a.hours);
  }, [rows]);

  // Summe pro Kategorie (nur für die eigene Person)
  const myCategories = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      if (r.user_name !== user) continue;
      map.set(r.category, (map.get(r.category) ?? 0) + Number(r.amount));
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows, user]);

  const grandTotal = perPerson.reduce((s, p) => s + p.total, 0);
  const max = perPerson[0]?.total ?? 0;
  const maxHours = perPersonHours[0]?.hours ?? 0;

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }

  // Nicht in die Zukunft blättern
  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth();

  if (!user) return null;

  return (
    <div className="container">
      <h1>Vergleich</h1>
      <p className="subtitle">Wer hat diesen Monat am meisten verdient?</p>

      <div className="month-switch">
        <button onClick={prevMonth} aria-label="Vorheriger Monat">
          ‹
        </button>
        <span className="label">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          aria-label="Nächster Monat"
        >
          ›
        </button>
      </div>

      {loading && <p className="empty">Lädt…</p>}
      {error && <div className="msg err">{error}</div>}

      {!loading && !error && (
        <>
          <p className="total-line">
            Zusammen verdient: <b>{euro(grandTotal)}</b>
          </p>

          {perPerson.length === 0 ? (
            <p className="empty">Für diesen Monat gibt es noch keine Einträge.</p>
          ) : (
            <div className="rank">
              {perPerson.map((p, i) => (
                <div
                  key={p.name}
                  className={`rank-row ${i === 0 ? "first" : ""} ${
                    p.name === user ? "me" : ""
                  }`}
                >
                  <span className="rank-pos">{i + 1}</span>
                  <span className="rank-name">
                    {p.name}
                    {p.name === user && <span className="tag">du</span>}
                  </span>
                  <span className="rank-amount">{euro(p.total)}</span>
                  <div className="bar">
                    <span
                      style={{
                        width: max > 0 ? `${(p.total / max) * 100}%` : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {perPersonHours.length > 0 && (
            <div className="hours-compare">
              <h3>Gearbeitete Stunden</h3>
              {perPersonHours.map((p) => (
                <div
                  className={`hours-row ${p.name === user ? "me" : ""}`}
                  key={p.name}
                >
                  <span className="hours-name">
                    {p.name}
                    {p.name === user && <span className="tag">du</span>}
                  </span>
                  <div className="hours-bar">
                    <span
                      style={{
                        width:
                          maxHours > 0
                            ? `${(p.hours / maxHours) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                  <span className="hours-val">
                    {p.hours.toLocaleString("de-DE")} h
                  </span>
                </div>
              ))}
            </div>
          )}

          {myCategories.length > 0 && (
            <div className="breakdown">
              <h3>Deine Einkünfte nach Kategorie</h3>
              {myCategories.map(([cat, sum]) => (
                <div className="cat-row" key={cat}>
                  <span>{cat}</span>
                  <span>{euro(sum)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
