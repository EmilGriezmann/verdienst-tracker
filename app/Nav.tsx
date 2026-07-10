"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

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
      </div>
    </nav>
  );
}
