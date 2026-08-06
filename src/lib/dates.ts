import type { EventStatus } from "@/types";

export const APP_TIME_ZONE = "Europe/Amsterdam";

export function isEventLocked(lockedAt: string | null): boolean {
  return lockedAt !== null;
}

export function getEventStatus(lockedAt: string | null, isSaved: boolean): EventStatus {
  if (isEventLocked(lockedAt)) return "closed";
  return isSaved ? "saved" : "open";
}

export function isEventStartPast(eventStartDate: string, currentDate: Date): boolean {
  return currentDate.getTime() >= new Date(eventStartDate).getTime();
}

const dateFormatter = new Intl.DateTimeFormat("nl-NL", {
  timeZone: APP_TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
});

const timeFormatter = new Intl.DateTimeFormat("nl-NL", {
  timeZone: APP_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatEventDate(date: string): string {
  return dateFormatter.format(new Date(date));
}

export function formatEventTime(date: string): string {
  return timeFormatter.format(new Date(date));
}
