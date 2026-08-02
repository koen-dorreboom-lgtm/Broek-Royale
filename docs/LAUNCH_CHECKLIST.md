# Lancering Broek Royale TOTO

Deze checklist bevat de handelingen die niet vanuit de broncode uitgevoerd kunnen worden. Vink ieder punt af in zowel staging als productie waar dat van toepassing is.

## Uiterlijk 3 augustus

- [x] `broekroyale.nl` is geregistreerd bij STRATO; wacht op afronding voordat DNS, Resend en productie-redirects worden ingesteld.
- [ ] Laat de organisatie schriftelijk bevestigen dat naam, logo, casinostijl en het gebruik van “TOTO” akkoord zijn.
- [ ] Maak twee Supabase-projecten: staging en productie.
- [ ] Voer de migration uit en laad `supabase/seed.sql` in beide projecten.
- [ ] Maak via Supabase Auth het account `koen-dorreboom@hotmail.nl` aan en controleer dat `profiles.role = 'admin'` is.
- [ ] Zet e-mailbevestiging uit. Activeer Cloudflare Turnstile alleen als aanvullende botbescherming gewenst blijkt.
- [ ] Koppel GitHub-repository `koen-dorreboom-lgtm/Broek-Royale` aan Vercel. Kies `main` als Production Branch.
- [ ] Zet Preview-variabelen op het stagingproject en Production-variabelen op het productieproject.

## Uiterlijk 5 augustus

- [ ] Vul de definitieve teamnamen en het definitieve programma in en voer de aangepaste seed uit.
- [ ] Configureer Resend Custom SMTP in Supabase voor wachtwoordherstel.
- [ ] Verifieer het verzenddomein en publiceer SPF, DKIM en DMARC.
- [ ] Koppel het domein aan Vercel en forceer de HTTPS/`www`-redirect volgens de gekozen hoofddomeinnaam.
- [ ] Stel Supabase `SITE_URL` in op het productiedomein.
- [ ] Voeg localhost en `https://*-<vercel-team>.vercel.app/**` toe aan Redirect URLs voor lokaal en Preview.
- [ ] Controleer `/spelregels` en `/privacy` met de organisatie, inclusief hoofdprijs en contactgegevens.

## Generale repetitie op 6 augustus

- [ ] Test registratie, unieke gebruikersnaam, login, logout en wachtwoordherstel. Test Turnstile alleen wanneer deze optie wordt geactiveerd.
- [ ] Test 10–20 echte telefoons op 320, 375, 390 en 430 pixels; iOS Safari en Android Chrome.
- [ ] Test een voorspelling vóór en vanaf het startmoment met een tijdelijk stagingonderdeel.
- [ ] Test uitslag, uitslagcorrectie, auditlog, punten, gelijke rang en avatarrechten.
- [ ] Controleer dat een deelnemer `/admin` niet kan openen en rechtstreeks via de Supabase API geen beheermutatie kan uitvoeren.
- [ ] Voer de loadtest uit met 500 seedgebruikers, 100 gelijktijdige leaderboardlezers en 50 stemopslagen.

## Productievrijgave 7–8 augustus

- [ ] Laat GitHub Actions (`lint` en `build`) slagen en controleer de Vercel Preview.
- [ ] Maak een database-export en merge de release naar `main`.
- [ ] Bevries code en productiegegevens, behoudens noodzakelijke incidentfixes en officiële uitslagen.
- [ ] Controleer op 8 augustus vóór 12:00 domein, HTTPS, registratie, adminlogin, voorspelling en leaderboard.
- [ ] Open productie ruim vóór het eerste sluitmoment om 17:30 Europe/Amsterdam.

Een release is pas akkoord als CI, migrations, RLS-tests, mobiele smoke-test en adminrepetitie allemaal geslaagd zijn.
