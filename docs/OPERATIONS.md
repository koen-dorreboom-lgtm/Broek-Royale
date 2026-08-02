# Operatie en incidenten

## Dagelijkse routine, 8–16 augustus

1. Controleer in Supabase of productie actief is en bekijk Auth-, Database- en API-logboeken.
2. Controleer Vercel Runtime Logs en de laatste deploymentstatus.
3. Exporteer de productiedatabase en bewaar het bestand versleuteld op een locatie met beperkte toegang.
4. Test met het adminaccount: inloggen, één leaderboardlezing en de beheerpagina openen.
5. Voer een uitslag pas in nadat deze door de organisatie bevestigd is. Controleer daarna score en auditlog.

De gratis Supabase-laag heeft geen automatische backups. Dagelijkse exports zijn daarom een verplichte operationele stap.

## Uitslag corrigeren

Open `/admin`, kies bij het juiste onderdeel het correcte team en bevestig de wijziging. De leaderboard-RPC berekent de score bij iedere lezing opnieuw; er hoeft geen losse scoretaak te draaien. Noteer de reden van een correctie daarnaast in het organisatielogboek.

## Volledige gelijkstand

Exporteer de spelers die gelijk staan op zowel punten als correcte voorspellingen. Publiceer vooraf datum, locatie en methode van de loting. Laat minimaal twee organisatieleden aanwezig zijn en leg de trekking vast in een kort proces-verbaal.

## Incidentprocedure

- Zet bij vermoed misbruik registratie tijdelijk uit in Supabase Auth; wijzig geen bestaande voorspellingen.
- Deel nooit een service-role-key, SMTP-wachtwoord of Turnstile-secret via GitHub, Vercel-clientvariabelen of screenshots.
- Herstel databasegegevens alleen vanuit een gecontroleerde export en test dit eerst in staging.
- Als stemmen tijdelijk niet lukt, communiceer dit meteen. Verleng een sluitmoment uitsluitend na een vooraf aangekondigde, voor iedereen gelijke beslissing van de organisatie.

## Gegevens verwijderen op 1 oktober 2026

1. Maak desgewenst een anonieme eindstand zonder user-id, naam, e-mail, avatarpad of andere identificatoren.
2. Verwijder alle objecten uit de bucket `avatars`.
3. Verwijder Auth-users via het beveiligde Supabase-dashboard of een server-side beheerscript.
4. Controleer door de cascade dat profielen en voorspellingen weg zijn.
5. Verwijder exports met persoonsgegevens en controleer logs/bewaartermijnen van de gebruikte diensten.
6. Leg datum, uitvoerder en controle vast in het organisatielogboek.
