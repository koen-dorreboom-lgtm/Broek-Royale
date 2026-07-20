"use client";

import Link from "next/link";
import { ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export function AppHeader() {
  const { user } = useAuth();

  return (
    <header className="app-header">
      <Link href="/" className="brand-mark" aria-label="Broek-toto-Royale home">
        <span className="brand-suit" aria-hidden="true">♠</span>
        <span>Broek-toto-Royale</span>
      </Link>
      <Link
        href={user ? "/profiel" : "/inloggen"}
        className="icon-button"
        aria-label={user ? "Ga naar profiel" : "Inloggen"}
      >
        {user ? <UserRound size={22} /> : <ShieldCheck size={22} />}
      </Link>
    </header>
  );
}
