"use client";

import { useEffect, useState } from "react";
import { Save, ShieldAlert } from "lucide-react";
import { CasinoCard, InlineSuccess, PrimaryButton } from "@/components/ui";
import { StatusBadge } from "@/components/StatusBadge";
import { events } from "@/data/events";
import { teams } from "@/data/teams";
import { getEventStatus } from "@/lib/dates";
import { storage } from "@/lib/storage";

export function AdminPage() {
  const [results, setResults] = useState<Record<string, string>>({});
  const [savedEvent, setSavedEvent] = useState("");
  const now = new Date();

  useEffect(() => {
    const hydrationTask = window.setTimeout(() => setResults(storage.getResults()), 0);
    return () => window.clearTimeout(hydrationTask);
  }, []);

  function saveResult(eventId: string) {
    storage.setResults(results);
    setSavedEvent(eventId);
    window.setTimeout(() => setSavedEvent(""), 2500);
  }

  return (
    <>
      <header className="page-heading page-heading--left admin-heading">
        <p className="eyebrow">Alleen voor demonstratie</p>
        <h1>Beheer</h1>
        <p>Leg per onderdeel het winnende team vast. Deze uitslagen worden alleen op dit apparaat bewaard.</p>
      </header>
      <div className="notice notice--warning admin-warning"><ShieldAlert size={21} /><span><strong>Mockfunctionaliteit.</strong> Deze pagina is nog niet beveiligd. TODO: voeg role-based access control met Supabase toe.</span></div>
      <div className="admin-list">
        {events.map((event) => (
          <CasinoCard key={event.id} className="admin-event">
            <div className="admin-event__heading"><h2>{event.name}</h2><StatusBadge status={getEventStatus(event.startAt, now, false)} /></div>
            <label htmlFor={`result-${event.id}`}>Winnende team</label>
            <select id={`result-${event.id}`} className="admin-select" value={results[event.id] ?? ""} onChange={(changeEvent) => setResults((current) => ({ ...current, [event.id]: changeEvent.target.value }))}>
              <option value="">Nog geen uitslag</option>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
            <PrimaryButton type="button" className="button--small" onClick={() => saveResult(event.id)} disabled={!results[event.id]}><Save size={16} />Uitslag opslaan</PrimaryButton>
            {savedEvent === event.id && <InlineSuccess>Uitslag lokaal opgeslagen</InlineSuccess>}
          </CasinoCard>
        ))}
      </div>
    </>
  );
}
