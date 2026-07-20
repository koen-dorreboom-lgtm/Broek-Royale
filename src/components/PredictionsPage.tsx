"use client";

import { useEffect, useMemo, useState } from "react";
import { FlaskConical, Save } from "lucide-react";
import { EventPredictionCard } from "@/components/EventPredictionCard";
import { ProtectedPage } from "@/components/ProtectedPage";
import { InlineSuccess, PrimaryButton, ProgressBar } from "@/components/ui";
import { events } from "@/data/events";
import { isEventLocked, toDateTimeLocalValue } from "@/lib/dates";
import { storage } from "@/lib/storage";
import { useAuth } from "@/providers/AuthProvider";
import type { Prediction } from "@/types";

function PredictionsContent() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [successMessage, setSuccessMessage] = useState("");

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
  const completedCount = predictions.length;

  function saveEvent(eventId: string) {
    if (!user) return;
    const event = events.find((item) => item.id === eventId);
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
    showSuccess("Je voorspelling is opgeslagen");
  }

  function saveAll() {
    if (!user) return;
    const now = new Date().toISOString();
    const next = events.reduce<Prediction[]>((result, event) => {
      const existing = predictions.find((prediction) => prediction.eventId === event.id);
      const teamId = drafts[event.id];
      if (isEventLocked(event.startAt, currentDate) || !teamId) {
        if (existing) result.push(existing);
        return result;
      }
      result.push({
        id: existing?.id ?? `${user.id}-${event.id}`,
        userId: user.id,
        eventId: event.id,
        predictedTeamId: teamId,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      });
      return result;
    }, []);
    storage.setPredictions(user.id, next);
    setPredictions(next);
    showSuccess("Je voorspellingen zijn opgeslagen");
  }

  function showSuccess(message: string) {
    setSuccessMessage(message);
    window.setTimeout(() => setSuccessMessage(""), 3500);
  }

  return (
    <>
      <header className="page-heading page-heading--left predictions-heading">
        <p className="eyebrow">De officiële speelkaart</p>
        <h1>Wedstrijdformulier</h1>
        <p>Plaats je voorspellingen voor de Feestweekcompetitie. Je kunt iedere keuze aanpassen tot het onderdeel begint.</p>
      </header>

      <section className="prediction-progress" aria-label="Voortgang">
        <div><strong>{completedCount} van de {events.length}</strong><span> voorspellingen ingevuld</span></div>
        <ProgressBar value={completedCount} max={events.length} />
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
              setSuccessMessage("");
            }}
            onSave={() => saveEvent(event.id)}
          />
        ))}
      </div>

      <div className="sticky-save">
        {successMessage && <InlineSuccess>{successMessage}</InlineSuccess>}
        <PrimaryButton type="button" onClick={saveAll}><Save size={19} />Stemmen opslaan</PrimaryButton>
      </div>
    </>
  );
}

export function PredictionsPage() {
  return <ProtectedPage><PredictionsContent /></ProtectedPage>;
}
