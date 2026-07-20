import type { Prediction, User } from "@/types";

const AUTH_KEY = "broek-royale:auth-user";
const PREDICTIONS_PREFIX = "broek-royale:predictions:";
const RESULTS_KEY = "broek-royale:results";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const storage = {
  getUser: () => readJson<User | null>(AUTH_KEY, null),
  setUser: (user: User) => writeJson(AUTH_KEY, user),
  clearUser: () => {
    try {
      window.localStorage.removeItem(AUTH_KEY);
    } catch {
      // De app blijft bruikbaar wanneer opslag is uitgeschakeld.
    }
  },
  getPredictions: (userId: string) =>
    readJson<Prediction[]>(`${PREDICTIONS_PREFIX}${userId}`, []),
  setPredictions: (userId: string, predictions: Prediction[]) =>
    writeJson(`${PREDICTIONS_PREFIX}${userId}`, predictions),
  getResults: () => readJson<Record<string, string>>(RESULTS_KEY, {}),
  setResults: (results: Record<string, string>) => writeJson(RESULTS_KEY, results),
};
