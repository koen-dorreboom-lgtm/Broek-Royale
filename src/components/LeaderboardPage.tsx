"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { CasinoCard } from "@/components/ui";
import { LeaderboardRow } from "@/components/LeaderboardRow";
import { getLeaderboard } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import type { LeaderboardEntry } from "@/types";

export function LeaderboardPage() {
  const { user, configurationError } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(!configurationError);
  const [error, setError] = useState("");

  useEffect(() => {
    if (configurationError) {
      return;
    }
    let isMounted = true;
    void getLeaderboard()
      .then((loaded) => isMounted && setEntries(loaded))
      .catch(() => isMounted && setError("Het leaderboard kon niet worden geladen."))
      .finally(() => isMounted && setIsLoading(false));
    return () => { isMounted = false; };
  }, [configurationError]);

  const currentEntry = user ? entries.find((entry) => entry.userId === user.id) : undefined;
  const currentIsInTopTen = Boolean(currentEntry && (currentEntry.position ?? 999) <= 10);

  return (
    <>
      <header className="page-heading leaderboard-heading"><p className="eyebrow">Seizoen 2026</p><h1>Leaderboard</h1><p>De inzet is hoog. Alleen de scherpste voorspellers verdienen een plek aan de top.</p></header>
      {(configurationError || error) && <div className="notice notice--warning" role="alert">{configurationError || error}</div>}
      {isLoading ? <div className="loading-state" role="status"><span className="loading-chip">♠</span><p>Stand laden…</p></div> : (
        <CasinoCard className="leaderboard-card">
          <div className="leaderboard-title"><Trophy size={25} /><h2>Topspelers</h2><span>Feestweek</span></div>
          <div className="leaderboard-labels"><span>Rang</span><span>Gebruikersnaam</span><span>Punten</span></div>
          <ol className="leaderboard-list">
            {entries.slice(0, 10).map((entry, index) => (
              <LeaderboardRow key={entry.id} entry={entry} rank={entry.position ?? index + 1} isCurrentUser={entry.userId === user?.id} />
            ))}
          </ol>
        </CasinoCard>
      )}
      {currentEntry && !currentIsInTopTen && (
        <section className="current-position" aria-label="Jouw positie"><p>Jouw positie</p><ol><LeaderboardRow entry={currentEntry} rank={currentEntry.position ?? 0} isCurrentUser /></ol></section>
      )}
      <p className="leaderboard-refresh-note">De stand wordt bijgewerkt wanneer je deze pagina opnieuw opent of ververst.</p>
    </>
  );
}
