"use client";

import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  return {
    session,
    isAuthenticated,
    isLoading,
    user: session?.user,
  };
}
