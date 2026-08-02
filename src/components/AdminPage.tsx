"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { History, RotateCcw, Save, ShieldCheck } from "lucide-react";
import { CasinoCard, InlineSuccess, PrimaryButton } from "@/components/ui";
import { StatusBadge } from "@/components/StatusBadge";
import { getEvents, getResultAudit, getTeams, saveEventResult } from "@/lib/api";
import { getEventStatus } from "@/lib/dates";
import { useAuth } from "@/providers/AuthProvider";
import type { Event, ResultAuditEntry, Team } from "@/types";

export function AdminPage() {
  const { user, configurationError } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [audit, setAudit] = useState<ResultAuditEntry[]>([]);
  const [draftResults, setDraftResults] = useState<Record<string, string>>({});
  const [savingEvent, setSavingEvent] = useState("");
  const [savedEvent, setSavedEvent] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadAdminData = useCallback(async () => {
    if (configurationError || user?.role !== "admin") {
      setIsLoading(false);
      return;
    }
    setError("");
    try {
      const [loadedEvents, loadedTeams, loadedAudit] = await Promise.all([
        getEvents(),
        getTeams(),
        getResultAudit(),
      ]);
      setEvents(loadedEvents);
      setTeams(loadedTeams);
      setAudit(loadedAudit);
      setDraftResults(Object.fromEntries(loadedEvents.map((event) => [event.id, event.winningTeamId ?? ""])));
    } catch {
      setError("De beheerdata kon niet worden geladen.");
    } finally {
      setIsLoading(false);
    }
  }, [configurationError, user?.role]);

  useEffect(() => {
    void Promise.resolve().then(loadAdminData);
  }, [loadAdminData]);

  const eventNames = useMemo(() => new Map(events.map((event) => [event.id, event.name])), [events]);
  const teamNames = useMemo(() => new Map(teams.map((team) => [team.id, team.name])), [teams]);

  async function storeResult(event: Event, teamId: string | null) {
    const nextName = teamId ? teamNames.get(teamId) : "geen uitslag";
    const prompt = event.winningTeamId
      ? `Weet je zeker dat je de uitslag van ${event.name} corrigeert naar ${nextName}?`
      : `Weet je zeker dat ${nextName} de winnaar is van ${event.name}?`;
    if (!window.confirm(prompt)) return;

    setSavingEvent(event.id);
    setSavedEvent("");
    setError("");
    try {
      await saveEventResult(event.id, teamId);
      await loadAdminData();
      setSavedEvent(event.id);
      window.setTimeout(() => setSavedEvent(""), 3000);
    } catch {
      setError("De uitslag kon niet worden opgeslagen. Controleer je beheerdersrechten en probeer opnieuw.");
    } finally {
      setSavingEvent("");
    }
  }

  if (!configurationError && user && user.role !== "admin") {
    return <div className="notice notice--warning" role="alert">Je hebt geen toegang tot het beheer.</div>;
  }

  return (
    <>
      <header className="page-heading page-heading--left admin-heading">
        <p className="eyebrow">Beveiligd beheer</p>
        <h1>Uitslagen</h1>
        <p>Leg de officiële winnaar vast. Iedere wijziging wordt bewaard en de stand wordt automatisch herberekend.</p>
      </header>
      <div className="notice notice--warning admin-warning">
        <ShieldCheck size={21} />
        <span><strong>Let op.</strong> Controleer de uitslag vóór opslaan. Correcties zijn mogelijk en blijven zichtbaar in het wijzigingslog.</span>
      </div>
      {(configurationError || error) && <div className="notice notice--warning" role="alert">{configurationError || error}</div>}
      {isLoading ? <div className="loading-state" role="status"><p>Beheer laden…</p></div> : (
        <div className="admin-list">
          {events.map((event) => {
            const hasResult = Boolean(event.winningTeamId);
            return (
              <CasinoCard key={event.id} className={event.kind === "overall" ? "admin-event admin-event--overall" : "admin-event"}>
                <div className="admin-event__heading">
                  <div><p className="event-number">{event.kind === "overall" ? "Algehele winnaar" : `Onderdeel ${event.sortOrder}`}</p><h2>{event.name}</h2></div>
                  <StatusBadge status={getEventStatus(event.startAt, new Date(), hasResult)} />
                </div>
                <label htmlFor={`result-${event.id}`}>Winnende team</label>
                <select
                  id={`result-${event.id}`}
                  className="admin-select"
                  value={draftResults[event.id] ?? ""}
                  onChange={(changeEvent) => setDraftResults((current) => ({ ...current, [event.id]: changeEvent.target.value }))}
                >
                  <option value="">Nog geen uitslag</option>
                  {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                </select>
                <div className="admin-event__actions">
                  <PrimaryButton
                    type="button"
                    className="button--small"
                    onClick={() => void storeResult(event, draftResults[event.id] || null)}
                    disabled={!draftResults[event.id] || savingEvent === event.id || draftResults[event.id] === event.winningTeamId}
                  >
                    <Save size={16} />{savingEvent === event.id ? "Opslaan…" : hasResult ? "Correctie opslaan" : "Uitslag opslaan"}
                  </PrimaryButton>
                  {hasResult && <button type="button" className="admin-clear" onClick={() => void storeResult(event, null)} disabled={savingEvent === event.id}><RotateCcw size={15} />Uitslag intrekken</button>}
                </div>
                {savedEvent === event.id && <InlineSuccess>Uitslag opgeslagen; de stand is herberekend.</InlineSuccess>}
              </CasinoCard>
            );
          })}
        </div>
      )}

      <CasinoCard className="audit-card">
        <div className="audit-card__title"><History size={21} /><h2>Wijzigingslog</h2></div>
        {audit.length === 0 ? <p>Nog geen uitslagen of correcties vastgelegd.</p> : (
          <ol className="audit-list">
            {audit.map((entry) => (
              <li key={entry.id}>
                <strong>{eventNames.get(entry.eventId) ?? entry.eventId}</strong>
                <span>{entry.previousTeamId ? teamNames.get(entry.previousTeamId) : "Geen uitslag"} → {entry.winningTeamId ? teamNames.get(entry.winningTeamId) : "Ingetrokken"}</span>
                <time dateTime={entry.changedAt}>{new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Amsterdam" }).format(new Date(entry.changedAt))}</time>
              </li>
            ))}
          </ol>
        )}
      </CasinoCard>
    </>
  );
}
