"use client";

import { useRouter } from "next/navigation";
import { AtSign, LogOut, Mail, Target, Trophy, UserRound } from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { CasinoCard, SecondaryButton } from "@/components/ui";
import { storage } from "@/lib/storage";
import { getLeaderboardForUser } from "@/lib/scoring";
import { useAuth } from "@/providers/AuthProvider";

function ProfileContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  if (!user) return null;

  const predictions = storage.getPredictions(user.id);
  const leaderboard = getLeaderboardForUser(user);
  const rank = leaderboard.findIndex((entry) => entry.userId === user.id) + 1;
  const entry = leaderboard.find((item) => item.userId === user.id);

  function handleLogout() {
    logout();
    router.replace("/");
  }

  return (
    <>
      <header className="page-heading profile-heading">
        <div className="profile-monogram" aria-hidden="true">{user.firstName.charAt(0)}{user.lastName.charAt(0)}</div>
        <p className="eyebrow">Spelerskaart</p>
        <h1>{user.firstName} {user.lastName}</h1>
        <p>@{user.username}</p>
      </header>

      <div className="profile-stats">
        <CasinoCard><Target size={22} /><strong>{predictions.length}</strong><span>Ingevuld</span></CasinoCard>
        <CasinoCard><Trophy size={22} /><strong>{rank}</strong><span>Positie</span></CasinoCard>
        <CasinoCard><span className="card-suit-icon">♦</span><strong>{entry?.points ?? 0}</strong><span>Punten</span></CasinoCard>
      </div>

      <CasinoCard className="profile-details">
        <h2>Profielgegevens</h2>
        <dl>
          <div><dt><UserRound size={17} />Naam</dt><dd>{user.firstName} {user.lastName}</dd></div>
          <div><dt><AtSign size={17} />Gebruikersnaam</dt><dd>{user.username}</dd></div>
          <div><dt><Mail size={17} />E-mailadres</dt><dd>{user.email}</dd></div>
        </dl>
      </CasinoCard>

      <SecondaryButton type="button" onClick={handleLogout} className="logout-button"><LogOut size={19} />Uitloggen</SecondaryButton>
    </>
  );
}

export function ProfilePage() {
  return <ProtectedPage><ProfileContent /></ProtectedPage>;
}
