import type { Metadata } from "next";
import { CasinoCard } from "@/components/ui";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <article className="legal-page">
      <header className="page-heading">
        <p className="eyebrow">Jouw gegevens</p>
        <h1>Privacy</h1>
        <p>We gebruiken alleen de gegevens die nodig zijn om Broek Royale TOTO veilig en eerlijk te laten verlopen.</p>
      </header>
      <CasinoCard>
        <h2>Welke gegevens verwerken we?</h2>
        <p>Bij registratie bewaren we je voornaam, achternaam, e-mailadres, gebruikersnaam, versleutelde accountgegevens, eventuele profielfoto en je voorspellingen. Ook kunnen noodzakelijke technische beveiligingsgegevens, zoals IP- en loggegevens, tijdelijk door onze dienstverleners worden verwerkt.</p>
      </CasinoCard>
      <CasinoCard>
        <h2>Wat is openbaar?</h2>
        <p>Op het openbare leaderboard zijn uitsluitend je <strong>gebruikersnaam, eventuele profielfoto, score, positie en aantal correcte voorspellingen</strong> zichtbaar. Je echte naam en e-mailadres worden daar nooit getoond.</p>
      </CasinoCard>
      <CasinoCard>
        <h2>Doel, bewaartermijn en diensten</h2>
        <p>De gegevens worden gebruikt voor accountbeheer, voorspellingen, puntentelling, misbruikpreventie en wachtwoordherstel. De app gebruikt Supabase voor accounts, database en foto-opslag en Vercel voor hosting. Zodra accountmails worden geactiveerd, gebruikt de app daarnaast Resend voor het bezorgen daarvan.</p>
        <p>Uiterlijk <strong>1 oktober 2026</strong> verwijderen we persoonsgegevens, Auth-accounts, voorspellingen en profielfoto’s. Alleen een niet tot personen herleidbare eindstand mag daarna bewaard blijven.</p>
      </CasinoCard>
      <CasinoCard>
        <h2>Contact en jouw rechten</h2>
        <p>Wil je je gegevens inzien, corrigeren of eerder laten verwijderen? Mail dan naar <a href="mailto:koen-dorreboom@hotmail.nl">koen-dorreboom@hotmail.nl</a>. Je kunt ook bezwaar maken tegen de verwerking of een klacht indienen bij de Autoriteit Persoonsgegevens.</p>
      </CasinoCard>
      <p className="legal-updated">Versie 1.0 · 2 augustus 2026</p>
    </article>
  );
}
