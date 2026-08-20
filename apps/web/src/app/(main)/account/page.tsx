"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@rent-anything/api-client";
import { useAuthStore } from "@/lib/auth-store";
import { ProfileSummary } from "@/components/account/ProfileSummary";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";

export default function AccountPage() {
  const router = useRouter();
  const clear = useAuthStore((s) => s.clear);
  const { data: user, isLoading } = useQuery({ queryKey: ["me"], queryFn: usersApi.getMe });

  async function handleLogoutAll() {
    await usersApi.logoutAll();
    clear();
    toast.success("Logged out of every device.");
    router.push("/login");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
      {isLoading || !user ? <Skeleton className="h-48 w-full" /> : <ProfileSummary user={user} />}
      <ChangePasswordForm />
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Log out of every device this account is signed into.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" onClick={handleLogoutAll}>
            Log out everywhere
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
