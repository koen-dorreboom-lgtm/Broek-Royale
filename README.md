# Broek-toto-Royale

Mobiele Nederlandstalige webapp voor de Broeker Feestweek 2026. Deelnemers voorspellen per feestweekonderdeel het winnende team, bewaren hun keuzes op het apparaat en vergelijken hun mockscore op het leaderboard.

## Technologie

- Next.js met App Router en TypeScript
- React Server Components waar pagina's geen browserinteractie nodig hebben
- Client Components voor formulieren, authenticatie en lokale opslag
- Tailwind CSS 4 met een kleine projectspecifieke stijllaag
- Lucide React voor functionele iconen
- date-fns voor tijdsberekeningen
- ESLint

## Lokaal starten

Vereist: een actuele Node.js LTS-versie.

```bash
npm install
npm run dev
```

Open daarna [http://localhost:3000](http://localhost:3000).

Productiecontrole:

```bash
npm run lint
npm run build
npm start
```

## Mockauthenticatie

Iedere niet-lege combinatie van e-mailadres/gebruikersnaam en wachtwoord kan inloggen. Registratie valideert alle velden en maakt direct een lokale sessie. De huidige gebruiker wordt onder de sleutel `broek-royale:auth-user` in `localStorage` bewaard. Uitloggen verwijdert alleen deze sessie; voorspellingen blijven voor die gebruikers-id bewaard.

De authenticatielogica staat in `src/providers/AuthProvider.tsx`. Daar staan ook de expliciete integratiepunten voor een latere overstap naar Supabase Auth.

## Lokale gegevens

- Voorspellingen: `broek-royale:predictions:<userId>`
- Mockuitslagen: `broek-royale:results`
- Alle toegang tot `localStorage` loopt via `src/lib/storage.ts` en heeft foutafhandeling.
- Er wordt nog niets tussen apparaten gesynchroniseerd.

## Routes

| Route | Functie |
| --- | --- |
| `/` | Welkom en accountstatus |
| `/inloggen` | Mockinloggen |
| `/registreren` | Mockaccount aanmaken |
| `/voorspellingen` | Beveiligd wedstrijdformulier |
| `/leaderboard` | Publiek mockleaderboard |
| `/profiel` | Beveiligde spelerskaart en uitloggen |
| `/admin` | Onbeveiligde beheer-demo |

## Data aanpassen

- Teams: `src/data/teams.ts`
- Onderdelen, starttijden en punten: `src/data/events.ts`
- Mockleaderboard: `src/data/leaderboard.ts`

De onderdeeldata gebruiken ISO-datums met de Amsterdamse zomertijd-offset (`+02:00`). Alle zichtbare datums worden via `Europe/Amsterdam` geformatteerd. `isEventLocked` in `src/lib/dates.ts` vergelijkt absolute tijdstippen en voorkomt dat alleen de visuele status een stem sluit.

In development staat op `/voorspellingen` een ontwikkelklok waarmee open, bijna gesloten en gesloten onderdelen zonder datawijzigingen getest kunnen worden.

## Later Supabase toevoegen

1. Maak Supabase-tabellen voor profielen, teams, onderdelen, voorspellingen en uitslagen.
2. Vervang de implementatie achter `AuthProvider` door Supabase Auth, zonder de pagina-API te veranderen.
3. Vervang de functies in `storage.ts` door een repository/service die Supabase-queries uitvoert.
4. Bereken scores server-side na het opslaan van een uitslag.
5. Beveilig `/admin` met middleware en role-based access control.
6. Voeg Row Level Security-beleid toe zodat deelnemers uitsluitend hun eigen voorspellingen kunnen wijzigen.

## Openstaande TODO's

- Supabase Auth, database en Row Level Security koppelen.
- Echte e-mailverificatie en wachtwoordherstel toevoegen.
- Beheerrollen en routebeveiliging voor `/admin` toevoegen.
- Punten na officiële uitslagen server-side berekenen.
- Teamnamen en eventuele teamlogo's vervangen zodra ze definitief zijn.
- Geautomatiseerde unit-, component- en end-to-endtests toevoegen.
