export function getDutchAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) return "Het e-mailadres of wachtwoord is onjuist.";
  if (normalized.includes("email not confirmed")) return "Bevestig eerst je e-mailadres via de ontvangen e-mail.";
  if (normalized.includes("user already registered")) return "Er bestaat al een account met dit e-mailadres.";
  if (normalized.includes("password should be")) return "Het wachtwoord moet minimaal 8 tekens bevatten.";
  if (normalized.includes("new password should be different")) return "Kies een ander wachtwoord dan je huidige wachtwoord.";
  if (normalized.includes("email rate limit")) return "Er zijn te veel e-mails aangevraagd. Probeer het later opnieuw.";
  if (normalized.includes("error sending confirmation email")) return "De bevestigingsmail kon niet worden verstuurd. Probeer het later opnieuw.";
  if (normalized.includes("captcha")) return "De botcontrole is verlopen. Probeer het opnieuw.";
  if (normalized.includes("database error saving new user") || normalized.includes("database error creating new user")) return "Deze gebruikersnaam is al bezet.";
  if (normalized.includes("failed to fetch") || normalized.includes("network")) return "De verbinding met de server is mislukt. Controleer je internetverbinding en probeer het opnieuw.";
  if (normalized.includes("supabase is nog niet geconfigureerd")) return message;
  return "Er ging iets mis. Probeer het opnieuw.";
}
