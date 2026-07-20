"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/inloggen");
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <div className="loading-state" role="status"><span className="loading-chip">♠</span><p>Speeltafel gereedmaken…</p></div>;
  }

  return children;
}
