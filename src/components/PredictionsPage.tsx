"use client";

import { useEffect, useMemo, useState } from "react";
import { Crown, FlaskConical } from "lucide-react";
import { EventPredictionCard } from "@/components/EventPredictionCard";
import { ProtectedPage } from "@/components/ProtectedPage";
import { ProgressBar } from "@/components/ui";
import { events, overallWinnerEvent } from "@/data/events";
import { isEventLocked, toDateTimeLocalValue } from "@/lib/dates";
import { storage } from "@/lib/storage";
import { useAuth } from "@/providers/AuthProvider";
import type { Prediction } from "@/types";

const predictionEvents = [...events, overallWinnerEvent];

function PredictionsContent() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [currentDate, setCurrentDate] = useState(() => new Date());

  useEffect(() => {
    if (!user) return;
    const hydrationTask = window.setTimeout(() => {
      const stored = storage.getPredictions(user.id);
      setPredictions(stored);
      setDrafts(Object.fromEntries(stored.map((prediction) => [prediction.eventId, prediction.predictedTeamId])));
    }, 0);
    return () => window.clearTimeout(hydrationTask);
  }, [user]);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentDate(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const savedByEvent = useMemo(
    () => Object.fromEntries(predictions.map((prediction) => [prediction.eventId, prediction.predictedTeamId])),
    [predictions],
  );
  const completedCount = predictionEvents.filter((event) => savedByEvent[event.id]).length;

  function saveEvent(eventId: string) {
    if (!user) return;
    const event = predictionEvents.find((item) => item.id === eventId);
    const teamId = drafts[eventId];
    if (!event || !teamId || isEventLocked(event.startAt, currentDate)) return;

    const now = new Date().toISOString();
    const previous = predictions.find((prediction) => prediction.eventId === eventId);
    const nextPrediction: Prediction = {
      id: previous?.id ?? `${user.id}-${eventId}`,
      userId: user.id,
      eventId,
      predictedTeamId: teamId,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
    };
    const next = [...predictions.filter((prediction) => prediction.eventId !== eventId), nextPrediction];
    storage.setPredictions(user.id, next);
    setPredictions(next);
  }

  return (
    <>
      <header className="page-heading page-heading--left predictions-heading">
        <p className="eyebrow">De officiële speelkaart</p>
        <h1>Wedstrijdformulier</h1>
        <p>Plaats je voorspellingen voor de Feestweekcompetitie. Je kunt iedere keuze aanpassen tot het onderdeel begint.</p>
      </header>

      <section className="prediction-progress" aria-label="Voortgang">
        <div><strong>{completedCount} van de {predictionEvents.length}</strong><span> voorspellingen ingevuld</span></div>
        <ProgressBar value={completedCount} max={predictionEvents.length} />
      </section>

      {process.env.NODE_ENV === "development" && (
        <details className="dev-clock">
          <summary><FlaskConical size={17} />Ontwikkelklok</summary>
          <label htmlFor="test-date">Test de app op een andere datum en tijd</label>
          <input id="test-date" type="datetime-local" value={toDateTimeLocalValue(currentDate)} onChange={(event) => event.target.value && setCurrentDate(new Date(`${event.target.value}:00+02:00`))} />
          <button type="button" onClick={() => setCurrentDate(new Date())}>Gebruik huidige tijd</button>
        </details>
      )}

      <div className="events-list">
        {events.map((event) => (
          <EventPredictionCard
            key={event.id}
            event={event}
            currentDate={currentDate}
            selectedTeamId={drafts[event.id] ?? ""}
            savedTeamId={savedByEvent[event.id] ?? ""}
            onChange={(teamId) => {
              setDrafts((current) => ({ ...current, [event.id]: teamId }));
            }}
            onSave={() => saveEvent(event.id)}
          />
        ))}
      </div>

      <section className="overall-prediction" aria-labelledby="overall-winner-title">
        <div className="overall-prediction__heading">
          <Crown size={28} aria-hidden="true" />
          <div>
            <p>De grote finale</p>
            <h2 id="overall-winner-title">Wie wint de hele Feestweek?</h2>
          </div>
          <span aria-hidden="true">♠</span>
        </div>
        <p className="overall-prediction__intro">Zet je belangrijkste voorspelling in: welk team wordt de algehele Feestweek 2026 winnaar? Deze voorspelling sluit bij de start van de feestweek.</p>
        <EventPredictionCard
          event={overallWinnerEvent}
          currentDate={currentDate}
          selectedTeamId={drafts[overallWinnerEvent.id] ?? ""}
          savedTeamId={savedByEvent[overallWinnerEvent.id] ?? ""}
          label={`${overallWinnerEvent.points} punten · Eindklassement`}
          onChange={(teamId) => setDrafts((current) => ({ ...current, [overallWinnerEvent.id]: teamId }))}
          onSave={() => saveEvent(overallWinnerEvent.id)}
        />
      </section>
    </>
  );
}

export function PredictionsPage() {
  return <ProtectedPage><PredictionsContent /></ProtectedPage>;
}
