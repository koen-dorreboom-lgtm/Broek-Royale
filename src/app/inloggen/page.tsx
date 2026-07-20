import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/LoginForm";
import { CasinoCard } from "@/components/ui";

export const metadata = { title: "Inloggen" };

export default function LoginPage() {
  return (
    <>
      <Link href="/" className="auth-back"><ArrowLeft size={22} />Broek Royale TOTO</Link>
      <CasinoCard className="form-card">
        <header className="form-intro">
          <ShieldCheck size={34} aria-hidden="true" />
          <h1>Inloggen</h1>
          <p>Neem plaats aan de speeltafel.</p>
        </header>
        <Suspense fallback={<p>Formulier laden…</p>}><LoginForm /></Suspense>
      </CasinoCard>
    </>
  );
}
