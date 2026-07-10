"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser, clearUser } from "@/lib/user";
import { userColor } from "@/lib/colors";

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUserState] = useState<string | null>(null);

  useEffect(() => {
    setUserState(getUser());
  }, [pathname]);

  // Auf der Namensauswahl keinen Footer zeigen.
  if (pathname === "/" || !user) return null;

  return (
    <footer className="footer">
      <span className="footer-who">
        <span
          className="dot"
          style={{ background: userColor(user) }}
          aria-hidden
        />
        Angemeldet als <b>{user}</b>
      </span>
      <button
        className="btn-ghost footer-switch"
        onClick={() => {
          clearUser();
          router.push("/");
        }}
      >
        Wechseln
      </button>
    </footer>
  );
}
