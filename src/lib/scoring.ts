import { leaderboardEntries } from "@/data/leaderboard";
import type { LeaderboardEntry, User } from "@/types";

export function sortLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort(
    (a, b) => b.points - a.points || b.correctPredictions - a.correctPredictions || a.username.localeCompare(b.username),
  );
}

export function getLeaderboardForUser(user: User | null): LeaderboardEntry[] {
  if (!user) return sortLeaderboard(leaderboardEntries);
  const withoutCurrentUser = leaderboardEntries.filter((entry) => entry.userId !== user.id);
  const currentEntry: LeaderboardEntry = {
    id: `rank-${user.id}`,
    userId: user.id,
    username: user.username,
    points: 0,
    correctPredictions: 0,
  };
  return sortLeaderboard([...withoutCurrentUser, currentEntry]);
}
