import { createClient } from "@/lib/supabase/client";
import type { Event, LeaderboardEntry, Prediction, ResultAuditEntry, Team, User } from "@/types";

interface ProfileRow {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  avatar_path: string | null;
  role: "participant" | "admin";
}

interface TeamRow {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

interface EventRow {
  id: string;
  name: string;
  description: string;
  start_at: string;
  points: number;
  sort_order: number;
  kind: "onderdeel" | "overall";
  winning_team_id: string | null;
  locked_at: string | null;
}

interface PredictionRow {
  id: string;
  user_id: string;
  event_id: string;
  predicted_team_id: string;
  created_at: string;
  updated_at: string;
}

interface LeaderboardRow {
  rank_position: number;
  user_id: string;
  username: string;
  avatar_path: string | null;
  points: number;
  correct_predictions: number;
}

function getAvatarUrl(avatarPath: string | null | undefined): string | undefined {
  if (!avatarPath) return undefined;
  return createClient().storage.from("avatars").getPublicUrl(avatarPath).data.publicUrl;
}

export async function getProfile(userId: string, email: string): Promise<User> {
  const { data, error } = await createClient()
    .from("profiles")
    .select("id, first_name, last_name, username, avatar_path, role")
    .eq("id", userId)
    .single();
  if (error) throw error;
  const profile = data as ProfileRow;
  return {
    id: profile.id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    username: profile.username,
    email,
    avatarPath: profile.avatar_path ?? undefined,
    avatarUrl: getAvatarUrl(profile.avatar_path),
    role: profile.role,
  };
}

export async function getTeams(): Promise<Team[]> {
  const { data, error } = await createClient()
    .from("teams")
    .select("id, name, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data as TeamRow[]).map((team) => ({
    id: team.id,
    name: team.name,
    sortOrder: team.sort_order,
    isActive: team.is_active,
  }));
}

export async function getEvents(): Promise<Event[]> {
  const { data, error } = await createClient()
    .from("events")
    .select("id, name, description, start_at, points, sort_order, kind, winning_team_id, locked_at")
    .order("sort_order");
  if (error) throw error;
  return (data as EventRow[]).map((event) => ({
    id: event.id,
    name: event.name,
    description: event.description,
    startAt: event.start_at,
    points: event.points,
    sortOrder: event.sort_order,
    kind: event.kind,
    status: event.winning_team_id ? "completed" : "scheduled",
    winningTeamId: event.winning_team_id,
    lockedAt: event.locked_at,
  }));
}

export async function getPredictions(userId: string): Promise<Prediction[]> {
  const { data, error } = await createClient()
    .from("predictions")
    .select("id, user_id, event_id, predicted_team_id, created_at, updated_at")
    .eq("user_id", userId);
  if (error) throw error;
  return (data as PredictionRow[]).map((prediction) => ({
    id: prediction.id,
    userId: prediction.user_id,
    eventId: prediction.event_id,
    predictedTeamId: prediction.predicted_team_id,
    createdAt: prediction.created_at,
    updatedAt: prediction.updated_at,
  }));
}

export async function savePrediction(userId: string, eventId: string, teamId: string): Promise<Prediction> {
  const { data, error } = await createClient()
    .from("predictions")
    .upsert(
      { user_id: userId, event_id: eventId, predicted_team_id: teamId },
      { onConflict: "user_id,event_id" },
    )
    .select("id, user_id, event_id, predicted_team_id, created_at, updated_at")
    .single();
  if (error) throw error;
  const prediction = data as PredictionRow;
  return {
    id: prediction.id,
    userId: prediction.user_id,
    eventId: prediction.event_id,
    predictedTeamId: prediction.predicted_team_id,
    createdAt: prediction.created_at,
    updatedAt: prediction.updated_at,
  };
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await createClient().rpc("get_public_leaderboard");
  if (error) throw error;
  return (data as LeaderboardRow[]).map((entry) => ({
    id: `rank-${entry.user_id}`,
    userId: entry.user_id,
    username: entry.username,
    points: entry.points,
    correctPredictions: entry.correct_predictions,
    avatarUrl: getAvatarUrl(entry.avatar_path),
    position: entry.rank_position,
  }));
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const { data, error } = await createClient().rpc("is_username_available", { candidate: username });
  if (error) throw error;
  return Boolean(data);
}

export async function updateProfile(updates: {
  userId: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarPath?: string | null;
}): Promise<void> {
  const payload: Record<string, string | null> = {};
  if (updates.firstName !== undefined) payload.first_name = updates.firstName;
  if (updates.lastName !== undefined) payload.last_name = updates.lastName;
  if (updates.username !== undefined) payload.username = updates.username;
  if (updates.avatarPath !== undefined) payload.avatar_path = updates.avatarPath;
  const { error } = await createClient().from("profiles").update(payload).eq("id", updates.userId);
  if (error) throw error;
}

export async function uploadAvatar(userId: string, file: Blob, previousPath?: string): Promise<string> {
  const path = `${userId}/avatar-${Date.now()}.jpg`;
  const { error } = await createClient().storage.from("avatars").upload(path, file, {
    cacheControl: "3600",
    contentType: "image/jpeg",
    upsert: true,
  });
  if (error) throw error;
  try {
    await updateProfile({ userId, avatarPath: path });
    if (previousPath && previousPath !== path) {
      await createClient().storage.from("avatars").remove([previousPath]);
    }
  } catch (profileError) {
    await createClient().storage.from("avatars").remove([path]);
    throw profileError;
  }
  return path;
}

export async function removeAvatar(userId: string, avatarPath?: string): Promise<void> {
  if (avatarPath) {
    const { error } = await createClient().storage.from("avatars").remove([avatarPath]);
    if (error) throw error;
  }
  await updateProfile({ userId, avatarPath: null });
}

export async function saveEventResult(eventId: string, teamId: string | null): Promise<void> {
  const { error } = await createClient()
    .from("events")
    .update({ winning_team_id: teamId })
    .eq("id", eventId);
  if (error) throw error;
}

export async function setEventLocked(eventId: string, isLocked: boolean): Promise<void> {
  const { error } = await createClient().rpc("set_event_locked", {
    target_event_id: eventId,
    should_lock: isLocked,
  });
  if (error) throw error;
}

export async function getResultAudit(): Promise<ResultAuditEntry[]> {
  const { data, error } = await createClient()
    .from("result_audit")
    .select("id, event_id, previous_team_id, winning_team_id, changed_at")
    .order("changed_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data as Array<{
    id: number;
    event_id: string;
    previous_team_id: string | null;
    winning_team_id: string | null;
    changed_at: string;
  }>).map((entry) => ({
    id: entry.id,
    eventId: entry.event_id,
    previousTeamId: entry.previous_team_id,
    winningTeamId: entry.winning_team_id,
    changedAt: entry.changed_at,
  }));
}
