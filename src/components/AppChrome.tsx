"use client";

import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { SiteFooter } from "@/components/SiteFooter";

const QUIET_ROUTES = ["/inloggen", "/registreren", "/wachtwoord-vergeten", "/wachtwoord-wijzigen", "/auth/herstellen"];

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isQuietRoute = QUIET_ROUTES.includes(pathname);

  return (
    <div className={`app-frame ${isQuietRoute ? "app-frame--quiet" : ""}`}>
      {!isQuietRoute && <AppHeader />}
      <main className="app-main">{children}<SiteFooter /></main>
      {!isQuietRoute && <BottomNavigation />}
    </div>
  );
}
