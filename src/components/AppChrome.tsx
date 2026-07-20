"use client";

import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";

const QUIET_ROUTES = ["/inloggen", "/registreren"];

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isQuietRoute = QUIET_ROUTES.includes(pathname);

  return (
    <div className={`app-frame ${isQuietRoute ? "app-frame--quiet" : ""}`}>
      {!isQuietRoute && <AppHeader />}
      <main className="app-main">{children}</main>
      {!isQuietRoute && <BottomNavigation />}
    </div>
  );
}
