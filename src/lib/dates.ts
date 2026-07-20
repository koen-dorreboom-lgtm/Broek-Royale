import { differenceInMinutes } from "date-fns";
import type { EventStatus } from "@/types";

export const APP_TIME_ZONE = "Europe/Amsterdam";

export function isEventLocked(eventStartDate: string | Date, currentDate: Date): boolean {
  const start = typeof eventStartDate === "string" ? new Date(eventStartDate) : eventStartDate;
  return currentDate.getTime() >= start.getTime();
}

export function getEventStatus(
  eventStartDate: string,
  currentDate: Date,
  isSaved: boolean,
): EventStatus {
  if (isEventLocked(eventStartDate, currentDate)) return "closed";
  if (differenceInMinutes(new Date(eventStartDate), currentDate) <= 60) return "closingSoon";
  return isSaved ? "saved" : "open";
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

export function toDateTimeLocalValue(date: Date): string {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return parts.replace(" ", "T");
}
