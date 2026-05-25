import type { Metadata } from "next";
import "./globals.css";
import { MiddlemanProvider } from "./context/middleman-context";

export const metadata: Metadata = {
  title: "SuaraEkspor",
  description: "Platform AI Ekspor Inklusif untuk UMKM Indonesia",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <MiddlemanProvider>
          {children}
        </MiddlemanProvider>
      </body>
    </html>
  );
}