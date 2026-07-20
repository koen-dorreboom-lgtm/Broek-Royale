import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppChrome } from "@/components/AppChrome";
import { AuthProvider } from "@/providers/AuthProvider";

export const metadata: Metadata = {
  title: { default: "Broek Royale TOTO", template: "%s | Broek Royale TOTO" },
  description: "Voorspel de winnaars van de Broeker Feestweek 2026.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6a0008",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body>
        <AuthProvider>
          <AppChrome>{children}</AppChrome>
        </AuthProvider>
      </body>
    </html>
  );
}
