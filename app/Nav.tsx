"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser, clearUser } from "@/lib/user";

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUserState] = useState<string | null>(null);

  useEffect(() => {
    setUserState(getUser());
  }, [pathname]);

  // Auf der Namensauswahl keine Navigation zeigen.
  if (pathname === "/") return null;

  return (
    <nav className="nav">
      <div className="tabs">
        <Link
          href="/dashboard"
          className={`tab ${pathname === "/dashboard" ? "active" : ""}`}
        >
          Vergleich
        </Link>
        <Link
          href="/statistik"
          className={`tab ${pathname === "/statistik" ? "active" : ""}`}
        >
          Statistik
        </Link>
        <Link
          href="/neu"
          className={`tab ${pathname === "/neu" ? "active" : ""}`}
        >
          Eintragen
        </Link>
        {user && (
          <button
            className="tab-user"
            onClick={() => {
              clearUser();
              router.push("/");
            }}
          >
            {user} · wechseln
          </button>
        )}
      </div>
    </nav>
  );
}
