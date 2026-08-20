"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { QueryClientProvider } from "@tanstack/react-query";
import { authApi, usersApi, onSessionExpired } from "@rent-anything/api-client";
import { createQueryClient } from "@/lib/query-client";
import { useAuthStore } from "@/lib/auth-store";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(createQueryClient);
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const clear = useAuthStore((s) => s.clear);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const restored = await authApi.restoreSession();
      if (restored) {
        try {
          const me = await usersApi.getMe();
          if (!cancelled) setUser(me);
        } catch {
          if (!cancelled) clear();
        }
      }
      if (!cancelled) setHydrated();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    return onSessionExpired(() => {
      clear();
      queryClient.clear();
      router.push("/login");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
