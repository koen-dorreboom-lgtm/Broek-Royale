import { KeyRound } from "lucide-react";
import { UpdatePasswordForm } from "@/components/UpdatePasswordForm";
import { CasinoCard } from "@/components/ui";

export const metadata = { title: "Wachtwoord wijzigen" };

export default function UpdatePasswordPage() {
  return (
    <CasinoCard className="form-card">
      <header className="form-intro"><KeyRound size={34} aria-hidden="true" /><h1>Nieuw wachtwoord</h1><p>Kies een nieuw wachtwoord van minimaal 8 tekens.</p></header>
      <UpdatePasswordForm />
    </CasinoCard>
  );
}
