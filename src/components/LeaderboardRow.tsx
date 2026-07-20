import { Crown, Medal } from "lucide-react";
import type { LeaderboardEntry } from "@/types";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser?: boolean;
}

export function LeaderboardRow({ entry, rank, isCurrentUser = false }: LeaderboardRowProps) {
  return (
    <li className={`leaderboard-row rank-${rank} ${isCurrentUser ? "leaderboard-row--current" : ""}`}>
      <span className="rank-number" aria-label={`Positie ${rank}`}>
        {rank === 1 ? <Crown size={20} aria-hidden="true" /> : rank <= 3 ? <Medal size={19} aria-hidden="true" /> : rank}
      </span>
      <span className="player-cell">
        <span
          className={`player-avatar ${entry.avatarUrl ? "player-avatar--photo" : ""}`}
          style={entry.avatarUrl ? { backgroundImage: `url(${entry.avatarUrl})` } : undefined}
          role={entry.avatarUrl ? "img" : undefined}
          aria-label={entry.avatarUrl ? `Profielfoto van ${entry.username}` : undefined}
          aria-hidden={entry.avatarUrl ? undefined : "true"}
        >
          {!entry.avatarUrl && entry.username.charAt(0).toUpperCase()}
        </span>
        <span className="player-name">
          <span className="player-title"><strong>{entry.username}</strong>{isCurrentUser && <span className="you-badge">Jij</span>}</span>
          <small>{entry.correctPredictions} goed voorspeld</small>
        </span>
      </span>
      <strong className="points">{entry.points}<small> punten</small></strong>
    </li>
  );
}
