import { KeyRound, ShieldCheck } from "lucide-react";
import { CasinoCard, PrimaryButton } from "@/components/ui";

export const metadata = { title: "Herstellink bevestigen" };

interface RecoveryLinkPageProps {
  searchParams: Promise<{
    token_hash?: string;
    type?: string;
  }>;
}

export default async function RecoveryLinkPage({ searchParams }: RecoveryLinkPageProps) {
  const { token_hash: tokenHash, type } = await searchParams;
  const isValidRequest = Boolean(tokenHash && type === "recovery");

  return (
    <CasinoCard className="form-card">
      <header className="form-intro">
        <ShieldCheck size={34} aria-hidden="true" />
        <h1>Wachtwoord herstellen</h1>
        <p>Bevestig dat je een nieuw wachtwoord wilt instellen.</p>
      </header>

      {isValidRequest ? (
        <form className="form-stack" action="/auth/confirm" method="post">
          <input type="hidden" name="token_hash" value={tokenHash} />
          <input type="hidden" name="type" value="recovery" />
          <p className="notice notice--warning">
            Deze beveiligde link kan maar één keer worden gebruikt.
          </p>
          <PrimaryButton type="submit">
            <KeyRound size={19} />
            Doorgaan
          </PrimaryButton>
        </form>
      ) : (
        <p className="form-error form-error--summary" role="alert">
          Deze herstellink is onvolledig. Vraag een nieuwe link aan.
        </p>
      )}
    </CasinoCard>
  );
}
