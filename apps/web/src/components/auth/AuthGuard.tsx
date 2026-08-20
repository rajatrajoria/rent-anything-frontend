"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Client-side route protection. Deliberately not middleware: Next.js edge
 * middleware can't read localStorage or in-memory JS state, and tokens are
 * never in cookies (the backend returns them in the response body), so a
 * middleware-based gate here would be security theater. This renders a
 * skeleton until the initial silent-refresh attempt finishes, then redirects
 * unauthenticated visitors to /login.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  React.useEffect(() => {
    if (hasHydrated && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [hasHydrated, user, pathname, router]);

  if (!hasHydrated || !user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return <>{children}</>;
}
