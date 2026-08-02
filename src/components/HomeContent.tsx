"use client";

import { useEffect, useState } from "react";
import { Clock3, LogIn, UserPlus, Vote } from "lucide-react";
import { ButtonLink, CasinoCard } from "@/components/ui";
import { getEvents, getPredictions } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

export function HomeContent() {
  const { user, isLoading, configurationError } = useAuth();
  const [completed, setCompleted] = useState(0);
  const [totalPredictions, setTotalPredictions] = useState(11);

  useEffect(() => {
    if (configurationError) return;
    void getEvents().then((events) => setTotalPredictions(events.length)).catch(() => undefined);
  }, [configurationError]);

  useEffect(() => {
    if (!user || configurationError) {
      return;
    }
    void getPredictions(user.id).then((predictions) => setCompleted(predictions.length)).catch(() => setCompleted(0));
  }, [user, configurationError]);

  return (
    <>
      <div className="hero-card" aria-label="Broek Royale speelkaart">
        <div className="card-corner card-corner--top"><strong>A</strong><span>♠</span></div>
        <div className="hero-card__center"><span className="hero-spade">♠</span><strong>BROEK</strong><strong className="hero-royale">ROYALE</strong><span className="gold-rule" /><small>EST. 2026</small></div>
        <div className="card-corner card-corner--bottom"><strong>A</strong><span>♠</span></div>
      </div>

      <header className="page-heading home-heading"><p className="eyebrow">Broeker Feestweek 2026</p><h1>Welkom bij de Broek Royale TOTO</h1></header>

      <CasinoCard className="welcome-card">
        <p>Voorspel de winnaars van de onderdelen tijdens de Broeker Feestweek 2026. Verdien punten met goede voorspellingen en strijd om de eerste plaats op het leaderboard.</p>
        <div className="closing-note"><Clock3 size={21} /><span>Iedere voorspelling sluit zodra het onderdeel begint.</span></div>
      </CasinoCard>

      {configurationError && <div className="notice notice--warning" role="status">{configurationError}</div>}

      {!isLoading && user ? (
        <div className="home-actions">
          <p className="prediction-summary"><strong>{completed} van de {totalPredictions}</strong> voorspellingen ingevuld voor <strong>{user.username}</strong>.</p>
          <ButtonLink href="/voorspellingen"><Vote size={19} />Naar mijn voorspellingen</ButtonLink>
        </div>
      ) : (
        <div className="home-actions">
          <ButtonLink href="/inloggen"><LogIn size={19} />Inloggen</ButtonLink>
          <ButtonLink href="/registreren" secondary><UserPlus size={19} />Account aanmaken</ButtonLink>
        </div>
      )}

      <p className="suit-divider" aria-hidden="true"><span>♠</span><span>♥</span><span>♦</span><span>♣</span></p>
    </>
  );
}
