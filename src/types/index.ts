export type EventLifecycleStatus = "scheduled" | "completed";
export type EventStatus = "open" | "closingSoon" | "closed" | "saved";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

export interface Team {
  id: string;
  name: string;
}

export interface Event {
  id: string;
  name: string;
  startAt: string;
  description: string;
  status: EventLifecycleStatus;
  winningTeamId: string | null;
  points: number;
}

export interface Prediction {
  id: string;
  userId: string;
  eventId: string;
  predictedTeamId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  points: number;
  correctPredictions: number;
}
