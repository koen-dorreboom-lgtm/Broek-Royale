"use client";

import { FormEvent, useCallback, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { FormField } from "@/components/FormField";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { PrimaryButton } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";

export function LoginForm() {
  const { login, configurationError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string>();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const callbackError = searchParams.get("fout");
  const handleCaptchaToken = useCallback((token: string | undefined) => setCaptchaToken(token), []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!email.trim()) nextErrors.email = "Vul je e-mailadres in.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Vul een geldig e-mailadres in.";
    if (!password) nextErrors.password = "Vul je wachtwoord in.";
    if (configurationError) nextErrors.form = configurationError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    const authError = await login(email.trim(), password, captchaToken);
    setIsSubmitting(false);
    if (authError) {
      setErrors({ form: authError });
      return;
    }
    const redirectTo = searchParams.get("redirect");
    router.replace(redirectTo?.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/voorspellingen");
    router.refresh();
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit} noValidate>
      <FormField id="email" label="E-mailadres" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} error={errors.email} />
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
      <div className="form-inline-link"><Link href="/wachtwoord-vergeten" className="text-link">Wachtwoord vergeten?</Link></div>
      <TurnstileWidget action="login" onToken={handleCaptchaToken} />
      {(errors.form || callbackError) && <p className="form-error form-error--summary" role="alert">{errors.form || callbackError}</p>}
      <PrimaryButton type="submit" disabled={isSubmitting}><LogIn size={19} />{isSubmitting ? "Bezig met inloggen…" : "Inloggen"}</PrimaryButton>
      <p className="form-footer">Nog geen account? <Link href="/registreren" className="text-link">Account aanmaken</Link></p>
    </form>
  );
}
