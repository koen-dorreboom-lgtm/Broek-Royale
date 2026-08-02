"use client";

import { FormEvent, useCallback, useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { FormField } from "@/components/FormField";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { InlineSuccess, PrimaryButton } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";

export function PasswordResetRequestForm() {
  const { requestPasswordReset, configurationError } = useAuth();
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string>();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const handleCaptchaToken = useCallback((token: string | undefined) => setCaptchaToken(token), []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Vul een geldig e-mailadres in.");
      return;
    }
    if (configurationError) {
      setError(configurationError);
      return;
    }
    setError("");
    setIsSubmitting(true);
    const authError = await requestPasswordReset(email.trim(), captchaToken);
    setIsSubmitting(false);
    if (authError) setError(authError);
    else setIsSent(true);
  }

  if (isSent) {
    return <><InlineSuccess>Als dit account bestaat, is een herstellink verstuurd.</InlineSuccess><p className="form-footer"><Link href="/inloggen" className="text-link">Terug naar inloggen</Link></p></>;
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit} noValidate>
      <FormField id="reset-email" label="E-mailadres" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} error={error || undefined} />
      <TurnstileWidget action="password-reset" onToken={handleCaptchaToken} />
      <PrimaryButton type="submit" disabled={isSubmitting}><MailCheck size={19} />{isSubmitting ? "Link versturen…" : "Herstellink versturen"}</PrimaryButton>
    </form>
  );
}
