import "./globals.css";
import type { Metadata } from "next";
import Nav from "./Nav";

export const metadata: Metadata = {
  title: "Verdienste-Tracker",
  description: "Einkünfte eintragen und mit Freunden vergleichen",
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
      </body>
    </html>
  );
}
