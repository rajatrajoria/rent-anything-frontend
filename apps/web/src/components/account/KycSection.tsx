"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  COUNTRY_OPTIONS,
  ID_DOCUMENT_TYPE_OPTIONS,
  type IdDocumentType,
} from "@rent-anything/types";
import { kycApi, ApiClientError, messageFor } from "@rent-anything/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

const EMPTY_FORM = {
  legalName: "",
  dateOfBirth: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: COUNTRY_OPTIONS[0]!.code,
  idDocumentType: ID_DOCUMENT_TYPE_OPTIONS[0]!.value as IdDocumentType,
};

export function KycSection() {
  const { data: submission, isLoading } = useQuery({ queryKey: ["kyc", "me"], queryFn: kycApi.getMyKycSubmission });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Identity verification</CardTitle>
        </CardHeader>
        <CardContent className="h-24 animate-pulse rounded-md bg-muted" />
      </Card>
    );
  }

  if (submission?.status === "APPROVED") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Identity verification</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="confirmed" className="gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified
          </Badge>
        </CardContent>
      </Card>
    );
  }

  if (submission?.status === "PENDING") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Identity verification</CardTitle>
          <CardDescription>Submitted {new Date(submission.createdAt).toLocaleDateString()}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="review">
            <AlertTitle>Under review</AlertTitle>
            <AlertDescription>
              We&apos;re reviewing your documents. This is usually quick — check back soon.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return <KycForm rejectionReason={submission?.status === "REJECTED" ? submission.rejectionReason : null} />;
}

function KycForm({ rejectionReason }: { rejectionReason: string | null }) {
  const queryClient = useQueryClient();
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [idDocument, setIdDocument] = React.useState<File | null>(null);
  const [selfie, setSelfie] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const submitMutation = useMutation({
    mutationFn: () => {
      if (!idDocument || !selfie) throw new Error("Both documents are required.");
      return kycApi.submitKyc(
        {
          legalName: form.legalName,
          dateOfBirth: form.dateOfBirth,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2 || undefined,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
          idDocumentType: form.idDocumentType,
        },
        idDocument,
        selfie
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc", "me"] });
    },
    onError: (err) => {
      setError(err instanceof ApiClientError ? messageFor(err) : "Couldn't submit your verification. Please try again.");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identity verification</CardTitle>
        <CardDescription>
          Verify your identity to be able to list items and make bookings.
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          if (!idDocument || !selfie) {
            setError("Both a document photo and a selfie are required.");
            return;
          }
          submitMutation.mutate();
        }}
      >
        <CardContent className="space-y-4">
          {rejectionReason && (
            <Alert variant="destructive">
              <AlertTitle>Verification rejected</AlertTitle>
              <AlertDescription>{rejectionReason} — you can resubmit below.</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="legalName">Legal name</Label>
            <Input
              id="legalName"
              required
              value={form.legalName}
              onChange={(e) => set("legalName", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              required
              value={form.dateOfBirth}
              onChange={(e) => set("dateOfBirth", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address</Label>
            <Input
              id="addressLine1"
              required
              placeholder="Street address"
              value={form.addressLine1}
              onChange={(e) => set("addressLine1", e.target.value)}
            />
            <Input
              placeholder="Apartment, suite, etc. (optional)"
              value={form.addressLine2}
              onChange={(e) => set("addressLine2", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" required value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State / region</Label>
              <Input id="state" required value={form.state} onChange={(e) => set("state", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal code</Label>
              <Input
                id="postalCode"
                required
                value={form.postalCode}
                onChange={(e) => set("postalCode", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={form.country} onValueChange={(v) => set("country", v)}>
                <SelectTrigger id="country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_OPTIONS.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idDocumentType">ID document type</Label>
            <Select value={form.idDocumentType} onValueChange={(v) => set("idDocumentType", v as IdDocumentType)}>
              <SelectTrigger id="idDocumentType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ID_DOCUMENT_TYPE_OPTIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idDocument">ID document photo</Label>
            <Input
              id="idDocument"
              type="file"
              required
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setIdDocument(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="selfie">Selfie</Label>
            <Input
              id="selfie"
              type="file"
              required
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setSelfie(e.target.files?.[0] ?? null)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={submitMutation.isPending}>
            {submitMutation.isPending ? "Submitting..." : rejectionReason ? "Resubmit" : "Submit for verification"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
