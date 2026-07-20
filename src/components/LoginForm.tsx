"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { FormField } from "@/components/FormField";
import { PrimaryButton } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!identity.trim()) nextErrors.identity = "Vul je e-mailadres of gebruikersnaam in.";
    if (!password) nextErrors.password = "Vul je wachtwoord in.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // TODO: vervang dit door Supabase Auth en toon de foutcode als Nederlandse melding.
    login(identity.trim());
    const redirectTo = searchParams.get("redirect");
    router.replace(redirectTo?.startsWith("/") ? redirectTo : "/voorspellingen");
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit} noValidate>
      <FormField id="identity" label="E-mailadres of gebruikersnaam" autoComplete="username" value={identity} onChange={(event) => setIdentity(event.target.value)} error={errors.identity} />
      <FormField
        id="password"
        label="Wachtwoord"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        trailing={<button type="button" className="field-trailing" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Wachtwoord verbergen" : "Wachtwoord tonen"}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>}
      />
      <PrimaryButton type="submit"><LogIn size={19} />Inloggen</PrimaryButton>
      <p className="form-footer">Nog geen account? <Link href="/registreren" className="text-link">Account aanmaken</Link></p>
    </form>
  );
}
