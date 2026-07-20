"use client";

import { CalendarDays, Check, Clock3, LockKeyhole } from "lucide-react";
import { CasinoCard, PrimaryButton } from "@/components/ui";
import { StatusBadge } from "@/components/StatusBadge";
import { TeamSelect } from "@/components/TeamSelect";
import { teams } from "@/data/teams";
import { formatEventDate, formatEventTime, getEventStatus, isEventLocked } from "@/lib/dates";
import type { Event } from "@/types";

interface EventPredictionCardProps {
  event: Event;
  currentDate: Date;
  selectedTeamId: string;
  savedTeamId: string;
  onChange: (teamId: string) => void;
  onSave: () => void;
}

export function EventPredictionCard({ event, currentDate, selectedTeamId, savedTeamId, onChange, onSave }: EventPredictionCardProps) {
  const locked = isEventLocked(event.startAt, currentDate);
  const isSaved = Boolean(savedTeamId) && savedTeamId === selectedTeamId;
  const status = getEventStatus(event.startAt, currentDate, isSaved);
  const savedTeam = teams.find((team) => team.id === savedTeamId);

  return (
    <CasinoCard className={`event-card ${locked ? "event-card--locked" : ""}`}>
      <div className="event-card__top">
        <div>
          <p className="event-number">Onderdeel {eventsOrder[event.id] ?? ""}</p>
          <h2>{event.name}</h2>
        </div>
        <StatusBadge status={status} />
      </div>
      <p className="event-description">{event.description}</p>
      <div className="event-time">
        <span><CalendarDays size={16} />{formatEventDate(event.startAt)}</span>
        <span><Clock3 size={16} />{formatEventTime(event.startAt)} uur</span>
      </div>
      <TeamSelect id={`team-${event.id}`} value={locked ? savedTeamId : selectedTeamId} onChange={onChange} disabled={locked} />
      {locked ? (
        <div className="locked-result">
          <LockKeyhole size={17} />
          <span>{savedTeam ? <>Jouw voorspelling: <strong>{savedTeam.name}</strong></> : "Geen voorspelling ingediend"}</span>
        </div>
      ) : (
        <PrimaryButton type="button" className="button--small event-save" onClick={onSave} disabled={!selectedTeamId || isSaved}>
          <Check size={17} />{isSaved ? "Opgeslagen" : "Stem opslaan"}
        </PrimaryButton>
      )}
    </CasinoCard>
  );
}

const eventsOrder: Record<string, number> = {
  "katknuppelen": 1,
  "fietstocht": 2,
  "onbekend-kaartspel": 3,
  "pubquiz": 4,
  "brandweerspektakel": 5,
  "talentshow": 6,
  "kermisspel": 7,
  "broek-hangen": 8,
  "steenwerpen": 9,
  "verrassingselement": 10,
};
