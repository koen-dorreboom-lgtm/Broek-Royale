export type EventLifecycleStatus = "scheduled" | "completed";
export type EventStatus = "open" | "closed" | "saved";
export type UserRole = "participant" | "admin";
export type EventKind = "onderdeel" | "overall";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatarUrl?: string;
  avatarPath?: string;
  role: UserRole;
}

export interface Team {
  id: string;
  name: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface Event {
  id: string;
  name: string;
  startAt: string;
  description: string;
  status: EventLifecycleStatus;
  winningTeamId: string | null;
  lockedAt: string | null;
  points: number;
  sortOrder?: number;
  kind?: EventKind;
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
  avatarUrl?: string;
  position?: number;
}

export interface ResultAuditEntry {
  id: number;
  eventId: string;
  previousTeamId: string | null;
  winningTeamId: string | null;
  changedAt: string;
}
