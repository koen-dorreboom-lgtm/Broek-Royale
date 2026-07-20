"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export function AppHeader() {
  const { user } = useAuth();

  return (
    <header className="app-header">
      <Link href="/" className="brand-mark" aria-label="Broek Royale TOTO home">
        <Image
          src="/design/broek-royale-logo-transparent.png"
          alt=""
          width={36}
          height={39}
          className="brand-logo"
          priority
        />
        <span>Broek Royale TOTO</span>
      </Link>
      <Link
        href={user ? "/profiel" : "/inloggen"}
        className="icon-button"
        aria-label={user ? "Ga naar profiel" : "Inloggen"}
      >
        {user?.avatarUrl ? (
          <span className="header-avatar" style={{ backgroundImage: `url(${user.avatarUrl})` }} role="img" aria-label={`Profielfoto van ${user.firstName}`} />
        ) : user ? <UserRound size={22} /> : <ShieldCheck size={22} />}
      </Link>
    </header>
  );
}
