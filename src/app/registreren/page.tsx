import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { RegisterForm } from "@/components/RegisterForm";
import { CasinoCard } from "@/components/ui";

export const metadata = { title: "Account aanmaken" };

export default function RegisterPage() {
  return (
    <>
      <Link href="/" className="auth-back"><ArrowLeft size={22} />Broek Royale TOTO</Link>
      <CasinoCard className="form-card">
        <header className="form-intro">
          <UserPlus size={34} aria-hidden="true" />
          <h1>Account aanmaken</h1>
          <p>Registreer je gegevens om mee te doen.</p>
        </header>
        <RegisterForm />
      </CasinoCard>
    </>
  );
}
