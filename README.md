# Broek Royale TOTO

Mobiele Nederlandstalige voorspelling-app voor de Broeker Feestweek 2026. Deelnemers voorspellen de winnaars van tien onderdelen en de algehele Feestweekwinnaar. Accounts, voorspellingen, avatars, uitslagen en scores worden centraal opgeslagen in Supabase.

## Technologie

- Next.js 16 App Router, React 19 en TypeScript
- Tailwind CSS 4 en projectspecifieke CSS
- Supabase Auth, Postgres, Row Level Security en Storage
- Supabase SSR-cookies voor server-side routebeveiliging
- Cloudflare Turnstile op registratie, login en wachtwoordherstel
- Resend via Supabase Custom SMTP voor herstelmails
- Vercel voor Preview- en Production-deployments
- GitHub Actions voor lint en productiebuild

## Lokaal draaien

Gebruik Node.js `24.16.0` (zie `.nvmrc`).

```bash
npm ci
copy .env.example .env.local
npm run dev
```

Vul in `.env.local` de waarden van het Supabase-stagingproject en de Turnstile-testsite in. Open daarna `http://localhost:3000`.

Kwaliteitscontrole:

```bash
npm run check
```

Met een draaiende lokale Supabase-stack kunnen de database- en RLS-tests worden uitgevoerd met `npx supabase test db`.

## Omgevingsvariabelen

| Variabele | Lokaal | Vercel Preview | Vercel Production |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | staging | staging | productie |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | staging | staging | productie |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Preview-origin of stabiele staging-URL | definitief HTTPS-domein |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | test/staging | staging | productie |

De publishable key mag in de browser staan; beveiliging komt uit Auth en RLS. Zet **geen** Supabase service-role-key, Turnstile-secret, SMTP-wachtwoord of Resend API-key in de browser, repository of een `NEXT_PUBLIC_`-variabele.

## Supabase opzetten

Maak twee projecten: staging en productie. Koppel lokaal met de Supabase CLI en voer de migrations uit:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Laad daarna `supabase/seed.sql`. Dit bestand bevat voorlopig Team 1 t/m Team 12, de tien onderdelen van 8–16 augustus en de algehele winnaar die op 8 augustus om 17:30 sluit. Pas de seed vóór openstelling aan met de definitieve namen en tijden.

De migration maakt:

- `profiles`, zonder e-mailadres; e-mail blijft uitsluitend in Supabase Auth;
- `teams`, `events`, `predictions` en `result_audit`;
- server-time RLS die voorspellingen vanaf `events.start_at` weigert;
- adminbeleid voor teams, onderdelen en uitslagen;
- een veilige publieke `get_public_leaderboard()`-RPC;
- een publieke `avatars`-bucket met eigen-map uploadbeleid;
- automatische adminrol bij exact `koen-dorreboom@hotmail.nl`.

Maak het adminaccount handmatig vóór open registratie en controleer de rol in `profiles`. RLS blijft de beslissende autorisatielaag; de client- en routechecks zijn extra gebruikersbescherming.

## Authenticatie en e-mail

Registratie gebruikt e-mail/wachtwoord en maakt na succesvolle signup een profieltrigger aan. E-mailbevestiging staat volgens de gekozen spelopzet uit. Schakel in Supabase Auth CAPTCHA Protection in en voeg daar het Turnstile-secret toe.

Configureer Resend als Supabase Custom SMTP met een geverifieerd subdomein, bijvoorbeeld `no-reply@auth.broekroyal.nl`. Publiceer SPF, DKIM en DMARC. Voeg in Supabase Auth de volgende URLs toe:

- `SITE_URL`: het definitieve productiedomein;
- `http://localhost:3000/**` en `http://127.0.0.1:3000/**` voor lokaal;
- de Vercel Preview-wildcard van het eigen team;
- eventueel een stabiele staging-URL.

## Routes

| Route | Functie | Toegang |
| --- | --- | --- |
| `/` | Welkom en accountstatus | openbaar |
| `/registreren` | Account aanmaken | openbaar |
| `/inloggen` | Inloggen | openbaar |
| `/wachtwoord-vergeten` | Herstelmail aanvragen | openbaar |
| `/wachtwoord-wijzigen` | Nieuw wachtwoord instellen | herstelsessie |
| `/voorspellingen` | Onderdelen en algehele winnaar voorspellen | ingelogd |
| `/leaderboard` | Publieke ranglijst | openbaar |
| `/profiel` | Account, score en avatar | ingelogd |
| `/admin` | Uitslagen, correcties en auditlog | admin |
| `/spelregels` | Puntentelling, prijs en loting | openbaar |
| `/privacy` | Privacy- en verwijderbeleid | openbaar |

`proxy.ts` vernieuwt SSR-cookies en beschermt de ingelogde routes. `/admin` controleert daarnaast de rol. De database dwingt alle rechten zelfstandig af.

## Deployment

Koppel `koen-dorreboom-lgtm/Broek-Royale` aan Vercel en stel `main` in als Production Branch. Pull requests krijgen een Preview Deployment met stagingvariabelen; een merge naar `main` gebruikt productievariabelen. GitHub Actions voert bij iedere pull request en push naar `main` lint en build uit.

Registreer bij voorkeur `broekroyal.nl`; als dit niet beschikbaar is, gebruik `broekroyaletoto.nl` of tijdelijk het vaste Vercel-adres. Een ontbrekend DNS-record bewijst niet dat een domein vrij is. Koppel na registratie het domein in Vercel en forceer HTTPS.

## Scoring en privacy

Ieder onderdeel is 100 punten waard; de algehele winnaar 250. De leaderboard-RPC berekent scores rechtstreeks uit voorspellingen en actuele uitslagen. Sortering is punten, daarna correcte voorspellingen. Volledig gelijke spelers delen dezelfde positie; de hoofdprijs wordt dan via een transparante loting toegewezen.

Gebruikersnaam en avatar zijn openbaar. Naam en e-mail worden niet door de leaderboard-RPC teruggegeven. Persoonsgegevens, Auth-users, voorspellingen en avatars worden uiterlijk 1 oktober 2026 verwijderd.

## Operationele documenten

- `docs/LAUNCH_CHECKLIST.md`: alle dashboard-, domein-, test- en vrijgavestappen.
- `docs/OPERATIONS.md`: dagelijkse exports, uitslagcorrecties, incidenten en gegevensverwijdering.

## Openstaande acties

- Definitieve teamnamen, programma, hoofdprijs en organisatieteksten bevestigen.
- Supabase staging/productie, Turnstile, Resend, Vercel en DNS in de externe dashboards configureren.
- RLS- en belastingtests tegen staging uitvoeren en bewijs bewaren.
- Organisatiegoedkeuring voor naam, logo, casinostijl en “TOTO” vastleggen.
- Na de feestweek de verwijderprocedure op 1 oktober uitvoeren.
