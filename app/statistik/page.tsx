"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, type Earning } from "@/lib/supabase";
import { getUser } from "@/lib/user";
import { userColor } from "@/lib/colors";

const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];
const MONTHS_SHORT = [
  "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Dez",
];

function euro(n: number) {
  return n.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
}
function hours(n: number) {
  return `${n.toLocaleString("de-DE", { maximumFractionDigits: 1 })} h`;
}

export default function Statistik() {
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

  // Alle eigenen Einträge auf einmal laden — Datenmenge ist klein.
  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("earnings")
      .select("*")
      .eq("user_name", user);
    if (error) setError(error.message);
    else setRows((data as Earning[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const ym = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthRows = useMemo(
    () => rows.filter((r) => r.earned_on.startsWith(ym)),
    [rows, ym]
  );

  // KPIs für den gewählten Monat
  const kpi = useMemo(() => {
    const verdient = monthRows.reduce((s, r) => s + Number(r.amount), 0);
    const std = monthRows.reduce(
      (s, r) => s + (r.hours != null ? Number(r.hours) : 0),
      0
    );
    // Ø Stundensatz nur aus Einträgen mit Stundenangabe
    const amountFromHourly = monthRows.reduce(
      (s, r) => s + (r.hours != null ? Number(r.amount) : 0),
      0
    );
    const avgRate = std > 0 ? amountFromHourly / std : 0;
    return { verdient, std, avgRate, count: monthRows.length };
  }, [monthRows]);

  // Kategorie-Aufschlüsselung für den gewählten Monat
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of monthRows) {
      map.set(r.category, (map.get(r.category) ?? 0) + Number(r.amount));
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [monthRows]);
  const catMax = categories[0]?.[1] ?? 0;

  // 6-Monats-Verlauf (immer relativ zu heute)
  const trend = useMemo(() => {
    const out: { label: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const total = rows
        .filter((r) => r.earned_on.startsWith(key))
        .reduce((s, r) => s + Number(r.amount), 0);
      out.push({ label: MONTHS_SHORT[d.getMonth()], total });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);
  const trendMax = Math.max(...trend.map((t) => t.total), 1);

  // Gesamt über alle Zeit
  const allTime = rows.reduce((s, r) => s + Number(r.amount), 0);

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
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  if (!user) return null;

  const meColor = userColor(user);

  return (
    <div className="container">
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
          {/* KPI-Karten */}
          <div className="kpi-grid">
            <div className="kpi">
              <span className="kpi-value">{euro(kpi.verdient)}</span>
              <span className="kpi-label">Verdient</span>
            </div>
            <div className="kpi">
              <span className="kpi-value">{hours(kpi.std)}</span>
              <span className="kpi-label">Gearbeitet</span>
            </div>
            <div className="kpi">
              <span className="kpi-value">
                {kpi.avgRate > 0 ? euro(kpi.avgRate) : "–"}
              </span>
              <span className="kpi-label">Ø Stundensatz</span>
            </div>
            <div className="kpi">
              <span className="kpi-value">{kpi.count}</span>
              <span className="kpi-label">Einträge</span>
            </div>
          </div>

          {monthRows.length === 0 && (
            <p className="empty">
              In diesem Monat hast du noch nichts eingetragen.
            </p>
          )}

          {/* Kategorie-Aufschlüsselung */}
          {categories.length > 0 && (
            <div className="stat-card">
              <h3>Nach Kategorie</h3>
              <div className="cat-list">
                {categories.map(([cat, sum]) => (
                  <div key={cat} className="cat-stat">
                    <div className="cat-stat-head">
                      <span className="cat-stat-name">{cat}</span>
                      <span className="cat-stat-amount">{euro(sum)}</span>
                    </div>
                    <div className="bar">
                      <span
                        style={{
                          width: catMax > 0 ? `${(sum / catMax) * 100}%` : "0%",
                          background: meColor,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6-Monats-Verlauf */}
          <div className="stat-card">
            <h3>Letzte 6 Monate</h3>
            <div className="trend">
              {trend.map((t, i) => (
                <div className="trend-col" key={i}>
                  <span className="trend-amount">
                    {t.total > 0 ? Math.round(t.total) + " €" : ""}
                  </span>
                  <div className="trend-bar-wrap">
                    <div
                      className="trend-bar"
                      style={{
                        height: `${(t.total / trendMax) * 100}%`,
                        background: meColor,
                      }}
                    />
                  </div>
                  <span className="trend-label">{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="total-line" style={{ marginTop: 24 }}>
            Insgesamt verdient (alle Monate): <b>{euro(allTime)}</b>
          </p>
        </>
      )}
    </div>
  );
}
