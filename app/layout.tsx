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
  themeColor: "#ffffff",
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
  return (
    <html lang="de">
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
