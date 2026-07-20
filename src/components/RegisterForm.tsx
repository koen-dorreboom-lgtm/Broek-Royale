"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { FormField } from "@/components/FormField";
import { PrimaryButton } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

const initialValues: FormValues = { firstName: "", lastName: "", email: "", username: "", password: "", confirmPassword: "" };

export function RegisterForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  function update(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof FormValues, string>> = {};
    if (!values.firstName.trim()) nextErrors.firstName = "Vul je voornaam in.";
    if (!values.lastName.trim()) nextErrors.lastName = "Vul je achternaam in.";
    if (!values.email.trim()) nextErrors.email = "Vul je e-mailadres in.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) nextErrors.email = "Vul een geldig e-mailadres in.";
    if (!values.username.trim()) nextErrors.username = "Vul een gebruikersnaam in.";
    else if (values.username.trim().length < 3) nextErrors.username = "Je gebruikersnaam moet minimaal 3 tekens bevatten.";
    if (!values.password) nextErrors.password = "Vul een wachtwoord in.";
    else if (values.password.length < 8) nextErrors.password = "Je wachtwoord moet minimaal 8 tekens bevatten.";
    if (!values.confirmPassword) nextErrors.confirmPassword = "Herhaal je wachtwoord.";
    else if (values.password !== values.confirmPassword) nextErrors.confirmPassword = "De wachtwoorden zijn niet gelijk.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // TODO: vervang registratie en sessieopslag door Supabase Auth + profiles-tabel.
    register({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      username: values.username.trim(),
    });
    router.replace("/voorspellingen");
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit} noValidate>
      <FormField id="firstName" label="Voornaam" autoComplete="given-name" value={values.firstName} onChange={(event) => update("firstName", event.target.value)} error={errors.firstName} />
      <FormField id="lastName" label="Achternaam" autoComplete="family-name" value={values.lastName} onChange={(event) => update("lastName", event.target.value)} error={errors.lastName} />
      <FormField id="email" label="E-mailadres" type="email" autoComplete="email" value={values.email} onChange={(event) => update("email", event.target.value)} error={errors.email} />
      <FormField id="username" label="Gebruikersnaam" autoComplete="username" minLength={3} value={values.username} onChange={(event) => update("username", event.target.value)} error={errors.username} />
      <FormField
        id="registerPassword"
        label="Wachtwoord"
        type={showPassword ? "text" : "password"}
        autoComplete="new-password"
        value={values.password}
        onChange={(event) => update("password", event.target.value)}
        error={errors.password}
        trailing={<button type="button" className="field-trailing" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Wachtwoorden verbergen" : "Wachtwoorden tonen"}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>}
      />
      <FormField id="confirmPassword" label="Wachtwoord herhalen" type={showPassword ? "text" : "password"} autoComplete="new-password" value={values.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} error={errors.confirmPassword} />
      <PrimaryButton type="submit"><UserPlus size={19} />Account aanmaken</PrimaryButton>
      <p className="form-footer">Heb je al een account? <Link href="/inloggen" className="text-link">Log in</Link></p>
    </form>
  );
}
