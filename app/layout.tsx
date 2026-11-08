// glisse zuerst, damit globals.css darueber noch anpassen kann.
import "glisse/styles.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import Nav from "./Nav";
import Footer from "./Footer";

export const metadata: Metadata = {
  title: "Verdienste",
  description: "Einkünfte eintragen und mit Freunden vergleichen",
  manifest: "/manifest.webmanifest",
  // Sorgt dafür, dass die App vom iPhone-Homescreen im Vollbild startet
  // (ohne Safari-Leisten oben und unten).
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Verdienste",
  },
  // Explizit auch das Apple-eigene Tag setzen — iPhones brauchen es für
  // echtes Vollbild (Next schreibt sonst nur "mobile-web-app-capable").
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  // Homescreen-Icon (dein Bild unter public/icon.png)
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#eef2fb",
  width: "device-width",
  initialScale: 1,
  // erlaubt echtes Vollbild unter dem iPhone-Notch
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // data-theme="light" pinnt glisse auf das helle Thema. Die App ist bewusst
  // nur hell; ohne das waeren die Glas-Elemente im Dark-Mode des Systems
  // dunkel, waehrend der Rest der Seite weiter hell bleibt.
  return (
    <html lang="de" data-theme="light">
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
