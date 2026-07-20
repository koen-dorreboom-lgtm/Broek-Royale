"use client";

import { Trophy } from "lucide-react";
import { CasinoCard } from "@/components/ui";
import { LeaderboardRow } from "@/components/LeaderboardRow";
import { getLeaderboardForUser } from "@/lib/scoring";
import { useAuth } from "@/providers/AuthProvider";

export function LeaderboardPage() {
  const { user } = useAuth();
  const entries = getLeaderboardForUser(user);
  const currentIndex = user ? entries.findIndex((entry) => entry.userId === user.id) : -1;
  const currentIsInTopTen = currentIndex >= 0 && currentIndex < 10;

  return (
    <>
      <header className="page-heading leaderboard-heading">
        <p className="eyebrow">Seizoen 2026</p>
        <h1>Leaderboard</h1>
        <p>De inzet is hoog. Alleen de scherpste voorspellers verdienen een plek aan de top.</p>
      </header>
      <CasinoCard className="leaderboard-card">
        <div className="leaderboard-title"><Trophy size={25} /><h2>Topspelers</h2><span>Feestweek</span></div>
        <div className="leaderboard-labels"><span>Rang</span><span>Gebruikersnaam</span><span>Punten</span></div>
        <ol className="leaderboard-list">
          {entries.slice(0, 10).map((entry, index) => (
            <LeaderboardRow key={entry.id} entry={entry} rank={index + 1} isCurrentUser={entry.userId === user?.id} />
          ))}
        </ol>
      </CasinoCard>
      {user && !currentIsInTopTen && currentIndex >= 0 && (
        <section className="current-position" aria-label="Jouw positie">
          <p>Jouw positie</p>
          <ol><LeaderboardRow entry={entries[currentIndex]} rank={currentIndex + 1} isCurrentUser /></ol>
        </section>
      )}
    </>
  );
}
