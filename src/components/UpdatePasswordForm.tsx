"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { FormField } from "@/components/FormField";
import { PrimaryButton } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";

export function UpdatePasswordForm() {
  const { updatePassword } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      setError("Het wachtwoord moet minimaal 8 tekens bevatten.");
      return;
    }
    if (password !== confirmPassword) {
      setError("De wachtwoorden zijn niet gelijk.");
      return;
    }
    setIsSubmitting(true);
    const authError = await updatePassword(password);
    setIsSubmitting(false);
    if (authError) {
      setError(authError);
      return;
    }
    router.replace("/profiel");
    router.refresh();
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit} noValidate>
      <FormField id="new-password" label="Nieuw wachtwoord" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
      <FormField id="new-password-confirm" label="Nieuw wachtwoord herhalen" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} error={error || undefined} />
      <PrimaryButton type="submit" disabled={isSubmitting}><KeyRound size={19} />{isSubmitting ? "Wachtwoord opslaan…" : "Wachtwoord opslaan"}</PrimaryButton>
    </form>
  );
}
