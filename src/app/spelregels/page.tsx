import type { Metadata } from "next";
import { CasinoCard } from "@/components/ui";

export const metadata: Metadata = { title: "Spelregels" };

export default function RulesPage() {
  return (
    <article className="legal-page">
      <header className="page-heading">
        <p className="eyebrow">Broeker Feestweek 2026</p>
        <h1>Spelregels</h1>
        <p>Meedoen is gratis. Voorspel de winnaars, verzamel punten en speel mee voor de hoofdprijs.</p>
      </header>
      <CasinoCard>
        <h2>Zo werkt het</h2>
        <ol>
          <li>Je maakt één persoonlijk account aan en kiest per onderdeel welk team volgens jou wint.</li>
          <li>Een onderdeel levert <strong>100 punten</strong> op bij een juiste voorspelling.</li>
          <li>De voorspelling voor de algehele Feestweekwinnaar levert <strong>250 punten</strong> op.</li>
          <li>Je mag een voorspelling onbeperkt wijzigen totdat het betreffende sluitmoment is bereikt.</li>
          <li>Vanaf het sluitmoment weigert de centrale database iedere nieuwe of gewijzigde voorspelling.</li>
        </ol>
      </CasinoCard>
      <CasinoCard>
        <h2>Sluitmomenten en uitslagen</h2>
        <p>Elk onderdeel sluit exact op de gepubliceerde starttijd in de tijdzone Europe/Amsterdam. De voorspelling voor de algehele winnaar sluit zaterdag 8 augustus 2026 om 17:30.</p>
        <p>De organisatie voert na ieder onderdeel de officiële winnaar in. Een aantoonbare invoerfout kan worden gecorrigeerd; de stand wordt dan automatisch opnieuw berekend en de wijziging wordt gelogd.</p>
      </CasinoCard>
      <CasinoCard>
        <h2>Ranglijst en prijs</h2>
        <p>De rangorde wordt eerst bepaald door het aantal punten en daarna door het aantal correct voorspelde onderdelen. Volledig gelijke spelers delen in de app dezelfde positie.</p>
        <p>Er is één hoofdprijs voor de uiteindelijke nummer één. Zijn meerdere spelers volledig gelijk op punten én correcte voorspellingen, dan verricht de organisatie een transparante loting onder deze spelers.</p>
      </CasinoCard>
      <p className="legal-updated">Versie 1.0 · 2 augustus 2026</p>
    </article>
  );
}
