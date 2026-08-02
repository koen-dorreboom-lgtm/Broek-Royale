import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { PasswordResetRequestForm } from "@/components/PasswordResetRequestForm";
import { CasinoCard } from "@/components/ui";

export const metadata = { title: "Wachtwoord vergeten" };

export default function ForgotPasswordPage() {
  return (
    <>
      <Link href="/inloggen" className="auth-back"><ArrowLeft size={22} />Terug naar inloggen</Link>
      <CasinoCard className="form-card">
        <header className="form-intro"><MailCheck size={34} aria-hidden="true" /><h1>Wachtwoord herstellen</h1><p>Ontvang een veilige herstellink per e-mail.</p></header>
        <PasswordResetRequestForm />
      </CasinoCard>
    </>
  );
}
