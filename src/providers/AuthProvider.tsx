"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { storage } from "@/lib/storage";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (identity: string) => User;
  register: (user: Omit<User, "id">) => User;
  updateProfile: (updates: Pick<User, "avatarUrl">) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hydrationTask = window.setTimeout(() => {
      setUser(storage.getUser());
      setIsLoading(false);
    }, 0);
    return () => window.clearTimeout(hydrationTask);
  }, []);

  const persistUser = useCallback((nextUser: User) => {
    storage.setUser(nextUser);
    setUser(nextUser);
    return nextUser;
  }, []);

  const login = useCallback(
    (identity: string) => {
      const existingUser = storage.getUser();
      if (existingUser) return persistUser(existingUser);

      // TODO: vervang deze mocksessie later door Supabase Auth signInWithPassword.
      const username = identity.includes("@") ? identity.split("@")[0] : identity;
      return persistUser({
        id: `mock-${username.toLowerCase().replace(/[^a-z0-9]/g, "-") || "speler"}`,
        firstName: "Broeker",
        lastName: "Speler",
        username,
        email: identity.includes("@") ? identity : `${username}@voorbeeld.nl`,
      });
    },
    [persistUser],
  );

  const register = useCallback(
    (newUser: Omit<User, "id">) =>
      persistUser({ ...newUser, id: `mock-${crypto.randomUUID()}` }),
    [persistUser],
  );

  const logout = useCallback(() => {
    storage.clearUser();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    (updates: Pick<User, "avatarUrl">) => {
      if (!user) return;
      persistUser({ ...user, ...updates });
    },
    [user, persistUser],
  );

  const value = useMemo(
    () => ({ user, isLoading, login, register, updateProfile, logout }),
    [user, isLoading, login, register, updateProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth moet binnen AuthProvider worden gebruikt");
  return context;
}
