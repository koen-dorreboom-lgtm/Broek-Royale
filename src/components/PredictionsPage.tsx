"use client";

import { useEffect, useMemo, useState } from "react";
import { Crown } from "lucide-react";
import { EventPredictionCard } from "@/components/EventPredictionCard";
import { ProtectedPage } from "@/components/ProtectedPage";
import { ProgressBar } from "@/components/ui";
import { getEvents, getPredictions, getTeams, savePrediction } from "@/lib/api";
import { isEventLocked } from "@/lib/dates";
import { useAuth } from "@/providers/AuthProvider";
import type { Event, Prediction, Team } from "@/types";

function PredictionsContent() {
  const { user, configurationError } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [savingEvent, setSavingEvent] = useState("");
  const [saveErrors, setSaveErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user || configurationError) {
      return;
    }
    let isMounted = true;
    void Promise.all([getEvents(), getTeams(), getPredictions(user.id)])
      .then(([loadedEvents, loadedTeams, storedPredictions]) => {
        if (!isMounted) return;
        setEvents(loadedEvents);
        setTeams(loadedTeams);
        setPredictions(storedPredictions);
        setDrafts(Object.fromEntries(storedPredictions.map((prediction) => [prediction.eventId, prediction.predictedTeamId])));
      })
      .catch(() => isMounted && setLoadError("De voorspellingen konden niet worden geladen. Probeer de pagina opnieuw."))
      .finally(() => isMounted && setIsLoading(false));
    return () => { isMounted = false; };
  }, [user, configurationError]);

  const savedByEvent = useMemo(
    () => Object.fromEntries(predictions.map((prediction) => [prediction.eventId, prediction.predictedTeamId])),
    [predictions],
  );
  const completedCount = events.filter((event) => savedByEvent[event.id]).length;
  const regularEvents = events.filter((event) => event.kind !== "overall");
  const overallWinnerEvent = events.find((event) => event.kind === "overall");

  async function saveEvent(eventId: string) {
    if (!user) return;
    const event = events.find((item) => item.id === eventId);
    const teamId = drafts[eventId];
    if (!event || !teamId || isEventLocked(event.lockedAt)) return;

    setSavingEvent(eventId);
    setSaveErrors((current) => ({ ...current, [eventId]: "" }));
    try {
      const saved = await savePrediction(user.id, eventId, teamId);
      setPredictions((current) => [...current.filter((prediction) => prediction.eventId !== eventId), saved]);
    } catch {
      setSaveErrors((current) => ({
        ...current,
        [eventId]: "Deze stem kon niet worden opgeslagen. Het onderdeel kan inmiddels gesloten zijn.",
      }));
    } finally {
      setSavingEvent("");
    }
  }

  if (isLoading) return <div className="loading-state" role="status"><span className="loading-chip">♠</span><p>Voorspellingen laden…</p></div>;

  return (
    <>
      <header className="page-heading page-heading--left predictions-heading">
        <p className="eyebrow">De officiële speelkaart</p>
        <h1>Wedstrijdformulier</h1>
        <p>Plaats je voorspellingen voor de Feestweekcompetitie. Je kunt iedere keuze aanpassen totdat de beheerder de stemming sluit.</p>
      </header>

      {(configurationError || loadError) && <div className="notice notice--warning" role="alert">{configurationError || loadError}</div>}

      <section className="prediction-progress" aria-label="Voortgang">
        <div><strong>{completedCount} van de {events.length}</strong><span> voorspellingen ingevuld</span></div>
        <ProgressBar value={completedCount} max={events.length} />
      </section>

      <div className="events-list">
        {regularEvents.map((event) => (
          <EventPredictionCard
            key={event.id}
            event={event}
            teams={teams}
            selectedTeamId={drafts[event.id] ?? ""}
            savedTeamId={savedByEvent[event.id] ?? ""}
            isSaving={savingEvent === event.id}
            saveError={saveErrors[event.id]}
            onChange={(teamId) => setDrafts((current) => ({ ...current, [event.id]: teamId }))}
            onSave={() => saveEvent(event.id)}
          />
        ))}
      </div>

      {overallWinnerEvent && (
        <section className="overall-prediction" aria-labelledby="overall-winner-title">
          <div className="overall-prediction__heading">
            <Crown size={28} aria-hidden="true" />
            <div><p>De grote finale</p><h2 id="overall-winner-title">Wie wint de hele Feestweek?</h2></div>
            <span aria-hidden="true">♠</span>
          </div>
          <p className="overall-prediction__intro">Zet je belangrijkste voorspelling in: welk team wordt de algehele Feestweek 2026 winnaar? De beheerder sluit deze stemming handmatig.</p>
          <EventPredictionCard
            event={overallWinnerEvent}
            teams={teams}
            selectedTeamId={drafts[overallWinnerEvent.id] ?? ""}
            savedTeamId={savedByEvent[overallWinnerEvent.id] ?? ""}
            label={`${overallWinnerEvent.points} punten · Eindklassement`}
            isSaving={savingEvent === overallWinnerEvent.id}
            saveError={saveErrors[overallWinnerEvent.id]}
            onChange={(teamId) => setDrafts((current) => ({ ...current, [overallWinnerEvent.id]: teamId }))}
            onSave={() => saveEvent(overallWinnerEvent.id)}
          />
        </section>
      )}
    </>
  );
}

export function PredictionsPage() {
  return <ProtectedPage><PredictionsContent /></ProtectedPage>;
}
