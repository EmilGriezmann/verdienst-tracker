"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { setUser } from "@/lib/user";

export default function NameSelect() {
  const router = useRouter();
  const [names, setNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("name")
      .order("name");
    if (error) setError(error.message);
    else setNames((data ?? []).map((r) => r.name));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function choose(name: string) {
    setUser(name);
    router.push("/dashboard");
  }

  async function addName() {
    const name = newName.trim();
    if (!name) return;
    setError(null);
    const { error } = await supabase.from("users").insert({ name });
    if (error) {
      setError(error.message);
      return;
    }
    choose(name);
  }

  return (
    <div className="center">
      <div className="card" style={{ width: 360 }}>
        <h1>Wer bist du?</h1>
        <p className="subtitle">Wähle deinen Namen, um loszulegen.</p>

        {loading && <p className="hint">Lädt…</p>}

        <div className="name-list">
          {names.map((n) => (
            <button key={n} onClick={() => choose(n)}>
              {n}
            </button>
          ))}
        </div>

        {!loading && names.length === 0 && (
          <p className="hint">Noch niemand da — leg unten den ersten Namen an.</p>
        )}

        <div className="add-name">
          <input
            placeholder="Neuer Name…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addName()}
          />
          <button className="btn-ghost" onClick={addName}>
            Hinzufügen
          </button>
        </div>

        {error && <div className="msg err">{error}</div>}
      </div>
    </div>
  );
}
