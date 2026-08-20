"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  React.useEffect(() => {
    if (hasHydrated && user) {
      router.replace("/");
    }
  }, [hasHydrated, user, router]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <Link href="/" className="mb-8 text-xl font-semibold tracking-tight text-primary">
        Rent Anything
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
