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
      </head>
      <body>
        <MiddlemanProvider>
          {children}
        </MiddlemanProvider>
      </body>
    </html>
  );
}