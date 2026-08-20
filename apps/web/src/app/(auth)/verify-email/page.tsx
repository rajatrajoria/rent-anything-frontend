"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authApi, ApiClientError, messageFor } from "@rent-anything/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={null}>
      <VerifyEmailContent />
    </React.Suspense>
  );
}

type Status = "verifying" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = React.useState<Status>(() => (token ? "verifying" : "error"));
  const [message, setMessage] = React.useState<string | null>(() =>
    token ? null : "This verification link is missing its token."
  );

  React.useEffect(() => {
    if (!token) return;
    authApi
      .verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof ApiClientError ? messageFor(err) : "This link may have expired.");
      });
  }, [token]);

  return (
    <Card>
      <CardHeader>
        {status === "verifying" && <CardTitle>Verifying your email...</CardTitle>}
        {status === "success" && (
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="h-5 w-5" />
            <CardTitle>Email verified</CardTitle>
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            <CardTitle>Verification failed</CardTitle>
          </div>
        )}
        <CardDescription>
          {status === "success" && "You can now log in to your account."}
          {status === "error" && (message ?? "Please request a new verification link.")}
        </CardDescription>
      </CardHeader>
      {status !== "verifying" && (
        <>
          <CardContent />
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/login">Go to login</Link>
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
