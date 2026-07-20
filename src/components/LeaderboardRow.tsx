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
      <span className="player-name">
        <strong>{entry.username}</strong>
        <small>{entry.correctPredictions} goed voorspeld</small>
      </span>
      {isCurrentUser && <span className="you-badge">Jij</span>}
      <strong className="points">{entry.points}<small> punten</small></strong>
    </li>
  );
}
