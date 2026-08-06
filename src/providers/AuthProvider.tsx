"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import { getProfile, isUsernameAvailable } from "@/lib/api";
import { getDutchAuthError } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import type { User } from "@/types";

interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  captchaToken?: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  configurationError: string | null;
  login: (email: string, password: string, captchaToken?: string) => Promise<string | null>;
  register: (input: RegisterInput) => Promise<string | null>;
  requestPasswordReset: (email: string, captchaToken?: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(hasSupabaseConfig);
  const configurationError = hasSupabaseConfig
    ? null
    : "De centrale database is nog niet geconfigureerd. Voeg de Supabase-omgevingsvariabelen toe.";

  const loadUser = useCallback(async (authUser: SupabaseAuthUser | null) => {
    if (!authUser) {
      setUser(null);
      return;
    }
    const profile = await getProfile(authUser.id, authUser.email ?? "");
    setUser(profile);
  }, []);

  useEffect(() => {
    if (!hasSupabaseConfig) {
      return;
    }

    const supabase = createClient();
    let isMounted = true;
    void supabase.auth.getUser().then(async ({ data }) => {
      try {
        if (isMounted) await loadUser(data.user);
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        void loadUser(session?.user ?? null).catch(() => setUser(null));
      }, 0);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string, captchaToken?: string) => {
    try {
      const { data, error } = await createClient().auth.signInWithPassword({
        email,
        password,
        options: captchaToken ? { captchaToken } : undefined,
      });
      if (error) return getDutchAuthError(error.message);
      await loadUser(data.user);
      return null;
    } catch (error) {
      return getDutchAuthError(error instanceof Error ? error.message : "Onbekende fout");
    }
  }, [loadUser]);

  const register = useCallback(async (input: RegisterInput) => {
    try {
      if (!(await isUsernameAvailable(input.username))) return "Deze gebruikersnaam is al bezet.";
      const { data, error } = await createClient().auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            first_name: input.firstName,
            last_name: input.lastName,
            username: input.username,
          },
          captchaToken: input.captchaToken,
        },
      });
      if (error) return getDutchAuthError(error.message);
      if (!data.session) {
        return "Je account is aangemaakt, maar wacht nog op e-mailbevestiging. Controleer je inbox.";
      }
      if (data.user) await loadUser(data.user);
      return null;
    } catch (error) {
      return getDutchAuthError(error instanceof Error ? error.message : "Onbekende fout");
    }
  }, [loadUser]);

  const requestPasswordReset = useCallback(async (email: string, captchaToken?: string) => {
    try {
      const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, "");
      const { error } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/herstellen`,
        captchaToken,
      });
      return error ? getDutchAuthError(error.message) : null;
    } catch (error) {
      return getDutchAuthError(error instanceof Error ? error.message : "Onbekende fout");
    }
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    try {
      const { error } = await createClient().auth.updateUser({ password });
      return error ? getDutchAuthError(error.message) : null;
    } catch (error) {
      return getDutchAuthError(error instanceof Error ? error.message : "Onbekende fout");
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!hasSupabaseConfig) return;
    const { data } = await createClient().auth.getUser();
    await loadUser(data.user);
  }, [loadUser]);

  const logout = useCallback(async () => {
    if (hasSupabaseConfig) await createClient().auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      configurationError,
      login,
      register,
      requestPasswordReset,
      updatePassword,
      refreshProfile,
      logout,
    }),
    [user, isLoading, configurationError, login, register, requestPasswordReset, updatePassword, refreshProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth moet binnen AuthProvider worden gebruikt");
  return context;
}
