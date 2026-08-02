export function getDutchAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) return "Het e-mailadres of wachtwoord is onjuist.";
  if (normalized.includes("user already registered")) return "Er bestaat al een account met dit e-mailadres.";
  if (normalized.includes("password should be")) return "Het wachtwoord moet minimaal 8 tekens bevatten.";
  if (normalized.includes("email rate limit")) return "Er zijn te veel e-mails aangevraagd. Probeer het later opnieuw.";
  if (normalized.includes("captcha")) return "De botcontrole is verlopen. Probeer het opnieuw.";
  if (normalized.includes("database error saving new user")) return "Deze gebruikersnaam is al bezet.";
  if (normalized.includes("supabase is nog niet geconfigureerd")) return message;
  return "Er ging iets mis. Probeer het opnieuw.";
}
