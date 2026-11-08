"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TabBar } from "glisse";

// Die Reiter als Daten — die TabBar von glisse erwartet eine Liste.
// `href` macht aus jedem Reiter einen echten Link, `link={Link}` sorgt dafuer,
// dass dafuer der Next-Router statt eines harten Seitenwechsels benutzt wird.
const TABS = [
  { value: "/dashboard", label: "Vergleich", href: "/dashboard" },
  { value: "/statistik", label: "Statistik", href: "/statistik" },
  { value: "/neu", label: "Eintragen", href: "/neu" },
];

export default function Nav() {
  const pathname = usePathname();

  // Auf der Namensauswahl keine Navigation zeigen.
  if (pathname === "/") return null;

  return (
    <nav className="nav">
      <TabBar
        items={TABS}
        value={TABS.some((t) => t.value === pathname) ? pathname : null}
        link={Link}
        aria-label="Hauptnavigation"
      />
    </nav>
  );
}
